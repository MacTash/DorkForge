/**
 * DorkForge Multi-Engine Compiler v2
 * Canonical ordering with OR sharding support
 */

import type {
    RootNode,
    QueryNode,
    RenderEngine,
    CompiledQuery,
    TermNode,
    PhraseNode,
    SiteNode,
    FiletypeNode,
    InurlNode,
    IntitleNode,
    IntextNode,
    PlatformNode,
    TimeframeNode,
    AndNode,
    OrNode,
    NotNode,
} from './ast';
import { sortByCanonicalOrder, PLATFORM_DOMAINS } from './ast';

// ============================================================================
// Engine Profile Configuration
// ============================================================================

export interface EngineProfile {
    name: string;
    maxTokensWarn: number;
    maxCharsWarn: number;
    autoQuote: boolean;
    preferSiteFirst: boolean;
    orMaxOperands: number;
    supportedOperators: string[];
    operatorMapping: Record<string, string>;
    quirks: Record<string, boolean>;
}

export const ENGINE_PROFILES: Record<RenderEngine, EngineProfile> = {
    google: {
        name: 'Google Search',
        maxTokensWarn: 32,
        maxCharsWarn: 2048,
        autoQuote: true,
        preferSiteFirst: true,
        orMaxOperands: 12,
        supportedOperators: ['site', 'filetype', 'inurl', 'intitle', 'intext', 'before', 'after', 'cache', 'related'],
        operatorMapping: {
            SITE: 'site:',
            FILETYPE: 'filetype:',
            INURL: 'inurl:',
            INTITLE: 'intitle:',
            INTEXT: 'intext:',
            BEFORE: 'before:',
            AFTER: 'after:',
        },
        quirks: {
            cacheDeprecated: true,
            orRequiresParens: true,
        },
    },
    bing: {
        name: 'Bing Search',
        maxTokensWarn: 30,
        maxCharsWarn: 1500,
        autoQuote: true,
        preferSiteFirst: true,
        orMaxOperands: 10,
        supportedOperators: ['site', 'filetype', 'inurl', 'intitle', 'inbody'],
        operatorMapping: {
            SITE: 'site:',
            FILETYPE: 'filetype:',
            INURL: 'inurl:',
            INTITLE: 'intitle:',
            INTEXT: 'inbody:', // Bing uses inbody instead of intext
            BEFORE: '',
            AFTER: '',
        },
        quirks: {
            intextToInbody: true,
            noTemporalOperators: true,
        },
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        maxTokensWarn: 25,
        maxCharsWarn: 1000,
        autoQuote: true,
        preferSiteFirst: true,
        orMaxOperands: 8,
        supportedOperators: ['site', 'filetype', 'inurl', 'intitle'],
        operatorMapping: {
            SITE: 'site:',
            FILETYPE: 'filetype:',
            INURL: 'inurl:',
            INTITLE: 'intitle:',
            INTEXT: '', // Not supported
            BEFORE: '',
            AFTER: '',
        },
        quirks: {
            noIntext: true,
            noTemporalOperators: true,
            limitedOrSupport: true,
        },
    },
};

const SEARCH_URLS: Record<RenderEngine, string> = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
};

// ============================================================================
// Render Options
// ============================================================================

export interface RenderOptions {
    engine: RenderEngine;
    shardingEnabled: boolean;
    shardBatchSize: number;
    canonicalOrdering: boolean;
}

const DEFAULT_OPTIONS: RenderOptions = {
    engine: 'google',
    shardingEnabled: false,
    shardBatchSize: 12,
    canonicalOrdering: true,
};

// ============================================================================
// Canonical Ordering Renderer
// ============================================================================

/**
 * Canonical ordering rationale:
 * SITE first - narrows search space immediately (most impactful filter)
 * FILETYPE next - reduces by document type
 * STRUCTURAL (INURL/INTITLE/INTEXT) - filters within document structure
 * PHRASE/TERM - actual search keywords
 * TIMEFRAME - temporal constraints
 * NOT - exclusions applied last to final result set
 */

export class DorkCompiler {
    private profile: EngineProfile;
    private options: RenderOptions;
    private warnings: string[];

    constructor(options: Partial<RenderOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.profile = ENGINE_PROFILES[this.options.engine];
        this.warnings = [];
    }

    /**
     * Compile AST to query string with canonical ordering
     */
    compile(root: RootNode): CompiledQuery {
        this.warnings = [];

        // Sort children by canonical order if enabled
        const children = this.options.canonicalOrdering
            ? sortByCanonicalOrder(root.children)
            : root.children;

        // Check for OR sharding requirement
        const shardResult = this.checkSharding(children);
        if (shardResult.shouldShard) {
            return this.compileSharded(children, shardResult.shardableNode!);
        }

        // Normal compilation
        const parts = children.map(node => this.renderNode(node)).filter(Boolean);
        const query = parts.join(' ');

        return {
            engine: this.options.engine,
            query,
            searchUrl: SEARCH_URLS[this.options.engine] + encodeURIComponent(query),
            warnings: [...this.warnings],
        };
    }

    /**
     * Check if sharding is required for large OR lists
     */
    private checkSharding(nodes: QueryNode[]): { shouldShard: boolean; shardableNode?: OrNode | SiteNode } {
        if (!this.options.shardingEnabled) return { shouldShard: false };

        for (const node of nodes) {
            if (node.type === 'SITE' && node.domains.length > this.profile.orMaxOperands) {
                return { shouldShard: true, shardableNode: node as SiteNode };
            }
            if (node.type === 'OR' && node.children.length > this.profile.orMaxOperands) {
                return { shouldShard: true, shardableNode: node as OrNode };
            }
        }
        return { shouldShard: false };
    }

    /**
     * Compile with sharding for large OR lists
     */
    private compileSharded(nodes: QueryNode[], shardNode: OrNode | SiteNode): CompiledQuery {
        // Render each shard
        const baseNodes = nodes.filter(n => n !== shardNode);
        const baseParts = baseNodes.map(n => this.renderNode(n)).filter(Boolean);
        const baseQuery = baseParts.join(' ');

        let shardedQueries: string[] = [];

        if (shardNode.type === 'SITE') {
            // Shard domains
            const domains = shardNode.domains;
            for (let i = 0; i < domains.length; i += this.options.shardBatchSize) {
                const batch = domains.slice(i, i + this.options.shardBatchSize);
                const siteOr = batch.map(d => `site:${d}`).join(' OR ');
                shardedQueries.push(baseQuery ? `(${siteOr}) ${baseQuery}` : `(${siteOr})`);
            }
        } else {
            // Shard OR children
            const children = shardNode.children;
            for (let i = 0; i < children.length; i += this.options.shardBatchSize) {
                const batch = children.slice(i, i + this.options.shardBatchSize);
                const orParts = batch.map(child => this.renderNode(child)).join(' OR ');
                shardedQueries.push(baseQuery ? `(${orParts}) ${baseQuery}` : `(${orParts})`);
            }
        }

        this.warnings.push(`Query sharded into ${shardedQueries.length} separate queries for reliability.`);

        return {
            engine: this.options.engine,
            query: shardedQueries[0] || '', // Primary query
            searchUrl: SEARCH_URLS[this.options.engine] + encodeURIComponent(shardedQueries[0] || ''),
            warnings: [...this.warnings],
            sharded: true,
            shardedQueries,
        };
    }

    /**
     * Render a single node to string
     */
    private renderNode(node: QueryNode): string {
        switch (node.type) {
            case 'TERM':
                return this.renderTerm(node);
            case 'PHRASE':
                return this.renderPhrase(node);
            case 'SITE':
                return this.renderSite(node);
            case 'FILETYPE':
                return this.renderFiletype(node);
            case 'INURL':
                return this.renderInurl(node);
            case 'INTITLE':
                return this.renderIntitle(node);
            case 'INTEXT':
                return this.renderIntext(node);
            case 'PLATFORM':
                return this.renderPlatform(node);
            case 'TIMEFRAME':
                return this.renderTimeframe(node);
            case 'AND':
                return this.renderAnd(node);
            case 'OR':
                return this.renderOr(node);
            case 'NOT':
                return this.renderNot(node);
            default:
                return '';
        }
    }

    private renderTerm(node: TermNode): string {
        if (node.quoted || node.value.includes(' ')) {
            return `"${node.value}"`;
        }
        return node.value;
    }

    private renderPhrase(node: PhraseNode): string {
        return `"${node.value}"`;
    }

    private renderSite(node: SiteNode): string {
        if (node.domains.length === 0) return '';
        if (node.domains.length === 1) {
            return `site:${node.domains[0]}`;
        }
        // Multiple domains = OR
        const parts = node.domains.map(d => `site:${d}`);
        if (parts.length > this.profile.orMaxOperands && !this.options.shardingEnabled) {
            this.warnings.push(`OR list has ${parts.length} items (max recommended: ${this.profile.orMaxOperands}). Results may be truncated.`);
        }
        return `(${parts.join(' OR ')})`;
    }

    private renderFiletype(node: FiletypeNode): string {
        if (node.types.length === 0) return '';
        if (node.types.length === 1) {
            return `filetype:${node.types[0]}`;
        }
        const parts = node.types.map(t => `filetype:${t}`);
        return `(${parts.join(' OR ')})`;
    }

    private maybeQuote(value: string, autoQuote: boolean = true): string {
        if (autoQuote && value.includes(' ')) {
            return `"${value}"`;
        }
        return value;
    }

    private renderInurl(node: InurlNode): string {
        if (node.values.length === 0) return '';
        const prefix = this.profile.operatorMapping.INURL;
        const parts = node.values.map(v => `${prefix}${this.maybeQuote(v, node.autoQuote)}`);
        return parts.length === 1 ? parts[0] : parts.join(' ');
    }

    private renderIntitle(node: IntitleNode): string {
        if (node.values.length === 0) return '';
        const prefix = this.profile.operatorMapping.INTITLE;
        const parts = node.values.map(v => `${prefix}${this.maybeQuote(v, node.autoQuote)}`);
        return parts.length === 1 ? parts[0] : parts.join(' ');
    }

    private renderIntext(node: IntextNode): string {
        if (node.values.length === 0) return '';
        const prefix = this.profile.operatorMapping.INTEXT;

        if (!prefix) {
            this.warnings.push(`intext: is not supported by ${this.profile.name}. Values will be used as search terms.`);
            return node.values.map(v => this.maybeQuote(v, node.autoQuote)).join(' ');
        }

        const parts = node.values.map(v => `${prefix}${this.maybeQuote(v, node.autoQuote)}`);
        return parts.length === 1 ? parts[0] : parts.join(' ');
    }

    private renderPlatform(node: PlatformNode): string {
        const domains = PLATFORM_DOMAINS[node.value];
        if (!domains || domains.length === 0) {
            this.warnings.push(`Unknown platform: ${node.value}`);
            return '';
        }

        if (domains.length === 1) {
            return `site:${domains[0]}`;
        }
        return `(${domains.map(d => `site:${d}`).join(' OR ')})`;
    }

    private renderTimeframe(node: TimeframeNode): string {
        const parts: string[] = [];

        if (node.after) {
            const prefix = this.profile.operatorMapping.AFTER;
            if (prefix) {
                parts.push(`${prefix}${node.after}`);
            } else {
                this.warnings.push(`Temporal operators not supported by ${this.profile.name}.`);
            }
        }

        if (node.before) {
            const prefix = this.profile.operatorMapping.BEFORE;
            if (prefix) {
                parts.push(`${prefix}${node.before}`);
            }
        }

        return parts.join(' ');
    }

    private renderAnd(node: AndNode): string {
        if (node.children.length === 0) return '';
        const parts = node.children.map(c => this.renderNode(c)).filter(Boolean);
        return parts.join(' '); // AND is implicit
    }

    private renderOr(node: OrNode): string {
        if (node.children.length === 0) return '';
        if (node.children.length === 1) return this.renderNode(node.children[0]);

        if (node.children.length > this.profile.orMaxOperands && !this.options.shardingEnabled) {
            this.warnings.push(`OR list has ${node.children.length} items (max: ${this.profile.orMaxOperands}). Results may be unpredictable.`);
        }

        const parts = node.children.map(c => this.renderNode(c)).filter(Boolean);
        return `(${parts.join(' OR ')})`;
    }

    private renderNot(node: NotNode): string {
        const inner = this.renderNode(node.child);
        if (!inner) return '';
        return `-${inner.startsWith('(') ? inner : inner}`;
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

export function compileToGoogle(root: RootNode, options: Partial<RenderOptions> = {}): CompiledQuery {
    return new DorkCompiler({ ...options, engine: 'google' }).compile(root);
}

export function compileToBing(root: RootNode, options: Partial<RenderOptions> = {}): CompiledQuery {
    return new DorkCompiler({ ...options, engine: 'bing' }).compile(root);
}

export function compileToDuckDuckGo(root: RootNode, options: Partial<RenderOptions> = {}): CompiledQuery {
    return new DorkCompiler({ ...options, engine: 'duckduckgo' }).compile(root);
}

export function compileToAllEngines(root: RootNode, options: Partial<RenderOptions> = {}): Record<RenderEngine, CompiledQuery> {
    return {
        google: compileToGoogle(root, options),
        bing: compileToBing(root, options),
        duckduckgo: compileToDuckDuckGo(root, options),
    };
}

// ============================================================================
// Query Analysis
// ============================================================================

export interface QueryAnalysis {
    wordCount: number;
    charCount: number;
    operatorCount: number;
    orDepth: number;
    hasSiteScope: boolean;
    hasFiletype: boolean;
    hasTimeframe: boolean;
    estimatedPrecision: 'high' | 'medium' | 'low';
}

export function analyzeQuery(root: RootNode): QueryAnalysis {
    let operatorCount = 0;
    let maxOrChildren = 0;
    let hasSiteScope = false;
    let hasFiletype = false;
    let hasTimeframe = false;

    function traverse(node: QueryNode): void {
        switch (node.type) {
            case 'SITE':
            case 'PLATFORM':
                hasSiteScope = true;
                operatorCount++;
                break;
            case 'FILETYPE':
                hasFiletype = true;
                operatorCount++;
                break;
            case 'TIMEFRAME':
                hasTimeframe = true;
                operatorCount++;
                break;
            case 'INURL':
            case 'INTITLE':
            case 'INTEXT':
                operatorCount++;
                break;
            case 'OR':
                maxOrChildren = Math.max(maxOrChildren, node.children.length);
                node.children.forEach(traverse);
                break;
            case 'AND':
                node.children.forEach(traverse);
                break;
            case 'NOT':
                traverse(node.child);
                break;
        }
    }

    root.children.forEach(traverse);

    const compiled = compileToGoogle(root);
    const words = compiled.query.split(/\s+/).filter(Boolean);

    let estimatedPrecision: 'high' | 'medium' | 'low' = 'medium';
    if (hasSiteScope && operatorCount >= 2) {
        estimatedPrecision = 'high';
    } else if (maxOrChildren > 5 || words.length > 20) {
        estimatedPrecision = 'low';
    }

    return {
        wordCount: words.length,
        charCount: compiled.query.length,
        operatorCount,
        orDepth: maxOrChildren,
        hasSiteScope,
        hasFiletype,
        hasTimeframe,
        estimatedPrecision,
    };
}

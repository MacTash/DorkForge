/**
 * DorkForge AST Schema v2
 * Enhanced Boolean AST with canonical ordering support
 */

// ============================================================================
// Node Types
// ============================================================================

export type ASTNodeType =
    | 'ROOT'
    | 'TERM'
    | 'PHRASE'
    | 'AND'
    | 'OR'
    | 'NOT'
    | 'SITE'
    | 'FILETYPE'
    | 'INURL'
    | 'INTITLE'
    | 'INTEXT'
    | 'PLATFORM'
    | 'TIMEFRAME';

export type RenderEngine = 'google' | 'bing' | 'duckduckgo';

export type PlatformType = 'drive' | 's3' | 'github' | 'gitlab' | 'pastebin' | 'trello' | 'confluence';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PresetCategory =
    | 'cloud_exposure'
    | 'iot_exposure'
    | 'misconfiguration'
    | 'sensitive_files'
    | 'credentials'
    | 'personnel';

// ============================================================================
// Base Node Interface
// ============================================================================

interface BaseNode {
    type: ASTNodeType;
    id: string;
}

// ============================================================================
// Leaf Nodes
// ============================================================================

export interface TermNode extends BaseNode {
    type: 'TERM';
    value: string;
    quoted?: boolean;
    boost?: number;
}

export interface PhraseNode extends BaseNode {
    type: 'PHRASE';
    value: string;
}

// ============================================================================
// Operator Nodes (array-based values)
// ============================================================================

export interface SiteNode extends BaseNode {
    type: 'SITE';
    domains: string[];
}

export interface FiletypeNode extends BaseNode {
    type: 'FILETYPE';
    types: string[];
}

export interface InurlNode extends BaseNode {
    type: 'INURL';
    values: string[];
    autoQuote?: boolean;
}

export interface IntitleNode extends BaseNode {
    type: 'INTITLE';
    values: string[];
    autoQuote?: boolean;
}

export interface IntextNode extends BaseNode {
    type: 'INTEXT';
    values: string[];
    autoQuote?: boolean;
}

export interface PlatformNode extends BaseNode {
    type: 'PLATFORM';
    value: PlatformType;
}

export interface TimeframeNode extends BaseNode {
    type: 'TIMEFRAME';
    after?: string; // YYYY-MM-DD
    before?: string; // YYYY-MM-DD
}

// ============================================================================
// Boolean Nodes
// ============================================================================

export interface AndNode extends BaseNode {
    type: 'AND';
    children: QueryNode[];
}

export interface OrNode extends BaseNode {
    type: 'OR';
    children: QueryNode[];
}

export interface NotNode extends BaseNode {
    type: 'NOT';
    child: QueryNode;
}

// ============================================================================
// Query Node Union
// ============================================================================

export type QueryNode =
    | TermNode
    | PhraseNode
    | SiteNode
    | FiletypeNode
    | InurlNode
    | IntitleNode
    | IntextNode
    | PlatformNode
    | TimeframeNode
    | AndNode
    | OrNode
    | NotNode;

// ============================================================================
// Root Node
// ============================================================================

export interface QueryMetadata {
    name?: string;
    description?: string;
    preset?: string;
    category?: PresetCategory;
    riskLevel?: RiskLevel;
    createdAt: string;
}

export interface RootNode extends BaseNode {
    type: 'ROOT';
    children: QueryNode[];
    metadata: QueryMetadata;
}

// ============================================================================
// Compiled Query
// ============================================================================

export interface CompiledQuery {
    engine: RenderEngine;
    query: string;
    searchUrl: string;
    warnings: string[];
    sharded?: boolean;
    shardedQueries?: string[];
}

// ============================================================================
// ID Generator
// ============================================================================

let nodeIdCounter = 0;

export function generateNodeId(): string {
    return `node_${++nodeIdCounter}_${Date.now().toString(36)}`;
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTermNode(value: string, quoted = false): TermNode {
    return { type: 'TERM', id: generateNodeId(), value, quoted };
}

export function createPhraseNode(value: string): PhraseNode {
    return { type: 'PHRASE', id: generateNodeId(), value };
}

export function createSiteNode(domains: string[]): SiteNode {
    return { type: 'SITE', id: generateNodeId(), domains };
}

export function createFiletypeNode(types: string[]): FiletypeNode {
    return { type: 'FILETYPE', id: generateNodeId(), types };
}

export function createInurlNode(values: string[], autoQuote = true): InurlNode {
    return { type: 'INURL', id: generateNodeId(), values, autoQuote };
}

export function createIntitleNode(values: string[], autoQuote = true): IntitleNode {
    return { type: 'INTITLE', id: generateNodeId(), values, autoQuote };
}

export function createIntextNode(values: string[], autoQuote = true): IntextNode {
    return { type: 'INTEXT', id: generateNodeId(), values, autoQuote };
}

export function createPlatformNode(value: PlatformType): PlatformNode {
    return { type: 'PLATFORM', id: generateNodeId(), value };
}

export function createTimeframeNode(after?: string, before?: string): TimeframeNode {
    return { type: 'TIMEFRAME', id: generateNodeId(), after, before };
}

export function createAndNode(children: QueryNode[]): AndNode {
    return { type: 'AND', id: generateNodeId(), children };
}

export function createOrNode(children: QueryNode[]): OrNode {
    return { type: 'OR', id: generateNodeId(), children };
}

export function createNotNode(child: QueryNode): NotNode {
    return { type: 'NOT', id: generateNodeId(), child };
}

export function createRootNode(
    children: QueryNode[],
    metadata: Partial<QueryMetadata> = {}
): RootNode {
    return {
        type: 'ROOT',
        id: generateNodeId(),
        children,
        metadata: {
            createdAt: metadata.createdAt || new Date().toISOString(),
            ...metadata,
        },
    };
}

// ============================================================================
// Platform Expansion Map
// ============================================================================

export const PLATFORM_DOMAINS: Record<PlatformType, string[]> = {
    drive: ['drive.google.com', 'docs.google.com'],
    s3: ['s3.amazonaws.com', '*.s3.amazonaws.com'],
    github: ['github.com', 'gist.github.com'],
    gitlab: ['gitlab.com'],
    pastebin: ['pastebin.com', 'hastebin.com', 'paste.ee'],
    trello: ['trello.com'],
    confluence: ['*.atlassian.net/wiki'],
};

// ============================================================================
// AST Traversal
// ============================================================================

export function walkAST(
    node: QueryNode | RootNode,
    callback: (node: QueryNode | RootNode) => void
): void {
    callback(node);

    if (node.type === 'ROOT' || node.type === 'AND' || node.type === 'OR') {
        for (const child of (node as RootNode | AndNode | OrNode).children) {
            walkAST(child, callback);
        }
    } else if (node.type === 'NOT') {
        walkAST((node as NotNode).child, callback);
    }
}

export function countNodes(root: RootNode): number {
    let count = 0;
    walkAST(root, () => count++);
    return count;
}

// ============================================================================
// AST Classification (for canonical ordering)
// ============================================================================

type NodeCategory = 'SITE' | 'FILETYPE' | 'STRUCTURAL' | 'CONTENT' | 'NOT' | 'TIMEFRAME';

export function getNodeCategory(node: QueryNode): NodeCategory {
    switch (node.type) {
        case 'SITE':
        case 'PLATFORM':
            return 'SITE';
        case 'FILETYPE':
            return 'FILETYPE';
        case 'INURL':
        case 'INTITLE':
        case 'INTEXT':
            return 'STRUCTURAL';
        case 'TERM':
        case 'PHRASE':
        case 'AND':
        case 'OR':
            return 'CONTENT';
        case 'NOT':
            return 'NOT';
        case 'TIMEFRAME':
            return 'TIMEFRAME';
        default:
            return 'CONTENT';
    }
}

// Canonical order: SITE → FILETYPE → STRUCTURAL → CONTENT → TIMEFRAME → NOT
const CATEGORY_ORDER: NodeCategory[] = ['SITE', 'FILETYPE', 'STRUCTURAL', 'CONTENT', 'TIMEFRAME', 'NOT'];

export function sortByCanonicalOrder(nodes: QueryNode[]): QueryNode[] {
    return [...nodes].sort((a, b) => {
        const catA = getNodeCategory(a);
        const catB = getNodeCategory(b);
        return CATEGORY_ORDER.indexOf(catA) - CATEGORY_ORDER.indexOf(catB);
    });
}

// ============================================================================
// Backward Compatibility - Legacy OperatorType mapping
// ============================================================================

export type OperatorType =
    | 'site'
    | 'filetype'
    | 'inurl'
    | 'intitle'
    | 'intext'
    | 'ext'
    | 'cache'
    | 'related'
    | 'before'
    | 'after';

// For backward compatibility with old code
export function createOperatorNode(
    operator: OperatorType,
    value: string,
    negated = false
): QueryNode {
    switch (operator) {
        case 'site':
            return negated
                ? createNotNode(createSiteNode([value]))
                : createSiteNode([value]);
        case 'filetype':
        case 'ext':
            return createFiletypeNode([value]);
        case 'inurl':
            return createInurlNode([value]);
        case 'intitle':
            return createIntitleNode([value]);
        case 'intext':
            return createIntextNode([value]);
        default:
            return createTermNode(`${operator}:${value}`);
    }
}

/**
 * DorkForge Query Linter v2
 * Enhanced validation with sensitive pattern detection
 */

import type {
    RootNode,
    QueryNode,
    RenderEngine,
    SiteNode,
    FiletypeNode,
    IntextNode,
    OrNode,
    TimeframeNode,
    NotNode,
} from './ast';
import { ENGINE_PROFILES } from './compiler';

// ============================================================================
// Lint Severity and Result Types
// ============================================================================

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintResult {
    code: string;
    severity: LintSeverity;
    message: string;
    nodeId?: string;
    suggestion?: string;
}

export interface LintSummary {
    errors: number;
    warnings: number;
    info: number;
    results: LintResult[];
    passed: boolean;
}

// ============================================================================
// Lint Rule Definitions
// ============================================================================

interface LintRule {
    code: string;
    severity: LintSeverity;
    check: (root: RootNode, engine: RenderEngine) => LintResult[];
}

// Sensitive patterns for ethical warnings
const SENSITIVE_PATTERNS = {
    credential_discovery: ['password', 'passwd', 'pwd', 'credential', 'secret', 'auth', 'api_key', 'apikey'],
    pii_exposure: ['ssn', 'social security', 'dob', 'date of birth', 'passport'],
    financial_data: ['credit card', 'bank account', 'routing number', 'cvv'],
};

// ============================================================================
// Lint Rules
// ============================================================================

const LINT_RULES: LintRule[] = [
    // EMPTY_OPERATOR_VALUE
    {
        code: 'EMPTY_OPERATOR_VALUE',
        severity: 'error',
        check: (root) => {
            const results: LintResult[] = [];

            function checkNode(node: QueryNode): void {
                switch (node.type) {
                    case 'SITE':
                        if ((node as SiteNode).domains.length === 0) {
                            results.push({
                                code: 'EMPTY_OPERATOR_VALUE',
                                severity: 'error',
                                message: "Operator 'site:' has no domains specified.",
                                nodeId: node.id,
                            });
                        }
                        break;
                    case 'FILETYPE':
                        if ((node as FiletypeNode).types.length === 0) {
                            results.push({
                                code: 'EMPTY_OPERATOR_VALUE',
                                severity: 'error',
                                message: "Operator 'filetype:' has no types specified.",
                                nodeId: node.id,
                            });
                        }
                        break;
                    case 'OR':
                    case 'AND':
                        (node as OrNode).children.forEach(checkNode);
                        break;
                    case 'NOT':
                        checkNode((node as NotNode).child);
                        break;
                }
            }

            root.children.forEach(checkNode);
            return results;
        },
    },

    // UNSUPPORTED_OPERATOR
    {
        code: 'UNSUPPORTED_OPERATOR',
        severity: 'error',
        check: (root, engine) => {
            const profile = ENGINE_PROFILES[engine];
            const results: LintResult[] = [];

            function checkNode(node: QueryNode): void {
                if (node.type === 'INTEXT' && profile.quirks.noIntext) {
                    results.push({
                        code: 'UNSUPPORTED_OPERATOR',
                        severity: 'error',
                        message: `'intext:' is not supported by ${profile.name}. Consider using 'intitle:' or plain search terms.`,
                        nodeId: node.id,
                    });
                }
                if (node.type === 'TIMEFRAME' && profile.quirks.noTemporalOperators) {
                    results.push({
                        code: 'UNSUPPORTED_OPERATOR',
                        severity: 'error',
                        message: `Temporal operators (before:/after:) are not supported by ${profile.name}.`,
                        nodeId: node.id,
                    });
                }
                if (node.type === 'OR' || node.type === 'AND') {
                    (node as OrNode).children.forEach(checkNode);
                }
                if (node.type === 'NOT') {
                    checkNode((node as NotNode).child);
                }
            }

            root.children.forEach(checkNode);
            return results;
        },
    },

    // OR_TRUNCATION_RISK
    {
        code: 'OR_TRUNCATION_RISK',
        severity: 'warning',
        check: (root, engine) => {
            const profile = ENGINE_PROFILES[engine];
            const results: LintResult[] = [];

            function checkNode(node: QueryNode): void {
                if (node.type === 'OR' && node.children.length > profile.orMaxOperands) {
                    results.push({
                        code: 'OR_TRUNCATION_RISK',
                        severity: 'warning',
                        message: `OR list has ${node.children.length} items (max recommended: ${profile.orMaxOperands}). Results may be truncated or unpredictable.`,
                        nodeId: node.id,
                        suggestion: 'Enable query sharding or split into multiple queries.',
                    });
                }
                if (node.type === 'SITE' && (node as SiteNode).domains.length > profile.orMaxOperands) {
                    results.push({
                        code: 'OR_TRUNCATION_RISK',
                        severity: 'warning',
                        message: `Site list has ${(node as SiteNode).domains.length} domains (max: ${profile.orMaxOperands}). Consider enabling sharding.`,
                        nodeId: node.id,
                    });
                }
                if (node.type === 'OR' || node.type === 'AND') {
                    (node as OrNode).children.forEach(checkNode);
                }
            }

            root.children.forEach(checkNode);
            return results;
        },
    },

    // MISSING_SITE_SCOPE
    {
        code: 'MISSING_SITE_SCOPE',
        severity: 'info',
        check: (root) => {
            const hasSensitive = hasSensitiveOperators(root);
            const hasSiteScope = root.children.some(n => n.type === 'SITE' || n.type === 'PLATFORM');

            if (hasSensitive && !hasSiteScope) {
                return [{
                    code: 'MISSING_SITE_SCOPE',
                    severity: 'info',
                    message: 'No site: scope defined. Results will be global. Consider adding target domain for focused results.',
                    suggestion: 'Add a site: operator to narrow scope.',
                }];
            }
            return [];
        },
    },

    // CONFLICTING_TIMEFRAME
    {
        code: 'CONFLICTING_TIMEFRAME',
        severity: 'error',
        check: (root) => {
            const results: LintResult[] = [];

            function checkNode(node: QueryNode): void {
                if (node.type === 'TIMEFRAME') {
                    const tf = node as TimeframeNode;
                    if (tf.after && tf.before) {
                        const after = new Date(tf.after);
                        const before = new Date(tf.before);
                        if (after >= before) {
                            results.push({
                                code: 'CONFLICTING_TIMEFRAME',
                                severity: 'error',
                                message: "Invalid timeframe: 'after' date must be before 'before' date.",
                                nodeId: node.id,
                            });
                        }
                    }
                }
                if (node.type === 'OR' || node.type === 'AND') {
                    (node as OrNode).children.forEach(checkNode);
                }
            }

            root.children.forEach(checkNode);
            return results;
        },
    },

    // INVALID_DATE_FORMAT
    {
        code: 'INVALID_DATE_FORMAT',
        severity: 'error',
        check: (root) => {
            const results: LintResult[] = [];
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            function checkNode(node: QueryNode): void {
                if (node.type === 'TIMEFRAME') {
                    const tf = node as TimeframeNode;
                    if (tf.after && !dateRegex.test(tf.after)) {
                        results.push({
                            code: 'INVALID_DATE_FORMAT',
                            severity: 'error',
                            message: `Invalid date format: '${tf.after}'. Use YYYY-MM-DD (e.g., 2024-01-15).`,
                            nodeId: node.id,
                        });
                    }
                    if (tf.before && !dateRegex.test(tf.before)) {
                        results.push({
                            code: 'INVALID_DATE_FORMAT',
                            severity: 'error',
                            message: `Invalid date format: '${tf.before}'. Use YYYY-MM-DD.`,
                            nodeId: node.id,
                        });
                    }
                }
                if (node.type === 'OR' || node.type === 'AND') {
                    (node as OrNode).children.forEach(checkNode);
                }
            }

            root.children.forEach(checkNode);
            return results;
        },
    },

    // SENSITIVE_QUERY_PATTERN
    {
        code: 'SENSITIVE_QUERY_PATTERN',
        severity: 'warning',
        check: (root) => {
            const results: LintResult[] = [];
            const detectedPatterns: Set<string> = new Set();

            function checkValue(value: string): void {
                const lowerValue = value.toLowerCase();
                for (const [pattern, keywords] of Object.entries(SENSITIVE_PATTERNS)) {
                    for (const keyword of keywords) {
                        if (lowerValue.includes(keyword)) {
                            detectedPatterns.add(pattern);
                        }
                    }
                }
            }

            function checkNode(node: QueryNode): void {
                switch (node.type) {
                    case 'TERM':
                    case 'PHRASE':
                        checkValue((node as any).value);
                        break;
                    case 'INTEXT':
                        (node as IntextNode).values.forEach(checkValue);
                        break;
                    case 'OR':
                    case 'AND':
                        (node as OrNode).children.forEach(checkNode);
                        break;
                    case 'NOT':
                        checkNode((node as NotNode).child);
                        break;
                }
            }

            root.children.forEach(checkNode);

            for (const pattern of detectedPatterns) {
                results.push({
                    code: 'SENSITIVE_QUERY_PATTERN',
                    severity: 'warning',
                    message: `Query targets sensitive data (${pattern.replace(/_/g, ' ')}). Ensure authorized use only.`,
                    suggestion: 'This query may expose sensitive information. Use responsibly.',
                });
            }

            return results;
        },
    },

    // NESTED_NOT_WARNING
    {
        code: 'NESTED_NOT_WARNING',
        severity: 'warning',
        check: (root) => {
            const results: LintResult[] = [];

            function checkNode(node: QueryNode, inNot = false): void {
                if (node.type === 'NOT') {
                    if (inNot) {
                        results.push({
                            code: 'NESTED_NOT_WARNING',
                            severity: 'warning',
                            message: 'Double negation detected. This may not work as expected.',
                            nodeId: node.id,
                        });
                    }
                    checkNode((node as NotNode).child, true);
                }
                if (node.type === 'OR' || node.type === 'AND') {
                    (node as OrNode).children.forEach(c => checkNode(c, inNot));
                }
            }

            root.children.forEach(c => checkNode(c, false));
            return results;
        },
    },

    // QUERY_LENGTH_LIMIT - simplified version without circular dependency
    {
        code: 'QUERY_LENGTH_LIMIT',
        severity: 'warning',
        check: (root, engine) => {
            const profile = ENGINE_PROFILES[engine];

            // Estimate token count from AST without compiling
            let tokenCount = 0;
            function countTokens(node: QueryNode): void {
                switch (node.type) {
                    case 'SITE':
                        tokenCount += (node as SiteNode).domains.length;
                        break;
                    case 'FILETYPE':
                        tokenCount += (node as FiletypeNode).types.length;
                        break;
                    case 'INURL':
                    case 'INTITLE':
                    case 'INTEXT':
                        tokenCount += (node as any).values.length;
                        break;
                    case 'TERM':
                    case 'PHRASE':
                        tokenCount += 1;
                        break;
                    case 'OR':
                    case 'AND':
                        (node as OrNode).children.forEach(countTokens);
                        break;
                    case 'NOT':
                        countTokens((node as NotNode).child);
                        break;
                }
            }

            root.children.forEach(countTokens);

            if (tokenCount > profile.maxTokensWarn) {
                return [{
                    code: 'QUERY_LENGTH_LIMIT',
                    severity: 'warning',
                    message: `Query has ~${tokenCount} tokens (recommended max: ${profile.maxTokensWarn}). Some terms may be ignored.`,
                    suggestion: 'Consider splitting into multiple queries.',
                }];
            }
            return [];
        },
    },
];

// ============================================================================
// Helper Functions
// ============================================================================

function hasSensitiveOperators(root: RootNode): boolean {
    let sensitive = false;

    function checkNode(node: QueryNode): void {
        if (node.type === 'FILETYPE') {
            const types = (node as FiletypeNode).types;
            if (types.some(t => ['sql', 'env', 'log', 'bak', 'backup'].includes(t.toLowerCase()))) {
                sensitive = true;
            }
        }
        if (node.type === 'INTEXT') {
            const values = (node as IntextNode).values;
            if (values.some(v => v.toLowerCase().includes('password') || v.toLowerCase().includes('secret'))) {
                sensitive = true;
            }
        }
        if (node.type === 'OR' || node.type === 'AND') {
            (node as OrNode).children.forEach(checkNode);
        }
    }

    root.children.forEach(checkNode);
    return sensitive;
}

// ============================================================================
// Main Linter
// ============================================================================

export class QueryLinter {
    private engine: RenderEngine;

    constructor(engine: RenderEngine = 'google') {
        this.engine = engine;
    }

    lint(root: RootNode): LintSummary {
        const results: LintResult[] = [];

        for (const rule of LINT_RULES) {
            try {
                const ruleResults = rule.check(root, this.engine);
                results.push(...ruleResults);
            } catch (e) {
                console.error(`Lint rule ${rule.code} failed:`, e);
            }
        }

        const errors = results.filter(r => r.severity === 'error').length;
        const warnings = results.filter(r => r.severity === 'warning').length;
        const info = results.filter(r => r.severity === 'info').length;

        return {
            errors,
            warnings,
            info,
            results,
            passed: errors === 0,
        };
    }
}

// ============================================================================
// Convenience Function
// ============================================================================

export function lintQuery(root: RootNode, engine: RenderEngine = 'google'): LintSummary {
    return new QueryLinter(engine).lint(root);
}

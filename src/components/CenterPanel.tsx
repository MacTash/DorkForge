/**
 * CenterPanel - Logic Structure
 * Visual representation of AST with clean node boxes and AND connectors
 */

import type {
    RootNode,
    QueryNode,
    SiteNode,
    FiletypeNode,
    InurlNode,
    IntitleNode,
    IntextNode,
    PhraseNode,
    TermNode,
    OrNode,
    AndNode,
    NotNode,
} from '../lib/ast';

interface CenterPanelProps {
    ast: RootNode;
}

interface ASTNodeGroup {
    label: string;
    items: string[];
    prefix: string;
}

function extractGroups(nodes: QueryNode[]): ASTNodeGroup[] {
    const groups: ASTNodeGroup[] = [];

    for (const node of nodes) {
        switch (node.type) {
            case 'SITE': {
                const siteNode = node as SiteNode;
                if (siteNode.domains.length > 0) {
                    groups.push({
                        label: 'DOMAIN SCOPE',
                        items: siteNode.domains.map(d => `site: ${d}`),
                        prefix: '●',
                    });
                }
                break;
            }
            case 'FILETYPE': {
                const ftNode = node as FiletypeNode;
                if (ftNode.types.length > 0) {
                    groups.push({
                        label: 'FILE EXTENSION',
                        items: ftNode.types.map(t => `filetype: ${t}`),
                        prefix: '●',
                    });
                }
                break;
            }
            case 'INURL': {
                const inurlNode = node as InurlNode;
                if (inurlNode.values.length > 0) {
                    groups.push({
                        label: 'URL CONTENT',
                        items: inurlNode.values.map(v => `inurl: ${v}`),
                        prefix: '●',
                    });
                }
                break;
            }
            case 'INTITLE': {
                const intitleNode = node as IntitleNode;
                if (intitleNode.values.length > 0) {
                    groups.push({
                        label: 'TITLE CONTENT',
                        items: intitleNode.values.map(v => `intitle: ${v}`),
                        prefix: '●',
                    });
                }
                break;
            }
            case 'INTEXT': {
                const intextNode = node as IntextNode;
                if (intextNode.values.length > 0) {
                    groups.push({
                        label: 'BODY CONTENT',
                        items: intextNode.values.map(v => `intext: ${v}`),
                        prefix: '●',
                    });
                }
                break;
            }
            case 'PHRASE': {
                const phraseNode = node as PhraseNode;
                // Collect into phrases group
                let phraseGroup = groups.find(g => g.label === 'EXACT PHRASES');
                if (!phraseGroup) {
                    phraseGroup = { label: 'EXACT PHRASES', items: [], prefix: '●' };
                    groups.push(phraseGroup);
                }
                phraseGroup.items.push(`"${phraseNode.value}"`);
                break;
            }
            case 'TERM': {
                const termNode = node as TermNode;
                let termGroup = groups.find(g => g.label === 'KEYWORDS');
                if (!termGroup) {
                    termGroup = { label: 'KEYWORDS', items: [], prefix: '●' };
                    groups.push(termGroup);
                }
                termGroup.items.push(termNode.value);
                break;
            }
            case 'OR': {
                const orNode = node as OrNode;
                const nested = extractGroups(orNode.children);
                groups.push(...nested);
                break;
            }
            case 'AND': {
                const andNode = node as AndNode;
                const nested = extractGroups(andNode.children);
                groups.push(...nested);
                break;
            }
            case 'NOT': {
                const notNode = node as NotNode;
                const nested = extractGroups([notNode.child]);
                for (const g of nested) {
                    g.label = `EXCLUDE: ${g.label}`;
                    g.items = g.items.map(i => `-${i}`);
                }
                groups.push(...nested);
                break;
            }
        }
    }

    return groups;
}

function NodeBox({ group, showConnector }: { group: ASTNodeGroup; showConnector: boolean }) {
    return (
        <>
            <div className="ast-node-box">
                <div className="ast-node-header">
                    <span className="ast-node-label">{group.label}</span>
                    <span className="ast-node-count">{group.items.length} ITEMS</span>
                </div>
                <div className="ast-node-items">
                    {group.items.map((item, i) => (
                        <div key={i} className="ast-node-item">
                            <span className="ast-item-dot">{group.prefix}</span>
                            <span className="ast-item-text">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {showConnector && (
                <div className="ast-connector">
                    <div className="ast-connector-line" />
                    <span className="ast-connector-label">AND</span>
                </div>
            )}
        </>
    );
}

export function CenterPanel({ ast }: CenterPanelProps) {
    const groups = extractGroups(ast.children);

    return (
        <div className="center-panel">
            {/* Header */}
            <div className="panel-header">
                <div className="panel-header-row">
                    <svg className="panel-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h2 className="panel-title">LOGIC STRUCTURE</h2>
                </div>
                <p className="panel-subtitle">Visual representation of compiled boolean logic.</p>
            </div>

            {/* Content */}
            <div className="panel-content ast-content">
                {groups.length === 0 ? (
                    <div className="ast-empty">
                        <svg className="ast-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="ast-empty-text">AWAITING INPUT</span>
                    </div>
                ) : (
                    <div className="ast-tree">
                        {groups.map((group, idx) => (
                            <NodeBox
                                key={`${group.label}-${idx}`}
                                group={group}
                                showConnector={idx < groups.length - 1}
                            />
                        ))}

                        {/* Query Ready Badge */}
                        <div className="ast-ready">
                            <span className="ast-ready-badge">QUERY READY</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

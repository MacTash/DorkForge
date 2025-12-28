/**
 * MultiEngineRenderer Component
 * Displays compiled queries for Google, Bing, and DuckDuckGo
 */

import { useState, useCallback } from 'react';
import type { RenderEngine, CompiledQuery } from '../lib/ast';

interface MultiEngineRendererProps {
    queries: Record<RenderEngine, CompiledQuery>;
}

const ENGINES: { id: RenderEngine; label: string; icon: string; color: string }[] = [
    { id: 'google', label: 'Google', icon: 'G', color: '#4285f4' },
    { id: 'bing', label: 'Bing', icon: 'B', color: '#00809d' },
    { id: 'duckduckgo', label: 'DuckDuckGo', icon: 'D', color: '#de5833' },
];

function highlightQuery(query: string): React.ReactNode {
    if (!query) return <span className="text-[var(--text-muted)]">Empty query</span>;

    const parts: React.ReactNode[] = [];
    let key = 0;

    const operatorRegex = /(site:|inurl:|intitle:|intext:|filetype:|ext:|cache:|related:|before:|after:|inbody:)(\S+)/g;
    const booleanRegex = /\b(OR|AND)\b/g;
    const phraseRegex = /"([^"]+)"/g;

    const tokens: { start: number; end: number; element: React.ReactNode }[] = [];

    // Find operators
    let match;
    while ((match = operatorRegex.exec(query)) !== null) {
        const opClass = `op-${match[1].replace(':', '').replace('inbody', 'intext')}`;
        tokens.push({
            start: match.index,
            end: match.index + match[0].length,
            element: (
                <span key={key++}>
                    <span className={opClass}>{match[1]}</span>
                    <span className="op-term">{match[2]}</span>
                </span>
            ),
        });
    }

    // Find booleans
    while ((match = booleanRegex.exec(query)) !== null) {
        if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
            tokens.push({
                start: match.index,
                end: match.index + match[0].length,
                element: <span key={key++} className="op-boolean">{match[0]}</span>,
            });
        }
    }

    // Find phrases
    while ((match = phraseRegex.exec(query)) !== null) {
        if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
            tokens.push({
                start: match.index,
                end: match.index + match[0].length,
                element: <span key={key++} className="op-phrase">{match[0]}</span>,
            });
        }
    }

    tokens.sort((a, b) => a.start - b.start);

    let currentPos = 0;
    for (const token of tokens) {
        if (token.start > currentPos) {
            parts.push(<span key={key++}>{query.slice(currentPos, token.start)}</span>);
        }
        parts.push(token.element);
        currentPos = token.end;
    }

    if (currentPos < query.length) {
        parts.push(<span key={key++}>{query.slice(currentPos)}</span>);
    }

    return <>{parts}</>;
}

export function MultiEngineRenderer({ queries }: MultiEngineRendererProps) {
    const [selectedEngine, setSelectedEngine] = useState<RenderEngine>('google');
    const [copied, setCopied] = useState(false);

    const currentQuery = queries[selectedEngine];

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(currentQuery.query);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, [currentQuery.query]);

    const handleOpen = useCallback(() => {
        window.open(currentQuery.searchUrl, '_blank', 'noopener,noreferrer');
    }, [currentQuery.searchUrl]);

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Compiled Query
                </h2>
                <div className="tabs">
                    {ENGINES.map((engine) => (
                        <button
                            key={engine.id}
                            onClick={() => setSelectedEngine(engine.id)}
                            className={`tab ${selectedEngine === engine.id ? 'active' : ''}`}
                            style={selectedEngine === engine.id ? { color: engine.color } : undefined}
                        >
                            <span className="font-bold mr-1">{engine.icon}</span>
                            {engine.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="code-block min-h-[80px] relative">
                <code className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                    {highlightQuery(currentQuery.query)}
                </code>
                <div className="absolute bottom-2 right-2 text-xs text-[var(--text-muted)]">
                    {currentQuery.query.split(/\s+/).filter(Boolean).length} words •{' '}
                    {currentQuery.query.length} chars
                </div>
            </div>

            {currentQuery.warnings.length > 0 && (
                <div className="space-y-2">
                    {currentQuery.warnings.map((warning, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[rgba(255,170,0,0.1)] border border-[rgba(255,170,0,0.3)]"
                        >
                            <span className="text-[var(--risk-medium)]">⚠</span>
                            <span className="text-sm text-[var(--risk-medium)]">{warning}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={handleCopy}
                    disabled={!currentQuery.query}
                    className="btn btn-secondary flex-1"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Query
                        </>
                    )}
                </button>

                <button
                    onClick={handleOpen}
                    disabled={!currentQuery.query}
                    className="btn btn-primary flex-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in {ENGINES.find(e => e.id === selectedEngine)?.label}
                </button>
            </div>

            <div className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                {selectedEngine === 'google' && 'Full operator support. Best for comprehensive OSINT.'}
                {selectedEngine === 'bing' && 'Uses inbody: instead of intext:. Limited temporal operators.'}
                {selectedEngine === 'duckduckgo' && 'Privacy-focused. Limited operator support.'}
            </div>
        </div>
    );
}

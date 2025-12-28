/**
 * RightPanel - Payload Output  
 * Compiled query display with copy/execute actions
 */

import { useState, useCallback } from 'react';
import type { RenderEngine, CompiledQuery, RootNode } from '../lib/ast';
import type { QueryAnalysis } from '../lib/compiler';

interface RightPanelProps {
    queries: Record<RenderEngine, CompiledQuery>;
    analysis: QueryAnalysis;
    ast: RootNode;
    engine: RenderEngine;
}

type ViewMode = 'raw' | 'encoded' | 'json';

export function RightPanel({ queries, analysis, ast, engine }: RightPanelProps) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('raw');

    const currentQuery = queries[engine];

    const getContent = () => {
        switch (viewMode) {
            case 'raw':
                return currentQuery.query;
            case 'encoded':
                return encodeURIComponent(currentQuery.query);
            case 'json':
                return JSON.stringify(ast, null, 2);
        }
    };

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(getContent());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, [viewMode, currentQuery, ast]);

    const handleExecute = useCallback(() => {
        if (!currentQuery.query) return;
        window.open(currentQuery.searchUrl, '_blank', 'noopener,noreferrer');
    }, [currentQuery]);

    return (
        <div className="right-panel">
            {/* Header */}
            <div className="panel-header">
                <div>
                    <h2 className="panel-title" style={{ color: 'var(--accent-secondary)', textShadow: '0 0 10px rgba(0,200,200,0.4)' }}>PAYLOAD OUTPUT</h2>
                    <p className="stats-display">
                        {analysis.charCount} CHARS | {analysis.wordCount} TOKENS
                    </p>
                </div>

                <div className="view-toggle">
                    <button
                        onClick={() => setViewMode('raw')}
                        className={`btn-icon ${viewMode === 'raw' ? 'active' : ''}`}
                        title="Raw String"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('encoded')}
                        className={`btn-icon ${viewMode === 'encoded' ? 'active' : ''}`}
                        title="URL Encoded"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('json')}
                        className={`btn-icon ${viewMode === 'json' ? 'active' : ''}`}
                        title="AST JSON"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Output Area */}
            <div className="panel-content">
                <textarea
                    readOnly
                    value={getContent()}
                    className="output-textarea"
                    spellCheck={false}
                />

                {/* Actions */}
                <div className="output-actions">
                    <button onClick={handleCopy} className="btn btn-secondary">
                        {copied ? (
                            <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                        {copied ? 'COPIED' : 'COPY'}
                    </button>
                </div>
            </div>
        </div>
    );
}

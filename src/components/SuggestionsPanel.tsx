/**
 * SuggestionsPanel - Google Dorks Documentation Drawer
 * Slide-up panel with comprehensive dork reference
 */

import { useState } from 'react';
import { DORK_OPERATORS, DORK_EXAMPLES, BEST_PRACTICES, ENGINE_DIFFERENCES, EXTERNAL_RESOURCES, type DorkOperator, type DorkExample } from '../data/dorksDocumentation';

interface SuggestionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'operators' | 'examples' | 'tips';

export function SuggestionsPanel({ isOpen, onClose }: SuggestionsPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('operators');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...new Set(DORK_EXAMPLES.map(e => e.category))];

    const filteredExamples = selectedCategory === 'all'
        ? DORK_EXAMPLES
        : DORK_EXAMPLES.filter(e => e.category === selectedCategory);

    if (!isOpen) return null;

    return (
        <div className="suggestions-overlay" onClick={onClose}>
            <div className="suggestions-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="suggestions-header">
                    <div className="suggestions-title">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>DORK REFERENCE</span>
                    </div>
                    <button className="suggestions-close" onClick={onClose}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="suggestions-tabs">
                    <button
                        className={`suggestions-tab ${activeTab === 'operators' ? 'active' : ''}`}
                        onClick={() => setActiveTab('operators')}
                    >
                        OPERATORS
                    </button>
                    <button
                        className={`suggestions-tab ${activeTab === 'examples' ? 'active' : ''}`}
                        onClick={() => setActiveTab('examples')}
                    >
                        EXAMPLES ({DORK_EXAMPLES.length})
                    </button>
                    <button
                        className={`suggestions-tab ${activeTab === 'tips' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tips')}
                    >
                        TIPS & RESOURCES
                    </button>
                </div>

                {/* Content */}
                <div className="suggestions-content">
                    {activeTab === 'operators' && (
                        <div className="operators-list">
                            {DORK_OPERATORS.map((op: DorkOperator, idx: number) => (
                                <div key={idx} className="operator-card">
                                    <div className="operator-header">
                                        <code className="operator-name">{op.name}</code>
                                        <div className="operator-engines">
                                            {op.engines.map(e => (
                                                <span key={e} className={`engine-badge ${e}`}>{e[0].toUpperCase()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <code className="operator-syntax">{op.syntax}</code>
                                    <p className="operator-desc">{op.description}</p>
                                    <div className="operator-examples">
                                        {op.examples.slice(0, 3).map((ex, i) => (
                                            <code key={i} className="example-code">{ex}</code>
                                        ))}
                                    </div>
                                    {op.tips && <p className="operator-tip">💡 {op.tips}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'examples' && (
                        <div className="examples-section">
                            <div className="category-filter">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="examples-list">
                                {filteredExamples.map((ex: DorkExample, idx: number) => (
                                    <div key={idx} className="example-card">
                                        <div className="example-header">
                                            <span className="example-name">{ex.name}</span>
                                            <span className="example-category">{ex.category}</span>
                                        </div>
                                        <code className="example-query">{ex.query}</code>
                                        <p className="example-desc">{ex.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tips' && (
                        <div className="tips-section">
                            {/* External Resources */}
                            <div className="resources-block">
                                <h3>External Resources</h3>
                                <div className="resources-list">
                                    {EXTERNAL_RESOURCES.map((resource, idx) => (
                                        <a
                                            key={idx}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-card"
                                        >
                                            <span className="resource-name">{resource.name}</span>
                                            <p className="resource-desc">{resource.description}</p>
                                            <span className="resource-link">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Visit
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="tips-block">
                                <h3>Best Practices</h3>
                                {BEST_PRACTICES.map((tip, idx) => (
                                    <div key={idx} className="tip-card">
                                        <span className="tip-title">{tip.title}</span>
                                        <p className="tip-content">{tip.content}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="engines-block">
                                <h3>Engine Differences</h3>
                                {Object.entries(ENGINE_DIFFERENCES).map(([key, engine]) => (
                                    <div key={key} className="engine-card">
                                        <span className={`engine-name ${key}`}>{engine.name}</span>
                                        <p className="engine-notes">{engine.notes}</p>
                                        <div className="engine-supported">
                                            {engine.supported.map(op => (
                                                <code key={op} className="supported-op">{op}</code>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


/**
 * CategoryBrowser Component
 * Browse and insert GHDB-aligned dork patterns
 */

import { useState, useMemo } from 'react';
import categories from '../data/categories.json';
import type { RootNode } from '../lib/ast';

interface Category {
    id: string;
    name: string;
    description: string;
    riskLevel: string;
    patterns: Pattern[];
}

interface Pattern {
    id: string;
    name: string;
    intent: string;
    operators: string[];
    compiledExamples: Record<string, string>;
    legalBoundary: string;
    tags: string[];
}

interface CategoryBrowserProps {
    onSelectPattern: (pattern: Pattern) => void;
    onApplyAST?: (ast: RootNode) => void;
}

const RISK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: 'rgba(255, 0, 68, 0.1)', border: 'rgba(255, 0, 68, 0.3)', text: 'var(--risk-critical)' },
    high: { bg: 'rgba(255, 102, 0, 0.1)', border: 'rgba(255, 102, 0, 0.3)', text: 'var(--risk-high)' },
    medium: { bg: 'rgba(255, 170, 0, 0.1)', border: 'rgba(255, 170, 0, 0.3)', text: 'var(--risk-medium)' },
    low: { bg: 'rgba(57, 255, 20, 0.1)', border: 'rgba(57, 255, 20, 0.3)', text: 'var(--risk-low)' },
};

export function CategoryBrowser({ onSelectPattern }: CategoryBrowserProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

    const categoriesData = (categories as { categories: Category[] }).categories;

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categoriesData;

        const term = searchTerm.toLowerCase();
        return categoriesData
            .map((cat) => ({
                ...cat,
                patterns: cat.patterns.filter(
                    (p) =>
                        p.name.toLowerCase().includes(term) ||
                        p.intent.toLowerCase().includes(term) ||
                        p.tags.some((t) => t.toLowerCase().includes(term))
                ),
            }))
            .filter((cat) => cat.patterns.length > 0);
    }, [categoriesData, searchTerm]);

    const currentCategory = selectedCategory
        ? filteredCategories.find((c) => c.id === selectedCategory)
        : null;

    return (
        <div className="glass-card p-6 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">GHDB Patterns</h2>
                <span className="text-xs text-[var(--text-muted)]">
                    {categoriesData.reduce((acc, c) => acc + c.patterns.length, 0)} patterns
                </span>
            </div>

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patterns, tags, intents..."
                className="input"
            />

            <div className="flex-1 overflow-y-auto space-y-2">
                {!selectedCategory ? (
                    <div className="grid grid-cols-1 gap-2">
                        {filteredCategories.map((cat) => {
                            const risk = RISK_COLORS[cat.riskLevel] || RISK_COLORS.medium;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--neon-cyan)] transition-all text-left"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                                            <span
                                                className="badge text-[10px]"
                                                style={{ backgroundColor: risk.bg, borderColor: risk.border, color: risk.text }}
                                            >
                                                {cat.riskLevel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] truncate">{cat.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className="text-xs text-[var(--text-secondary)]">{cat.patterns.length}</span>
                                        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={() => { setSelectedCategory(null); setExpandedPattern(null); }}
                            className="flex items-center gap-2 text-sm text-[var(--neon-cyan)] hover:text-[var(--text-primary)] transition-all mb-4"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Categories
                        </button>

                        {currentCategory && (
                            <div className="pb-4 mb-4 border-b border-[var(--border-subtle)]">
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">{currentCategory.name}</h3>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{currentCategory.description}</p>
                            </div>
                        )}

                        {currentCategory?.patterns.map((pattern) => (
                            <div key={pattern.id} className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden transition-all">
                                <button
                                    onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
                                    className="w-full p-4 text-left flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-[var(--text-primary)]">{pattern.name}</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {pattern.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expandedPattern === pattern.id ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {expandedPattern === pattern.id && (
                                    <div className="p-4 pt-0 space-y-3 animate-slide-up">
                                        <p className="text-sm text-[var(--text-secondary)]">{pattern.intent}</p>
                                        <div className="code-block text-xs">
                                            <code className="text-[var(--neon-cyan)]">{pattern.compiledExamples.google}</code>
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] px-3 py-2 bg-[var(--bg-elevated)] rounded border-l-2 border-[var(--risk-medium)]">
                                            ⚖️ {pattern.legalBoundary}
                                        </div>
                                        <button onClick={() => onSelectPattern(pattern)} className="btn btn-primary w-full text-sm">
                                            Use This Pattern
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

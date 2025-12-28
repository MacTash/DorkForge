/**
 * QueryBuilder Component
 * Visual query construction interface
 */

import { useState, useCallback } from 'react';
import type { OperatorType } from '../lib/ast';

interface QueryBuilderProps {
    onAddTerm: (value: string) => void;
    onAddPhrase: (value: string) => void;
    onAddOperator: (operator: OperatorType, value: string) => void;
    onClear: () => void;
}

const OPERATORS: { id: OperatorType; label: string; description: string; color: string }[] = [
    { id: 'site', label: 'site:', description: 'Restrict to domain', color: '#ff79c6' },
    { id: 'inurl', label: 'inurl:', description: 'URL contains', color: '#8be9fd' },
    { id: 'intitle', label: 'intitle:', description: 'Title contains', color: '#50fa7b' },
    { id: 'filetype', label: 'filetype:', description: 'File extension', color: '#ffb86c' },
    { id: 'intext', label: 'intext:', description: 'Body contains', color: '#bd93f9' },
    { id: 'ext', label: 'ext:', description: 'Extension alias', color: '#f8f8f2' },
    { id: 'cache', label: 'cache:', description: 'Cached version', color: '#6272a4' },
    { id: 'related', label: 'related:', description: 'Similar sites', color: '#44475a' },
];

const QUICK_VALUES: Record<string, string[]> = {
    site: ['github.com', 'linkedin.com/in', 's3.amazonaws.com', '*.gov'],
    filetype: ['pdf', 'sql', 'env', 'log', 'xlsx', 'bak', 'conf'],
    inurl: ['/admin', '/login', '/.git/', '/.env', '/wp-admin', '/api/'],
    intitle: ['index of', 'login', 'admin', 'dashboard', 'phpinfo()'],
};

export function QueryBuilder({ onAddTerm, onAddPhrase, onAddOperator, onClear }: QueryBuilderProps) {
    const [inputValue, setInputValue] = useState('');
    const [selectedOperator, setSelectedOperator] = useState<OperatorType | null>(null);
    const [operatorValue, setOperatorValue] = useState('');

    const handleAddTerm = useCallback(() => {
        if (!inputValue.trim()) return;
        if (inputValue.includes(' ')) {
            onAddPhrase(inputValue.trim());
        } else {
            onAddTerm(inputValue.trim());
        }
        setInputValue('');
    }, [inputValue, onAddTerm, onAddPhrase]);

    const handleAddOperator = useCallback(() => {
        if (!selectedOperator || !operatorValue.trim()) return;
        onAddOperator(selectedOperator, operatorValue.trim());
        setSelectedOperator(null);
        setOperatorValue('');
    }, [selectedOperator, operatorValue, onAddOperator]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (selectedOperator) {
                handleAddOperator();
            } else {
                handleAddTerm();
            }
        }
    }, [selectedOperator, handleAddOperator, handleAddTerm]);

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Query Builder</h2>
                <button onClick={onClear} className="btn btn-danger text-xs px-3 py-1">Clear All</button>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Add Term or Phrase</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter search term or 'exact phrase'"
                        className="input flex-1"
                    />
                    <button onClick={handleAddTerm} disabled={!inputValue.trim()} className="btn btn-primary">
                        Add
                    </button>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Phrases with spaces will be quoted automatically</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm text-[var(--text-secondary)]">Add Operator</label>
                <div className="grid grid-cols-4 gap-2">
                    {OPERATORS.map((op) => (
                        <button
                            key={op.id}
                            onClick={() => setSelectedOperator(selectedOperator === op.id ? null : op.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${selectedOperator === op.id
                                    ? 'ring-2 ring-[var(--neon-cyan)] bg-[var(--bg-elevated)]'
                                    : 'bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)]'
                                }`}
                            style={{ color: op.color }}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>

                {selectedOperator && (
                    <div className="animate-slide-up space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span
                                className="font-mono font-bold"
                                style={{ color: OPERATORS.find(o => o.id === selectedOperator)?.color }}
                            >
                                {selectedOperator}:
                            </span>
                            <span className="text-[var(--text-muted)]">
                                {OPERATORS.find(o => o.id === selectedOperator)?.description}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={operatorValue}
                                onChange={(e) => setOperatorValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Enter ${selectedOperator} value`}
                                className="input flex-1"
                                autoFocus
                            />
                            <button onClick={handleAddOperator} disabled={!operatorValue.trim()} className="btn btn-primary">
                                Add
                            </button>
                        </div>

                        {QUICK_VALUES[selectedOperator] && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {QUICK_VALUES[selectedOperator].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setOperatorValue(val)}
                                        className="px-2 py-1 text-xs rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] hover:bg-[var(--border-subtle)] transition-all"
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Quick Patterns</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Open Dir', op: 'intitle', val: 'index of' },
                        { label: '.env Files', op: 'filetype', val: 'env' },
                        { label: 'SQL Dumps', op: 'filetype', val: 'sql' },
                        { label: 'Git Exposed', op: 'inurl', val: '/.git/' },
                        { label: 'Admin Panel', op: 'inurl', val: '/admin' },
                        { label: 'Logs', op: 'filetype', val: 'log' },
                    ].map((pattern) => (
                        <button
                            key={pattern.label}
                            onClick={() => onAddOperator(pattern.op as OperatorType, pattern.val)}
                            className="px-3 py-1.5 text-xs rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all"
                        >
                            {pattern.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * LintPanel Component
 * Displays linting results with severity levels
 */

import type { LintSummary, LintResult, LintSeverity } from '../lib/linter';

interface LintPanelProps {
    results: LintSummary;
}

const SEVERITY_CONFIG: Record<LintSeverity, { icon: string; color: string; bg: string }> = {
    error: { icon: '✕', color: 'var(--osint-alert)', bg: 'rgba(220, 38, 38, 0.1)' },
    warning: { icon: '⚠', color: 'var(--osint-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    info: { icon: 'ℹ', color: 'var(--osint-info)', bg: 'rgba(14, 165, 233, 0.1)' },
};

function LintResultItem({ result }: { result: LintResult }) {
    const config = SEVERITY_CONFIG[result.severity];

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.01]"
            style={{ backgroundColor: config.bg, borderLeft: `3px solid ${config.color}` }}
        >
            <span className="text-lg font-bold shrink-0" style={{ color: config.color }}>{config.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
                    >
                        {result.code}
                    </span>
                </div>
                <p className="text-sm text-[var(--osint-text)]">{result.message}</p>
                {result.suggestion && (
                    <p className="text-xs text-[var(--osint-muted)] mt-1 italic">💡 {result.suggestion}</p>
                )}
            </div>
        </div>
    );
}

export function LintPanel({ results }: LintPanelProps) {
    const { errors, warnings, info, passed } = results;

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--osint-text)]">Query Validation</h2>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${passed
                        ? 'bg-[rgba(5,150,105,0.1)] text-[var(--osint-success)] border border-[rgba(5,150,105,0.3)]'
                        : 'bg-[rgba(220,38,38,0.1)] text-[var(--osint-alert)] border border-[rgba(220,38,38,0.3)]'
                    }`}>
                    <span className={passed ? 'animate-pulse' : ''}>{passed ? '✓' : '✕'}</span>
                    {passed ? 'Valid' : 'Has Errors'}
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--osint-alert)]" />
                    <span className="text-sm text-[var(--osint-muted)]">{errors} Errors</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--osint-warning)]" />
                    <span className="text-sm text-[var(--osint-muted)]">{warnings} Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--osint-info)]" />
                    <span className="text-sm text-[var(--osint-muted)]">{info} Info</span>
                </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {results.results.length === 0 ? (
                    <div className="text-center py-8 text-[var(--osint-muted)]">
                        <div className="text-4xl mb-2">✨</div>
                        <p>No issues found</p>
                        <p className="text-xs mt-1">Query is ready to execute</p>
                    </div>
                ) : (
                    results.results.map((result, i) => (
                        <LintResultItem key={`${result.code}-${i}`} result={result} />
                    ))
                )}
            </div>

            {results.results.some(r => r.code.startsWith('SENSITIVE_')) && (
                <div className="pt-4 border-t border-[var(--osint-border)]">
                    <p className="text-xs text-[var(--osint-muted)]">
                        ⚖️ <strong>Legal Notice:</strong> These queries are for authorized OSINT research only.
                    </p>
                </div>
            )}
        </div>
    );
}

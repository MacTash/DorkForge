/**
 * LiveQueryPreview - Real-time query compilation display
 * Shows users exactly what their query will look like
 */

import { useMemo } from 'react';
import type { RootNode } from '../lib/ast';
import { DorkCompiler } from '../lib/compiler';

interface LiveQueryPreviewProps {
  ast: RootNode;
  engine: 'google' | 'bing' | 'duckduckgo';
}

export function LiveQueryPreview({ ast, engine }: LiveQueryPreviewProps) {
  const compiler = useMemo(() =>
    new DorkCompiler({ engine, canonicalOrdering: true }),
    [engine]
  );

  const compiled = useMemo(() => compiler.compile(ast), [compiler, ast]);

  return (
    <div className="live-preview-panel">
      <div className="preview-header">
        <h3 className="preview-title">🔍 Your Search Query</h3>
        <div className="engine-badge">
          Target Engine: <strong>{engine.toUpperCase()}</strong>
        </div>
      </div>

      {ast.children.length === 0 ? (
        <div className="preview-empty">
          <p>Your query will appear here as you build it.</p>
          <p>Start by adding keywords, file types, or sites to search.</p>
        </div>
      ) : (
        <div className="preview-content">
          {/* Query Display */}
          <div className="query-display">
            <code className="query-text">
              {compiled.query || 'Building query...'}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="preview-actions">
            <button
              onClick={() => navigator.clipboard.writeText(compiled.query)}
              className="btn-copy"
              title="Copy to clipboard"
            >
              📋 Copy Query
            </button>

            <a
              href={compiled.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-search"
            >
              🚀 Search on {engine.charAt(0).toUpperCase() + engine.slice(1)}
            </a>
          </div>

          {/* Query Stats */}
          <div className="query-stats">
            <span className="stat-item">
              📊 {compiled.query.split(' ').filter(Boolean).length} terms
            </span>
            <span className="stat-item">
              📏 {compiled.query.length} characters
            </span>
            {compiled.warnings.length > 0 && (
              <span className="stat-warning">
                ⚠️ {compiled.warnings.length} warning(s)
              </span>
            )}
          </div>

          {/* Warnings */}
          {compiled.warnings.length > 0 && (
            <div className="query-warnings">
              {compiled.warnings.map((warning, index) => (
                <div key={index} className="warning-item">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

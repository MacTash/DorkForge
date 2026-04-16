/**
 * LeftPanelSimplified - Intent-Based Query Builder
 * Focuses on user goals rather than search operators
 */

import { useState } from 'react';
import { TagInput } from './TagInput';

interface DorkFormState {
  domains: string[];
  inUrl: string[];
  inTitle: string[];
  exactTerms: string[];
  broadTerms: string[];
  fileTypes: string[];
  excludeTerms: string[];
  inText: string[];
}

interface LeftPanelProps {
  state: DorkFormState;
  onUpdate: <K extends keyof DorkFormState>(key: K, value: DorkFormState[K]) => void;
}

export function LeftPanelSimplified({ state, onUpdate }: LeftPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="left-panel">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title accent">QUERY BUILDER</h2>
        <p className="panel-subtitle">Build your search step by step.</p>
      </div>

      <div className="panel-content">
        {/* Basic Section - Always Visible */}
        <section className="section basic-section">
          <h3 className="section-title">1️⃣ What are you looking for?</h3>

          <TagInput
            label="Keywords (any of these words)"
            placeholder="password, api_key, confidential"
            values={state.broadTerms}
            onChange={(v) => onUpdate('broadTerms', v)}
          />

          <TagInput
            label="Exact phrases (must match exactly)"
            placeholder={"\"internal use only\""}
            values={state.exactTerms}
            onChange={(v) => onUpdate('exactTerms', v)}
          />

          <TagInput
            label="File types"
            placeholder="pdf, docx, env, sql"
            values={state.fileTypes}
            onChange={(v) => onUpdate('fileTypes', v)}
          />
        </section>

        {/* Location Section */}
        <section className="section location-section">
          <h3 className="section-title">2️⃣ Where should we look?</h3>

          <TagInput
            label="Specific websites (optional)"
            placeholder="example.com, github.com"
            values={state.domains}
            onChange={(v) => onUpdate('domains', v)}
          />

          <TagInput
            label="Websites to exclude"
            placeholder="github.com, pinterest.com"
            values={state.excludeTerms}
            onChange={(v) => onUpdate('excludeTerms', v)}
          />
        </section>

        {/* Advanced Section - Collapsible */}
        {showAdvanced && (
          <section className="section advanced-section">
            <h3 className="section-title">🔍 Advanced Filters</h3>

            <TagInput
              label="Words in URL"
              placeholder="admin, login, api"
              values={state.inUrl}
              onChange={(v) => onUpdate('inUrl', v)}
            />

            <TagInput
              label="Words in page title"
              placeholder="dashboard, index of"
              values={state.inTitle}
              onChange={(v) => onUpdate('inTitle', v)}
            />

            <TagInput
              label="Words in page content"
              placeholder="error, warning, credentials"
              values={state.inText}
              onChange={(v) => onUpdate('inText', v)}
            />
          </section>
        )}

        {/* Show/Hide Advanced Toggle */}
        <div className="advanced-toggle">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-button"
          >
            {showAdvanced ? '🔼 Hide Advanced Options' : '🔽 Show Advanced Filters'}
          </button>
        </div>

        {/* Quick Help */}
        <div className="quick-help">
          <h4>💡 Pro Tips:</h4>
          <ul>
            <li>Start simple - just enter keywords</li>
            <li>Use exact phrases for specific terms</li>
            <li>Add file types to find documents</li>
            <li>Use advanced filters to refine results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export type { DorkFormState };

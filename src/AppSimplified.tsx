/**
 * AppSimplified - Simplified DorkForge interface
 * Integrates the new simplified components
 */

import './index.css';
import { useState, useMemo, useCallback } from 'react';
import type { RenderEngine, RootNode, QueryNode } from './lib/ast';
import {
  createRootNode,
  createPhraseNode,
  createSiteNode,
  createFiletypeNode,
  createInurlNode,
  createIntitleNode,
  createIntextNode,
  createNotNode,
  createTermNode,
} from './lib/ast';
import { DorkCompiler, analyzeQuery } from './lib/compiler';

import { LeftPanelSimplified, type DorkFormState } from './components/LeftPanelSimplified';
import { LiveQueryPreview } from './components/LiveQueryPreview';
import { SuggestionSystem } from './components/SuggestionSystem';
import { BottomPanel } from './components/BottomPanel';
import { SuggestionsPanel } from './components/SuggestionsPanel';

const INITIAL_STATE: DorkFormState = {
  domains: [],
  inUrl: [],
  inTitle: [],
  exactTerms: [],
  broadTerms: [],
  fileTypes: [],
  excludeTerms: [],
  inText: [],
};

function AppSimplified() {
  const [state, setState] = useState<DorkFormState>(INITIAL_STATE);
  const [engine, setEngine] = useState<RenderEngine>('google');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Build AST from form state with canonical ordering
  const ast = useMemo((): RootNode => {
    const children: QueryNode[] = [];

    // Site nodes
    if (state.domains.length > 0) {
      children.push(createSiteNode(state.domains));
    }

    // Filetype nodes
    if (state.fileTypes.length > 0) {
      children.push(createFiletypeNode(state.fileTypes));
    }

    // Structural operators
    if (state.inUrl.length > 0) {
      children.push(createInurlNode(state.inUrl));
    }

    if (state.inTitle.length > 0) {
      children.push(createIntitleNode(state.inTitle));
    }

    if (state.inText.length > 0) {
      children.push(createIntextNode(state.inText));
    }

    // Exact phrases
    for (const phrase of state.exactTerms) {
      children.push(createPhraseNode(phrase.replace(/^"|"$/g, '')));
    }

    // Broad terms
    for (const term of state.broadTerms) {
      children.push(createTermNode(term));
    }

    // Exclusions as NOT nodes
    for (const exclude of state.excludeTerms) {
      children.push(createNotNode(createSiteNode([exclude])));
    }

    return createRootNode(children);
  }, [state]);

  // Compile with canonical ordering
  const compiler = useMemo(() =>
    new DorkCompiler({
      engine,
      canonicalOrdering: true,
    }),
    [engine]
  );

  const compiledQuery = useMemo(() => compiler.compile(ast), [compiler, ast]);

  // Compile for all engines
  const allQueries = useMemo(() => ({
    google: new DorkCompiler({ engine: 'google', canonicalOrdering: true }).compile(ast),
    bing: new DorkCompiler({ engine: 'bing', canonicalOrdering: true }).compile(ast),
    duckduckgo: new DorkCompiler({ engine: 'duckduckgo', canonicalOrdering: true }).compile(ast),
  }), [ast]);

  // Analyze and lint
  const analysis = useMemo(() => analyzeQuery(ast), [ast]);

  // Update handler for form state
  const handleUpdate = useCallback(<K extends keyof DorkFormState>(
    key: K,
    value: DorkFormState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all
  const handleClear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // Handle suggestion application
  const handleApplySuggestion = useCallback((type: string, data: any) => {
    if (type === 'template') {
      // Apply a full template
      setState(prev => ({
        ...prev,
        broadTerms: data.broadTerms || prev.broadTerms,
        exactTerms: data.exactTerms || prev.exactTerms,
        fileTypes: data.fileTypes || prev.fileTypes,
        inTitle: data.inTitle || prev.inTitle,
        inUrl: data.inUrl || prev.inUrl,
        inText: data.inText || prev.inText,
      }));
    } else if (type === 'filetypes') {
      // Add file types
      setState(prev => ({
        ...prev,
        fileTypes: Array.isArray(data) ? data : [data]
      }));
    } else if (type === 'keywords') {
      // Add keywords
      setState(prev => ({
        ...prev,
        broadTerms: Array.isArray(data) ? data : [data]
      }));
    } else if (type === 'exclusion' || type === 'exclusions') {
      // Add exclusions
      setState(prev => ({
        ...prev,
        excludeTerms: Array.isArray(data) ? data : [data]
      }));
    }
  }, []);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <img src="/icon.svg" alt="DorkForge" className="brand-logo" />
          </div>
          <div className="brand-text">
            <h1>DORK<span className="accent">FORGE</span></h1>
            <p>Simplified Query Builder</p>
          </div>
        </div>

        <div className="header-controls">
          {/* Engine Selector */}
          <div className="engine-group">
            <span className="engine-label">TARGET ENGINE</span>
            <div className="engine-selector">
              {(['google', 'bing', 'duckduckgo'] as RenderEngine[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEngine(e)}
                  className={`engine-btn ${engine === e ? 'active' : ''}`}
                >
                  {e.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Button */}
          <button onClick={handleClear} className="btn-clear">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            CLEAR
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Simplified Layout */}
      <main className="app-main simplified">
        {/* Left Side - Input and Suggestions */}
        <div className="left-column">
          <div className="input-section">
            <LeftPanelSimplified state={state} onUpdate={handleUpdate} />
          </div>

          <div className="suggestions-section">
            <SuggestionSystem onApplySuggestion={handleApplySuggestion} />
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="right-column">
          <LiveQueryPreview ast={ast} engine={engine} />
        </div>
      </main>

      {/* STATUS BAR */}
      <BottomPanel
        hasQuery={ast.children.length > 0}
        onSuggestionsClick={() => setShowSuggestions(true)}
      />

      {/* Original Suggestions Panel (optional) */}
      <SuggestionsPanel
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  );
}

export default AppSimplified;

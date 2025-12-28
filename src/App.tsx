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


import { LeftPanel, type DorkFormState } from './components/LeftPanel';
import { CenterPanel } from './components/CenterPanel';
import { RightPanel } from './components/RightPanel';
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

function App() {
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
    const compiler = useMemo(() => new DorkCompiler({
        engine,
        canonicalOrdering: true,
    }), [engine]);

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
                        <p>Advanced Query Compiler</p>
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

            {/* MAIN CONTENT */}
            <main className="app-main">
                {/* Left Panel */}
                <aside className="panel panel-left">
                    <LeftPanel state={state} onUpdate={handleUpdate} />
                </aside>

                {/* Center Panel */}
                <section className="panel panel-center">
                    <CenterPanel ast={ast} />
                </section>

                {/* Right Panel */}
                <section className="panel panel-right">
                    <RightPanel
                        queries={allQueries}
                        analysis={analysis}
                        ast={ast}
                        engine={engine}
                    />
                </section>
            </main>

            {/* STATUS BAR */}
            <BottomPanel
                hasQuery={ast.children.length > 0}
                onSuggestionsClick={() => setShowSuggestions(true)}
            />

            {/* SUGGESTIONS PANEL */}
            <SuggestionsPanel
                isOpen={showSuggestions}
                onClose={() => setShowSuggestions(false)}
            />
        </div>
    );
}

export default App;


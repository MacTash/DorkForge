/**
 * DorkForge Library Index
 * Re-exports all core functionality
 */

// AST Types and Factory Functions
export type {
    ASTNodeType,
    RenderEngine,
    PlatformType,
    RiskLevel,
    PresetCategory,
    TermNode,
    PhraseNode,
    SiteNode,
    FiletypeNode,
    InurlNode,
    IntitleNode,
    IntextNode,
    PlatformNode,
    TimeframeNode,
    AndNode,
    OrNode,
    NotNode,
    QueryNode,
    QueryMetadata,
    RootNode,
    CompiledQuery,
    OperatorType,
} from './ast';

export {
    generateNodeId,
    createTermNode,
    createPhraseNode,
    createSiteNode,
    createFiletypeNode,
    createInurlNode,
    createIntitleNode,
    createIntextNode,
    createPlatformNode,
    createTimeframeNode,
    createAndNode,
    createOrNode,
    createNotNode,
    createRootNode,
    createOperatorNode,
    PLATFORM_DOMAINS,
    walkAST,
    countNodes,
    getNodeCategory,
    sortByCanonicalOrder,
} from './ast';

// Compiler
export type { EngineProfile, RenderOptions, QueryAnalysis } from './compiler';

export {
    ENGINE_PROFILES,
    DorkCompiler,
    compileToGoogle,
    compileToBing,
    compileToDuckDuckGo,
    compileToAllEngines,
    analyzeQuery,
} from './compiler';

// Linter
export type { LintSeverity, LintResult, LintSummary } from './linter';

export { QueryLinter, lintQuery } from './linter';

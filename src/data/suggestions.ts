/**
 * Suggestion Data - Centralized suggestion definitions
 * Separated from UI component for better maintainability
 */

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  preview: string;
  actionType: string;
  actionData: any;
}

// ============================================================================
// Query Templates
// ============================================================================

export const TEMPLATES: Suggestion[] = [
  {
    id: 'credentials',
    title: 'Find Credentials',
    description: 'Search for exposed passwords and API keys',
    category: 'templates',
    preview: 'filetype:env OR filetype:conf "password" OR "api_key"',
    actionType: 'template',
    actionData: {
      broadTerms: ['password', 'api_key', 'secret', 'token'],
      fileTypes: ['env', 'conf', 'ini', 'yaml'],
      inTitle: ['index of']
    }
  },
  {
    id: 'documents',
    title: 'Find Exposed Documents',
    description: 'Locate sensitive PDFs and office documents',
    category: 'templates',
    preview: 'filetype:pdf OR filetype:docx "confidential" OR "internal"',
    actionType: 'template',
    actionData: {
      fileTypes: ['pdf', 'docx', 'xlsx', 'pptx'],
      exactTerms: ['confidential', 'internal use only'],
      broadTerms: ['report', 'document', 'memo']
    }
  },
  {
    id: 'admin-panels',
    title: 'Find Admin Panels',
    description: 'Discover administration interfaces',
    category: 'templates',
    preview: 'inurl:admin OR intitle:"login" OR intitle:"dashboard"',
    actionType: 'template',
    actionData: {
      inUrl: ['admin', 'login', 'dashboard'],
      inTitle: ['admin', 'login', 'control panel'],
      broadTerms: ['administrator', 'management']
    }
  },
  {
    id: 'database-dumps',
    title: 'Find Database Dumps',
    description: 'Locate SQL dumps and database backups',
    category: 'templates',
    preview: 'filetype:sql OR filetype:bak "INSERT INTO" OR "CREATE TABLE"',
    actionType: 'template',
    actionData: {
      fileTypes: ['sql', 'bak', 'dump'],
      broadTerms: ['database', 'mysql', 'postgres'],
      inText: ['INSERT INTO', 'CREATE TABLE']
    }
  }
];

// ============================================================================
// File Type Suggestions
// ============================================================================

export const FILE_TYPE_SUGGESTIONS: Suggestion[] = [
  {
    id: 'documents',
    title: 'Documents',
    description: 'PDF, Word, Excel, PowerPoint',
    category: 'filetypes',
    preview: 'filetype:pdf filetype:docx filetype:xlsx',
    actionType: 'filetypes',
    actionData: ['pdf', 'docx', 'xlsx', 'pptx']
  },
  {
    id: 'configs',
    title: 'Config Files',
    description: 'Configuration and environment files',
    category: 'filetypes',
    preview: 'filetype:env filetype:conf filetype:ini',
    actionType: 'filetypes',
    actionData: ['env', 'conf', 'ini', 'yaml', 'json']
  },
  {
    id: 'code',
    title: 'Code Files',
    description: 'Source code and scripts',
    category: 'filetypes',
    preview: 'filetype:php filetype:js filetype:py',
    actionType: 'filetypes',
    actionData: ['php', 'js', 'py', 'java', 'ruby', 'go']
  },
  {
    id: 'databases',
    title: 'Database Files',
    description: 'SQL dumps and database backups',
    category: 'filetypes',
    preview: 'filetype:sql filetype:bak filetype:dump',
    actionType: 'filetypes',
    actionData: ['sql', 'bak', 'dump', 'mdb']
  }
];

// ============================================================================
// Exclusion Suggestions
// ============================================================================

export const EXCLUSION_SUGGESTIONS: Suggestion[] = [
  {
    id: 'github',
    title: 'Exclude GitHub',
    description: 'Remove GitHub from search results',
    category: 'exclusions',
    preview: '-site:github.com',
    actionType: 'exclusion',
    actionData: 'github.com'
  },
  {
    id: 'pinterest',
    title: 'Exclude Pinterest',
    description: 'Remove Pinterest from search results',
    category: 'exclusions',
    preview: '-site:pinterest.com',
    actionType: 'exclusion',
    actionData: 'pinterest.com'
  },
  {
    id: 'blogs',
    title: 'Exclude Blogs',
    description: 'Remove blog pages from results',
    category: 'exclusions',
    preview: '-inurl:blog',
    actionType: 'exclusion',
    actionData: 'blog'
  },
  {
    id: 'social',
    title: 'Exclude Social Media',
    description: 'Remove major social networks',
    category: 'exclusions',
    preview: '-site:facebook.com -site:twitter.com',
    actionType: 'exclusions',
    actionData: ['facebook.com', 'twitter.com', 'linkedin.com']
  }
];

// ============================================================================
// Keyword Suggestions
// ============================================================================

export const KEYWORD_SUGGESTIONS: Suggestion[] = [
  {
    id: 'credentials',
    title: 'Credential Keywords',
    description: 'Passwords, API keys, and secrets',
    category: 'keywords',
    preview: 'password api_key secret token',
    actionType: 'keywords',
    actionData: ['password', 'api_key', 'secret', 'token', 'credentials']
  },
  {
    id: 'sensitive',
    title: 'Sensitive Content',
    description: 'Confidential and internal documents',
    category: 'keywords',
    preview: 'confidential internal private restricted',
    actionType: 'keywords',
    actionData: ['confidential', 'internal', 'private', 'restricted', 'secret']
  },
  {
    id: 'admin',
    title: 'Admin Related',
    description: 'Administration and login terms',
    category: 'keywords',
    preview: 'admin login dashboard control panel',
    actionType: 'keywords',
    actionData: ['admin', 'login', 'dashboard', 'control', 'panel', 'administrator']
  },
  {
    id: 'errors',
    title: 'Error Messages',
    description: 'Common error and debug terms',
    category: 'keywords',
    preview: 'error warning exception traceback',
    actionType: 'keywords',
    actionData: ['error', 'warning', 'exception', 'traceback', 'debug']
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getAllSuggestions(): Suggestion[] {
  return [
    ...TEMPLATES,
    ...FILE_TYPE_SUGGESTIONS,
    ...EXCLUSION_SUGGESTIONS,
    ...KEYWORD_SUGGESTIONS
  ];
}

export type { Suggestion };

/**
 * SuggestionSystem - Contextual query building assistance
 * Provides templates, shortcuts, and recommendations
 */

import { useState } from 'react';
import {
  TEMPLATES,
  FILE_TYPE_SUGGESTIONS,
  EXCLUSION_SUGGESTIONS,
  KEYWORD_SUGGESTIONS,
  type Suggestion
} from '../data/suggestions';

interface SuggestionSystemProps {
  onApplySuggestion: (suggestionType: string, data: any) => void;
}

export function SuggestionSystem({ onApplySuggestion }: SuggestionSystemProps) {
  const [activeCategory, setActiveCategory] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');

  // Transform suggestions to include action functions
  const templates = TEMPLATES.map(suggestion => ({
    ...suggestion,
    action: () => onApplySuggestion(suggestion.actionType, suggestion.actionData)
  }));

  const fileTypeSuggestions = FILE_TYPE_SUGGESTIONS.map(suggestion => ({
    ...suggestion,
    action: () => onApplySuggestion(suggestion.actionType, suggestion.actionData)
  }));

  const exclusionSuggestions = EXCLUSION_SUGGESTIONS.map(suggestion => ({
    ...suggestion,
    action: () => onApplySuggestion(suggestion.actionType, suggestion.actionData)
  }));

  const keywordSuggestions = KEYWORD_SUGGESTIONS.map(suggestion => ({
    ...suggestion,
    action: () => onApplySuggestion(suggestion.actionType, suggestion.actionData)
  }));

  // Filter suggestions based on search term
  const filteredSuggestions = [
    ...templates,
    ...fileTypeSuggestions,
    ...exclusionSuggestions,
    ...keywordSuggestions
  ].filter(suggestion =>
    suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category for display
  const suggestionsByCategory = filteredSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  return (
    <div className="suggestion-system">
      <div className="suggestions-header">
        <h3 className="suggestions-title">⚡ Quick Start</h3>
        <p className="suggestions-subtitle">Choose a template or get suggestions</p>

        <div className="suggestions-search">
          <input
            type="text"
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="suggestions-tabs">
        <button
          className={`tab-button ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Suggestions
        </button>
        <button
          className={`tab-button ${activeCategory === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveCategory('templates')}
        >
          Templates
        </button>
        <button
          className={`tab-button ${activeCategory === 'filetypes' ? 'active' : ''}`}
          onClick={() => setActiveCategory('filetypes')}
        >
          File Types
        </button>
        <button
          className={`tab-button ${activeCategory === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveCategory('keywords')}
        >
          Keywords
        </button>
        <button
          className={`tab-button ${activeCategory === 'exclusions' ? 'active' : ''}`}
          onClick={() => setActiveCategory('exclusions')}
        >
          Exclusions
        </button>
      </div>

      <div className="suggestions-list">
        {Object.entries(suggestionsByCategory).map(([category, suggestions]) => {
          // Filter by active category if not 'all'
          if (activeCategory !== 'all' && activeCategory !== category) {
            return null;
          }

          return (
            <div key={category} className="suggestion-category">
              <h4 className="category-title">
                {category === 'templates' ? '🎯 Query Templates' : ''}
                {category === 'filetypes' ? '📁 File Type Groups' : ''}
                {category === 'keywords' ? '🔑 Keyword Groups' : ''}
                {category === 'exclusions' ? '❌ Common Exclusions' : ''}
              </h4>

              {suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="suggestion-card"
                  onClick={suggestion.action}
                >
                  <div className="suggestion-header">
                    <h5 className="suggestion-title">{suggestion.title}</h5>
                    <span className="apply-badge">⚡ Apply</span>
                  </div>
                  <p className="suggestion-description">{suggestion.description}</p>
                  <div className="suggestion-preview">
                    <code>{suggestion.preview}</code>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {filteredSuggestions.length === 0 && (
          <div className="no-suggestions">
            <p>No suggestions match your search.</p>
          </div>
        )}
      </div>

      <div className="suggestions-footer">
        <p>💡 Tip: Click any suggestion to apply it to your query</p>
      </div>
    </div>
  );
}

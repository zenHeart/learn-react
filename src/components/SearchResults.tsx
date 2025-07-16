import React from 'react';
import { useSearch } from './SearchProvider';
import { SearchResult } from '../utils/searchEngine';
import styles from './SearchResults.module.css';

interface SearchResultsProps {
  className?: string;
}

export function SearchResults({ className = '' }: SearchResultsProps) {
  const {
    query,
    results,
    totalResults,
    isSearching,
    selectedIndex,
    selectResult,
    navigateToSelected
  } = useSearch();

  if (!query && !isSearching) {
    return null;
  }

  if (isSearching) {
    return (
      <div className={`search-results ${className}`}>
        <div className="search-results-loading">
          <div className="search-loading-spinner">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="spinning">
              <path d="M8 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8ZM8 2a6 6 0 1 0 6 6 6.007 6.007 0 0 0-6-6Z" opacity="0.4"/>
              <path d="M8 0a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6V0Z"/>
            </svg>
          </div>
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className={`search-results ${className}`}>
        <div className="search-results-empty">
          <div className="search-empty-icon">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          <div className="search-empty-text">
            <h3>No results found</h3>
            <p>Try adjusting your search terms or check the syntax guide</p>
          </div>
        </div>
      </div>
    );
  }

  // 按类型分组结果
  const groupedResults = results.reduce((groups, result, index) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push({ ...result, originalIndex: index });
    return groups;
  }, {} as Record<string, Array<SearchResult & { originalIndex: number }>>);

  const handleResultClick = (result: SearchResult, index: number) => {
    selectResult(index);
    navigateToSelected();
  };

  const handleResultMouseEnter = (index: number) => {
    selectResult(index);
  };

  const renderHighlight = (fragments: string[]) => {
    if (fragments.length === 0) return null;
    
    return (
      <div className="search-result-highlight">
        {fragments.slice(0, 2).map((fragment, index) => (
          <div
            key={index}
            className="search-highlight-fragment"
            dangerouslySetInnerHTML={{ __html: fragment }}
          />
        ))}
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        );
      case 'markdown':
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            <path d="M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z"/>
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 10.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 12a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z"/>
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'demo': return 'Demos';
      case 'markdown': return 'Documentation';
      case 'code': return 'Code';
      default: return 'Files';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return '#22c55e'; // green
    if (score >= 3) return '#f59e0b'; // amber
    return '#64748b'; // gray
  };

  return (
    <div className={`search-results ${className}`}>
      <div className="search-results-header">
        <span className="search-results-count">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
        </span>
        <div className="search-results-tips">
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
        </div>
      </div>

      <div className="search-results-content">
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <div key={type} className="search-results-group">
            <div className="search-group-header">
              <div className="search-group-icon">
                {getTypeIcon(type)}
              </div>
              <span className="search-group-title">
                {getTypeLabel(type)} ({typeResults.length})
              </span>
            </div>

            <div className="search-group-results">
              {typeResults.map((result) => (
                <div
                  key={result.id}
                  className={`search-result-item ${selectedIndex === result.originalIndex ? 'selected' : ''}`}
                  onClick={() => handleResultClick(result, result.originalIndex)}
                  onMouseEnter={() => handleResultMouseEnter(result.originalIndex)}
                >
                  <div className="search-result-header">
                    <div className="search-result-title">
                      <span className="search-result-name">
                        {result.title || result.name}
                      </span>
                      <div className="search-result-meta">
                        <span className="search-result-path">{result.path}</span>
                        <span 
                          className="search-result-score"
                          style={{ color: getScoreColor(result.score) }}
                        >
                          {result.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.tags.length > 0 && (
                    <div className="search-result-tags">
                      {result.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="search-result-tag">
                          {tag}
                        </span>
                      ))}
                      {result.tags.length > 4 && (
                        <span className="search-result-tag-more">
                          +{result.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {result.highlights.length > 0 && (
                    <div className="search-result-highlights">
                      {result.highlights.map((highlight, index) => (
                        <div key={index} className="search-result-highlight-group">
                          <span className="search-highlight-field">
                            {highlight.field}:
                          </span>
                          {renderHighlight(highlight.fragments)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .search-results {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          max-height: 500px;
          overflow-y: auto;
        }

        .search-results-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-primary);
          border-radius: 8px 8px 0 0;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .search-results-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          margin-bottom: 4px;
        }

        .search-results-tips {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .search-results-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px 16px;
          color: var(--text-secondary);
        }

        .search-loading-spinner .spinning {
          animation: spin 1s linear infinite;
        }

        .search-results-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          text-align: center;
        }

        .search-empty-icon {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .search-empty-text h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .search-empty-text p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .search-results-content {
          padding: 8px 0;
        }

        .search-results-group {
          margin-bottom: 16px;
        }

        .search-results-group:last-child {
          margin-bottom: 0;
        }

        .search-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-hover);
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-group-icon {
          color: var(--text-secondary);
        }

        .search-group-results {
          padding: 4px 0;
        }

        .search-result-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: var(--bg-hover);
          border-left-color: var(--accent-color, #007acc);
        }

        .search-result-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .search-result-title {
          flex: 1;
          min-width: 0;
        }

        .search-result-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          margin-bottom: 2px;
        }

        .search-result-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .search-result-path {
          color: var(--text-secondary);
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-result-score {
          font-weight: 600;
          font-size: 11px;
          padding: 2px 6px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .search-result-tags {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .search-result-tag {
          padding: 2px 6px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .search-result-tag-more {
          padding: 2px 6px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 500;
          font-style: italic;
        }

        .search-result-highlights {
          margin-top: 8px;
        }

        .search-result-highlight-group {
          margin-bottom: 6px;
        }

        .search-result-highlight-group:last-child {
          margin-bottom: 0;
        }

        .search-highlight-field {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-right: 8px;
        }

        .search-result-highlight {
          margin-top: 4px;
        }

        .search-highlight-fragment {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 2px;
        }

        .search-highlight-fragment:last-child {
          margin-bottom: 0;
        }

        .search-highlight-fragment :global(mark) {
          background: var(--accent-color, #007acc);
          color: white;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 600;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 自定义滚动条 */
        .search-results::-webkit-scrollbar {
          width: 6px;
        }

        .search-results::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }

        .search-results::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        .search-results::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }
      `}</style>
    </div>
  );
} 
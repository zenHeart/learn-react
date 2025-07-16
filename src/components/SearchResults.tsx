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
      <div className={`${styles.searchResults} ${className}`}>
        <div className={styles.searchResultsLoading}>
          <div className={styles.searchLoadingSpinner}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className={styles.spinning}>
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
      <div className={`${styles.searchResults} ${className}`}>
        <div className={styles.searchResultsEmpty}>
          <div className={styles.searchEmptyIcon}>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          <div className={styles.searchEmptyText}>
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
      <div className={styles.searchResultHighlight}>
        {fragments.slice(0, 2).map((fragment, index) => (
          <div
            key={index}
            className={styles.searchHighlightFragment}
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
    <div className={`${styles.searchResults} ${className}`}>
      <div className={styles.searchResultsHeader}>
        <span className={styles.searchResultsCount}>
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
        </span>
        <div className={styles.searchResultsTips}>
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
        </div>
      </div>

      <div className={styles.searchResultsContent}>
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <div key={type} className={styles.searchResultsGroup}>
            <div className={styles.searchGroupHeader}>
              <div className={styles.searchGroupIcon}>
                {getTypeIcon(type)}
              </div>
              <span className={styles.searchGroupTitle}>
                {getTypeLabel(type)} ({typeResults.length})
              </span>
            </div>

            <div className={styles.searchGroupResults}>
              {typeResults.map((result) => (
                <div
                  key={result.id}
                  className={`${styles.searchResultItem} ${selectedIndex === result.originalIndex ? styles.selected : ''}`}
                  onClick={() => handleResultClick(result, result.originalIndex)}
                  onMouseEnter={() => handleResultMouseEnter(result.originalIndex)}
                >
                  <div className={styles.searchResultHeader}>
                    <div className={styles.searchResultTitle}>
                      <span className={styles.searchResultName}>
                        {result.title || result.name}
                      </span>
                      <div className={styles.searchResultMeta}>
                        <span className={styles.searchResultPath}>{result.path}</span>
                        <span 
                          className={styles.searchResultScore}
                          style={{ color: getScoreColor(result.score) }}
                        >
                          {result.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.tags.length > 0 && (
                    <div className={styles.searchResultTags}>
                      {result.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className={styles.searchResultTag}>
                          {tag}
                        </span>
                      ))}
                      {result.tags.length > 4 && (
                        <span className={styles.searchResultTagMore}>
                          +{result.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {result.highlights.length > 0 && (
                    <div className={styles.searchResultHighlights}>
                      {result.highlights.map((highlight, index) => (
                        <div key={index} className={styles.searchResultHighlightGroup}>
                          <span className={styles.searchHighlightField}>
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


    </div>
  );
} 
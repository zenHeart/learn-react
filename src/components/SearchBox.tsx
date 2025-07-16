import React, { useRef, useEffect, useState } from 'react';
import { useSearch } from './SearchProvider';

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
}

export function SearchBox({ placeholder = 'Search demos and docs...', className = '' }: SearchBoxProps) {
  const {
    query,
    search,
    clearSearch,
    searchHistory,
    isSearching
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    search(value);
  };

  const handleClear = () => {
    clearSearch();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (!query && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleInputBlur = () => {
    // 延迟隐藏历史，以便点击历史项
    setTimeout(() => {
      setShowHistory(false);
    }, 200);
  };

  const handleHistoryClick = (historyQuery: string) => {
    search(historyQuery);
    setShowHistory(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
    </svg>
  );

  const ClearIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  );

  const LoadingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="search-loading">
      <path d="M8 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8ZM8 2a6 6 0 1 0 6 6 6.007 6.007 0 0 0-6-6Z" opacity="0.4"/>
      <path d="M8 0a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6V0Z"/>
    </svg>
  );

  const HelpIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
    </svg>
  );

  return (
    <div className={`search-box ${className}`}>
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <div className="search-icon">
            <SearchIcon />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          <div className="search-controls">
            {isSearching && <LoadingIcon />}
            
            {query && !isSearching && (
              <button
                className="search-clear-btn"
                onClick={handleClear}
                title="Clear search"
              >
                <ClearIcon />
              </button>
            )}
            
            <button
              className="search-help-btn"
              onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
              title="Search syntax help"
            >
              <HelpIcon />
            </button>
          </div>
        </div>

        {/* 搜索历史 */}
        {showHistory && searchHistory.length > 0 && (
          <div className="search-history">
            <div className="search-history-header">Recent searches</div>
            {searchHistory.slice(0, 5).map((historyQuery, index) => (
              <button
                key={index}
                className="search-history-item"
                onClick={() => handleHistoryClick(historyQuery)}
              >
                <span className="search-history-icon">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                </span>
                {historyQuery}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 语法帮助 */}
      {showSyntaxHelp && (
        <div className="search-syntax-help">
          <div className="search-syntax-header">
            <h4>Search Syntax</h4>
            <button
              className="search-syntax-close"
              onClick={() => setShowSyntaxHelp(false)}
            >
              <ClearIcon />
            </button>
          </div>
          
          <div className="search-syntax-content">
            <div className="search-syntax-section">
              <h5>Basic Search</h5>
              <div className="search-syntax-examples">
                <div className="search-syntax-example">
                  <code>react hooks</code>
                  <span>Search for "react" and "hooks"</span>
                </div>
                <div className="search-syntax-example">
                  <code>"react hooks"</code>
                  <span>Search for exact phrase</span>
                </div>
              </div>
            </div>

            <div className="search-syntax-section">
              <h5>Field Search</h5>
              <div className="search-syntax-examples">
                <div className="search-syntax-example">
                  <code>title:hooks</code>
                  <span>Search in title field</span>
                </div>
                <div className="search-syntax-example">
                  <code>tags:javascript</code>
                  <span>Search in tags</span>
                </div>
                <div className="search-syntax-example">
                  <code>content:useState</code>
                  <span>Search in content</span>
                </div>
                <div className="search-syntax-example">
                  <code>path:component</code>
                  <span>Search in file path</span>
                </div>
              </div>
            </div>

            <div className="search-syntax-section">
              <h5>Boolean Operators</h5>
              <div className="search-syntax-examples">
                <div className="search-syntax-example">
                  <code>react AND hooks</code>
                  <span>Both terms must exist</span>
                </div>
                <div className="search-syntax-example">
                  <code>react OR vue</code>
                  <span>Either term can exist</span>
                </div>
                <div className="search-syntax-example">
                  <code>react NOT class</code>
                  <span>Exclude second term</span>
                </div>
              </div>
            </div>

            <div className="search-syntax-section">
              <h5>Wildcards & Fuzzy</h5>
              <div className="search-syntax-examples">
                <div className="search-syntax-example">
                  <code>react*</code>
                  <span>Starts with "react"</span>
                </div>
                <div className="search-syntax-example">
                  <code>hook?</code>
                  <span>Single character wildcard</span>
                </div>
                <div className="search-syntax-example">
                  <code>react~</code>
                  <span>Fuzzy search (typo tolerance)</span>
                </div>
              </div>
            </div>

            <div className="search-syntax-section">
              <h5>Grouping</h5>
              <div className="search-syntax-examples">
                <div className="search-syntax-example">
                  <code>(title:react OR content:react) AND tags:hooks</code>
                  <span>Complex queries with grouping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-box {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-input-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent-color, #007acc);
          box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
        }

        .search-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          color: var(--text-secondary);
        }

        .search-input {
          flex: 1;
          padding: 12px 8px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .search-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
        }

        .search-clear-btn,
        .search-help-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-clear-btn:hover,
        .search-help-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .search-loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .search-history {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-top: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1100;
          max-height: 200px;
          overflow-y: auto;
        }

        .search-history-header {
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .search-history-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .search-history-item:hover {
          background: var(--bg-hover);
        }

        .search-history-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .search-syntax-help {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-top: 4px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 1100;
          max-height: 400px;
          overflow-y: auto;
        }

        .search-syntax-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .search-syntax-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .search-syntax-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-syntax-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .search-syntax-content {
          padding: 16px;
        }

        .search-syntax-section {
          margin-bottom: 16px;
        }

        .search-syntax-section:last-child {
          margin-bottom: 0;
        }

        .search-syntax-section h5 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .search-syntax-examples {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .search-syntax-example {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .search-syntax-example code {
          background: var(--bg-hover);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          color: var(--accent-color, #007acc);
          white-space: nowrap;
        }

        .search-syntax-example span {
          font-size: 12px;
          color: var(--text-secondary);
          text-align: right;
          flex: 1;
        }
      `}</style>
    </div>
  );
} 
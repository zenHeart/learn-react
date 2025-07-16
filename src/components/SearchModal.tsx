import React, { useEffect } from 'react';
import { useSearch } from './SearchProvider';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';

interface SearchModalProps {
  className?: string;
}

export function SearchModal({ className = '' }: SearchModalProps) {
  const { isSearchOpen, closeSearch } = useSearch();

  // 处理模态框外点击关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  // 阻止模态框内容区域的点击事件冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 监听窗口大小变化，移动端体验优化
  useEffect(() => {
    if (isSearchOpen) {
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) {
    return null;
  }

  return (
    <div className={`search-modal ${className}`} onClick={handleOverlayClick}>
      <div className="search-modal-content" onClick={handleContentClick}>
        <div className="search-modal-header">
          <div className="search-modal-title">
            <span className="search-modal-icon">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </span>
            <span>Search</span>
          </div>
          
          <button
            className="search-modal-close"
            onClick={closeSearch}
            title="Close search (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>

        <div className="search-modal-body">
          <div className="search-modal-input">
            <SearchBox placeholder="Search demos, docs, and code..." />
          </div>
          
          <div className="search-modal-results">
            <SearchResults />
          </div>
        </div>

        <div className="search-modal-footer">
          <div className="search-modal-shortcuts">
            <div className="search-shortcut">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="search-shortcut">
              <kbd>Enter</kbd>
              <span>Select</span>
            </div>
            <div className="search-shortcut">
              <kbd>Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 1000;
          padding: 80px 20px 20px;
          animation: searchModalFadeIn 0.2s ease-out;
        }

        @keyframes searchModalFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(4px);
          }
        }

        .search-modal-content {
          width: 100%;
          max-width: 700px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          overflow: visible;
          animation: searchModalSlideIn 0.3s ease-out;
          max-height: calc(100vh - 160px);
          display: flex;
          flex-direction: column;
        }

        @keyframes searchModalSlideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .search-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .search-modal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .search-modal-icon {
          color: var(--text-secondary);
        }

        .search-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-modal-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .search-modal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }

        .search-modal-input {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          position: relative;
          z-index: 10;
        }

        .search-modal-results {
          flex: 1;
          overflow: hidden;
        }

        .search-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .search-modal-shortcuts {
          display: flex;
          gap: 16px;
        }

        .search-shortcut {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .search-shortcut kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          font-size: 10px;
          font-family: inherit;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          box-shadow: 0 1px 0 var(--border-color);
        }

        .search-modal-branding {
          font-size: 11px;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .search-modal {
            padding: 20px 16px;
            align-items: stretch;
          }

          .search-modal-content {
            max-height: 100%;
            border-radius: 12px;
          }

          .search-modal-header {
            padding: 12px 16px;
          }

          .search-modal-input {
            padding: 16px;
          }

          .search-modal-footer {
            padding: 8px 16px;
          }

          .search-modal-shortcuts {
            gap: 12px;
          }

          .search-shortcut {
            font-size: 11px;
          }

          .search-shortcut kbd {
            min-width: 16px;
            height: 16px;
            font-size: 9px;
          }

          .search-modal-branding {
            font-size: 10px;
          }
        }

        /* 小屏幕优化 */
        @media (max-width: 480px) {
          .search-modal {
            padding: 10px;
          }

          .search-modal-header {
            padding: 10px 12px;
          }

          .search-modal-title {
            font-size: 14px;
          }

          .search-modal-input {
            padding: 12px;
          }

          .search-modal-footer {
            flex-direction: column;
            gap: 8px;
            align-items: center;
            padding: 8px 12px;
          }

          .search-modal-shortcuts {
            gap: 8px;
          }
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .search-modal-content {
            border-width: 2px;
          }

          .search-modal-close:hover {
            border: 1px solid var(--text-primary);
          }
        }

        /* 减动效模式支持 */
        @media (prefers-reduced-motion: reduce) {
          .search-modal,
          .search-modal-content {
            animation: none;
          }

          .search-modal {
            backdrop-filter: none;
          }
        }
      `}</style>
    </div>
  );
} 
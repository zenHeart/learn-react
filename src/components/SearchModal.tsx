import React, { useEffect } from 'react';
import { useSearch } from './SearchProvider';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';
import styles from './SearchModal.module.css';

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
    <div className={`${styles.searchModal} ${className}`} onClick={handleOverlayClick}>
      <div className={styles.searchModalContent} onClick={handleContentClick}>
        <div className={styles.searchModalHeader}>
          <div className={styles.searchModalTitle}>
            <span className={styles.searchModalIcon}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </span>
            <span>Search</span>
          </div>
          
          <button
            className={styles.searchModalClose}
            onClick={closeSearch}
            title="Close search (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>

        <div className={styles.searchModalBody}>
          <div className={styles.searchModalInput}>
            <SearchBox placeholder="Search demos, docs, and code..." />
          </div>
          
          <div className={styles.searchModalResults}>
            <SearchResults />
          </div>
        </div>

        <div className={styles.searchModalFooter}>
          <div className={styles.searchModalShortcuts}>
            <div className={styles.searchShortcut}>
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>Navigate</span>
            </div>
            <div className={styles.searchShortcut}>
              <kbd>Enter</kbd>
              <span>Select</span>
            </div>
            <div className={styles.searchShortcut}>
              <kbd>Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
} 
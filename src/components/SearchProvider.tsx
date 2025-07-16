import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LuceneSearchEngine, SearchResult } from '../utils/searchEngine';
import { FLAT_COMPONENTS } from '../const';

interface SearchContextType {
  // 搜索状态
  query: string;
  isSearching: boolean;
  results: SearchResult[];
  totalResults: number;
  
  // 搜索历史
  searchHistory: string[];
  
  // UI 状态
  isSearchOpen: boolean;
  selectedIndex: number;
  
  // 搜索方法
  search: (query: string) => void;
  clearSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  
  // 导航方法
  selectNext: () => void;
  selectPrevious: () => void;
  selectResult: (index: number) => void;
  navigateToSelected: () => void;
  
  // 历史方法
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  
  // 搜索引擎实例
  searchEngine: LuceneSearchEngine;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  // 搜索引擎实例
  const searchEngine = useMemo(() => {
    const engine = new LuceneSearchEngine();
    engine.buildIndex(FLAT_COMPONENTS);
    return engine;
  }, []);

  // 搜索状态
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // UI 状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 搜索历史（保存在localStorage）
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('react-learn-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 保存搜索历史到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('react-learn-search-history', JSON.stringify(searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory]);

  // 防抖搜索
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(-1);

    // 清除之前的定时器
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (!newQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // 设置新的防抖定时器
    const timer = setTimeout(() => {
      try {
        const searchResults = searchEngine.search(newQuery, 50);
        setResults(searchResults);
        setTotalResults(searchResults.length);
        setIsSearching(false);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotalResults(0);
        setIsSearching(false);
      }
    }, 200); // 200ms 防抖

    setSearchDebounceTimer(timer);
  }, [searchEngine, searchDebounceTimer]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setIsSearching(false);
    setSelectedIndex(-1);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    clearSearch();
  }, [clearSearch]);

  // 键盘导航
  const selectNext = useCallback(() => {
    setSelectedIndex(prev => {
      const maxIndex = results.length - 1;
      return prev < maxIndex ? prev + 1 : 0;
    });
  }, [results.length]);

  const selectPrevious = useCallback(() => {
    setSelectedIndex(prev => {
      const maxIndex = results.length - 1;
      return prev > 0 ? prev - 1 : maxIndex;
    });
  }, [results.length]);

  const selectResult = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // 导航到选中的结果
  const navigateToSelected = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const result = results[selectedIndex];
      
      // 添加到搜索历史
      if (query.trim()) {
        addToHistory(query.trim());
      }

      // 关闭搜索
      closeSearch();

      // 导航到结果页面
      // 这里需要根据路由系统来实现导航
      const path = result.path;
      if (path) {
        // 假设使用 hash 路由
        window.location.hash = `#${path}`;
        
        // 或者使用其他路由方法
        // navigate(path);
        
        // 发送自定义事件，让其他组件监听
        window.dispatchEvent(new CustomEvent('search-navigate', {
          detail: { result, path }
        }));
      }
    }
  }, [selectedIndex, results, query, closeSearch]);

  // 搜索历史管理
  const addToHistory = useCallback((searchQuery: string) => {
    setSearchHistory(prev => {
      // 移除重复项并添加到顶部
      const filtered = prev.filter(item => item !== searchQuery);
      const newHistory = [searchQuery, ...filtered];
      
      // 限制历史记录数量
      return newHistory.slice(0, 20);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
        return;
      }

      // ESC 关闭搜索
      if (event.key === 'Escape' && isSearchOpen) {
        event.preventDefault();
        closeSearch();
        return;
      }

      // 只在搜索开启时处理其他快捷键
      if (!isSearchOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          selectNext();
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          selectPrevious();
          break;
          
        case 'Enter':
          event.preventDefault();
          navigateToSelected();
          break;
          
        case 'Tab':
          if (results.length > 0) {
            event.preventDefault();
            if (event.shiftKey) {
              selectPrevious();
            } else {
              selectNext();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, selectNext, selectPrevious, navigateToSelected, openSearch, closeSearch, results.length]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  const contextValue: SearchContextType = {
    // 搜索状态
    query,
    isSearching,
    results,
    totalResults,
    
    // 搜索历史
    searchHistory,
    
    // UI 状态
    isSearchOpen,
    selectedIndex,
    
    // 搜索方法
    search,
    clearSearch,
    openSearch,
    closeSearch,
    
    // 导航方法
    selectNext,
    selectPrevious,
    selectResult,
    navigateToSelected,
    
    // 历史方法
    addToHistory,
    clearHistory,
    
    // 搜索引擎实例
    searchEngine
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook for using search context
export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// Hook for search suggestions
export function useSearchSuggestions(query: string): string[] {
  const { searchEngine } = useSearch();
  
  return useMemo(() => {
    if (!query.trim()) return [];
    
    // 简单的建议算法：基于已有内容生成建议
    const suggestions: Set<string> = new Set();
    
    // 从搜索引擎的索引中提取可能的建议
    const allTags = new Set<string>();
    const allTitles = new Set<string>();
    
    // 这里需要从搜索引擎获取索引数据
    // 由于搜索引擎的索引是私有的，我们可以添加一个公共方法来获取建议
    
    return Array.from(suggestions).slice(0, 5);
  }, [query, searchEngine]);
} 
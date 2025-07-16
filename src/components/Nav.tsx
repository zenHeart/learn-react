import React, { useState, useEffect } from 'react'
import { NavLink, Route, Routes, useSearchParams, useLocation, Navigate, useNavigate } from 'react-router'
import Tags from './Tags'
import { DemoWithMarkdown } from './DemoWithMarkdown'
import { MarkdownRenderer } from './MarkdownRenderer'
import { parseMarkdownMeta, MarkdownMetadata, getReadingTime, formatReadingTime } from '../utils/markdownMeta';
import { useSearch } from './SearchProvider';

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    height: '100vh',
    position: 'relative' as const,
    overflowY: 'auto' as const,
  },
  sidebarExpanded: {
    width: '300px',
  },
  sidebarCollapsed: {
    width: '50px',
  },
  navHeader: {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navLink: {
    display: 'block',
    padding: '0.375rem 0.75rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.9375rem',
    '&:hover': {
      backgroundColor: 'var(--bg-hover)',
      color: 'var(--text-primary)',
    },
  },
  navLinkActive: {
    backgroundColor: 'var(--bg-active)',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  navSectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  content: {
    flex: 1,
    backgroundColor: 'var(--bg-primary)',
    height: '100vh',
    overflowY: 'auto' as const,
    display: 'sticky' as const,
    top: 0,
  },
  navContent: {
    overflowY: 'auto' as const,
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  navContentHidden: {
    display: 'none',
  },
};

interface NavItem {
  name: string;
  id?: number;
  component?: any;
  tags: string[];
  children?: NavItem[];
  hasMarkdown?: boolean;
  markdownContent?: string;
  isStandaloneMarkdown?: boolean;
  hasDirectoryDoc?: boolean;
  directoryDocContent?: string;
}

// 新增：纯 Markdown 渲染器组件
const MarkdownOnlyRenderer = ({ content }: { content: string }) => {
  const [tocItems, setTocItems] = useState<Array<{id: string, title: string, level: number}>>([]);
  const [showToc, setShowToc] = useState(false);
  const [metadata, setMetadata] = useState<MarkdownMetadata>({});

  // 提取文档标题生成TOC
  useEffect(() => {
    const extractToc = () => {
      // 使用解析后的内容（无YAML frontmatter）
      const { content: contentWithoutFrontMatter } = parseMarkdownMeta(content);
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const toc: Array<{id: string, title: string, level: number}> = [];
      let match;
      
      while ((match = headingRegex.exec(contentWithoutFrontMatter)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();
        const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        toc.push({
          id,
          title,
          level
        });
      }
      
      setTocItems(toc);
    };
    
    extractToc();
  }, [content]);

  const handleMetaParsed = (parsedMetadata: MarkdownMetadata) => {
    setMetadata(parsedMetadata);
  };

  const readingTime = getReadingTime(metadata);
  const formattedReadingTime = formatReadingTime(readingTime);

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{
        transform: expanded ? 'rotate(90deg)' : 'none',
        transition: 'transform 0.2s ease'
      }}
    >
      <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7 5.7 3l5.3 5.4z" />
    </svg>
  );

  const TocIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
    </svg>
  );

  return (
    <div className="markdown-standalone-container">
      <div className="markdown-standalone-header">
        <div className="markdown-standalone-title">
          <span className="markdown-icon">📝</span>
          <span>Documentation</span>
        </div>
        <div className="markdown-standalone-meta">
          {formattedReadingTime && (
            <span className="markdown-reading-time">
              {formattedReadingTime}
            </span>
          )}
          {tocItems.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowToc(!showToc)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Table of Contents"
              >
                <TocIcon />
                TOC
                <ChevronIcon expanded={showToc} />
              </button>
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 20,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto',
                display: showToc ? 'block' : 'none'
              }}>
                {tocItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      paddingLeft: `${12 + (item.level - 1) * 16}px`,
                      borderBottom: index < tocItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => {
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                      setShowToc(false);
                    }}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="markdown-standalone-content">
        <MarkdownRenderer content={content} className="standalone-markdown" onMetaParsed={handleMetaParsed} />
      </div>
    </div>
  );
};

function formatComponent(component: any, itemMeta?: any) {
  // 处理独立的 markdown 文件
  if (itemMeta?.isStandaloneMarkdown && itemMeta?.markdownContent) {
    return <MarkdownOnlyRenderer content={itemMeta.markdownContent} />;
  }
  
  // 检查是否有 markdown 文档
  if (itemMeta?.hasMarkdown && itemMeta?.markdownContent) {
    return (
      <DemoWithMarkdown 
        demoComponent={component}
        markdownContent={itemMeta.markdownContent}
      />
    );
  }
  
  // 原有逻辑保持不变
  // html 组件使用 iframe
  if (typeof component === 'string') {
    // @ts-ignore
    return <iframe srcDoc={component} />
  } else {
    return React.createElement(component)
  }
}

// Add a chevron icon component
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{
      transform: expanded ? 'rotate(90deg)' : 'none'
    }}
  >
    <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7 5.7 3l5.3 5.4z" />
  </svg>
);

// Home icon component
const HomeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ marginRight: '6px' }}
  >
    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z" />
  </svg>
);

// @ts-ignore
// Add new DarkModeIcon component
const DarkModeIcon = ({ isDark }: { isDark: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ marginRight: '6px' }}
  >
    {isDark ? (
      // Moon icon
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
    ) : (
      // Sun icon
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
    )}
  </svg>
);

// Search icon component
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ marginRight: '6px' }}
  >
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);

function Nav({ children, tagsColor }: { children: NavItem[], tagsColor: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has previously set dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Otherwise use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const filterTag = searchParams.get('tag');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Search functionality
  const { openSearch } = useSearch();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
    document.documentElement.classList.toggle('dark');
  };

  // Apply dark mode on mount and when changed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTagChange = (tag: string) => {
    setSearchParams({ tag });
  }

  const toggleGroup = (groupPath: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupPath)
        ? prev.filter(path => !path.startsWith(groupPath))
        : [...prev, groupPath]
    );
  }

  const matchesFilter = (item: NavItem): boolean => {
    if (!filterTag) return true;

    if (item.tags?.includes(filterTag)) return true;

    if (item.children) {
      return item.children.some(child => matchesFilter(child));
    }

    return false;
  }

  const renderNavItems = (items: NavItem[], parentPath = '', level = 0) => {
    return items
      .filter(matchesFilter)
      .map(item => {
        const currentPath = parentPath ? `${parentPath}/${item.name}` : `/${item.name}`;
        const itemTags = item.tags || [];
        const isExpanded = expandedGroups.includes(currentPath);

        if (item.children) {
          const filteredChildren = item.children.filter(matchesFilter);
          if (filteredChildren.length === 0) return null;

          return (
            <div key={currentPath} style={{ paddingLeft: `${level * 16}px` }}>
              <div
                style={{
                  ...styles.navSectionTitle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                {/* 如果目录有文档，则目录名可以点击跳转 */}
                {item.hasDirectoryDoc ? (
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <NavLink
                      style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.navLinkActive : {}),
                        padding: '6px 8px',
                        margin: '0',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9375rem',
                        fontWeight: 500
                      })}
                      to={currentPath}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.classList.contains('active')) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.classList.contains('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ 
                        marginRight: '6px', 
                        fontSize: '0.875em',
                        opacity: 0.7
                      }}>📄</span>
                      {item.name}
                      {itemTags.length > 0 && (
                        <span style={{ marginLeft: '8px' }}>
                          <Tags onClickTag={handleTagChange} tagsColor={tagsColor} tags={itemTags} />
                        </span>
                      )}
                    </NavLink>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-secondary)',
                        marginLeft: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleGroup(currentPath);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronIcon expanded={isExpanded} />
                    </button>
                  </div>
                ) : (
                  // 没有文档的目录保持原来的逻辑
                  <div
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => toggleGroup(currentPath)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        marginRight: '6px', 
                        fontSize: '0.875em',
                        opacity: 0.5
                      }}>📁</span>
                      {item.name}
                      {itemTags.length > 0 && (
                        <span style={{ marginLeft: '8px' }}>
                          <Tags onClickTag={handleTagChange} tagsColor={tagsColor} tags={itemTags} />
                        </span>
                      )}
                    </span>
                    <ChevronIcon expanded={isExpanded} />
                  </div>
                )}
              </div>
              <ul style={{
                display: isExpanded ? 'block' : 'none',
                margin: 0,
                padding: 0,
                listStyle: 'none',
              }}>
                {renderNavItems(item.children, currentPath, level + 1)}
              </ul>
            </div>
          );
        }

        return (
          <li key={currentPath} style={{
            paddingLeft: `${level * 16}px`,
            listStyle: 'none'
          }}>
            <NavLink
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
              to={currentPath}
            >
              {item.name}
              {itemTags.length > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  <Tags onClickTag={handleTagChange} tagsColor={tagsColor} tags={itemTags} />
                </span>
              )}
            </NavLink>
          </li>
        );
      })
      .filter(Boolean);
  }

  const flattenRoutes = (items: NavItem[], parentPath = ''): Array<{ name: string, path: string, component: any, tags: string[], hasMarkdown?: boolean, markdownContent?: string, isStandaloneMarkdown?: boolean, hasDirectoryDoc?: boolean }> => {
    return items.reduce((acc, item) => {
      const currentPath = parentPath ? `${parentPath}/${item.name}` : `/${item.name}`;

      if (item.children) {
        // 如果目录有文档，添加目录路由
        if (item.hasDirectoryDoc) {
          acc.push({
            name: item.name,
            path: currentPath,
            component: item.component,
            tags: item.tags || [],
            hasMarkdown: item.hasMarkdown,
            markdownContent: item.markdownContent || item.directoryDocContent,
            isStandaloneMarkdown: item.isStandaloneMarkdown,
            hasDirectoryDoc: item.hasDirectoryDoc
          });
        }
        
        // 继续处理子项
        return [...acc, ...flattenRoutes(item.children, currentPath)];
      }

      if (item.component || item.isStandaloneMarkdown) {
        return [...acc, {
          name: item.name,
          path: currentPath,
          component: item.component,
          tags: item.tags || [],
          hasMarkdown: item.hasMarkdown,
          markdownContent: item.markdownContent,
          isStandaloneMarkdown: item.isStandaloneMarkdown,
          hasDirectoryDoc: item.hasDirectoryDoc
        }];
      }
      return acc;
    }, [] as Array<{ name: string, path: string, component: any, tags: string[], hasMarkdown?: boolean, markdownContent?: string, isStandaloneMarkdown?: boolean, hasDirectoryDoc?: boolean }>);
  }

  // Update getFirstAvailableRoute to handle filtered routes
  const getFirstAvailableRoute = () => {
    const flatRoutes = flattenRoutes(children);
    const filteredRoutes = filterTag
      ? flatRoutes.filter(route => route.tags.includes(filterTag))
      : flatRoutes;
    return filteredRoutes[0]?.path || '/';
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleHomeClick = () => {
    setSearchParams({}); // Clear any search params
    setExpandedGroups([]); // Collapse all groups
    navigate(getFirstAvailableRoute()); // Navigate to first route
  };

  return (
    <div style={styles.layout}>
      <nav
        style={{
          ...styles.sidebar,
          ...(isSidebarExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed)
        }}
      >
        <div style={styles.navHeader}>
          {isSidebarExpanded && (
            <>
              <button
                onClick={handleHomeClick}
                style={buttonStyles.homeButton}
                title="Back to home"
              >
                <HomeIcon />
              </button>
              <button
                onClick={toggleDarkMode}
                style={buttonStyles.homeButton}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <DarkModeIcon isDark={isDarkMode} />
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={openSearch}
                style={buttonStyles.homeButton}
                title="Search (Ctrl/Cmd + K)"
              >
                <SearchIcon />
                Search
              </button>
            </>
          )}
          <button
            onClick={toggleSidebar}
            style={{
              ...buttonStyles.toggleButton,
              marginLeft: isSidebarExpanded ? 'auto' : 0,
            }}
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronIcon expanded={isSidebarExpanded} />
          </button>
        </div>
        <div
          style={{
            ...styles.navContent,
            ...(isSidebarExpanded ? {} : styles.navContentHidden)
          }}
        >
          <ul>
            {renderNavItems(children)}
          </ul>
        </div>
      </nav>
      <main style={styles.content}>
        <Routes>
          {flattenRoutes(children).map(({ path, component, hasMarkdown, markdownContent, isStandaloneMarkdown, hasDirectoryDoc }) => (
            <Route
              key={path}
              path={path}
              element={formatComponent(component, { hasMarkdown, markdownContent, isStandaloneMarkdown, hasDirectoryDoc })}
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={getFirstAvailableRoute()} replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

// Update global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f6f7f9;
    --bg-hover: #ebecf0;
    --bg-active: #e3e5e8;
    --text-primary: #000000;
    --text-secondary: #404756;
    --border-color: #ebecf0;
    --link-color: #087EA4;
    --logo-color: #23272F;
  }

  .dark {
    --bg-primary: #23272F;
    --bg-secondary: #1a1d23;
    --bg-hover: #2B3138;
    --bg-active: #36373D;
    --text-primary: #F6F7F9;
    --text-secondary: #EBECF0;
    --border-color: #343A46;
    --link-color: #149ECA;
    --logo-color: #F6F7F9;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  * {
    box-sizing: border-box;
  }

  /* Markdown 样式 */
  .markdown-content {
    line-height: 1.6;
    color: var(--text-primary);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    color: var(--text-primary);
    margin-top: 2em;
    margin-bottom: 0.75em;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown-content h1 {
    font-size: 2em;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5em;
    margin-top: 0;
  }

  .markdown-content h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  .markdown-content h3 {
    font-size: 1.25em;
  }

  .markdown-content h4 {
    font-size: 1em;
    font-weight: 600;
  }

  .markdown-content h5 {
    font-size: 0.875em;
    font-weight: 600;
  }

  .markdown-content h6 {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .markdown-content p {
    margin-bottom: 1em;
    color: var(--text-primary);
  }

  .markdown-content code {
    background-color: var(--bg-hover);
    color: var(--text-primary);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
    font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
    border: 1px solid var(--border-color);
  }

  .markdown-content pre {
    background-color: var(--bg-hover);
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
    margin: 1em 0;
  }

  .markdown-content pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    border: none;
    font-size: 0.875em;
  }

  .markdown-content a {
    color: var(--link-color);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .markdown-content a:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  .markdown-content strong {
    font-weight: 600;
    color: var(--text-primary);
  }

  .markdown-content em {
    font-style: italic;
    color: var(--text-primary);
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-bottom: 1em;
    padding-left: 2em;
  }

  .markdown-content li {
    margin-bottom: 0.5em;
    color: var(--text-primary);
  }

  .markdown-content blockquote {
    border-left: 4px solid var(--link-color);
    padding-left: 1em;
    margin: 1em 0;
    background-color: var(--bg-hover);
    border-radius: 0 4px 4px 0;
    padding: 0.75em 1em;
    font-style: italic;
    color: var(--text-secondary);
  }

  .markdown-content hr {
    border: none;
    height: 1px;
    background-color: var(--border-color);
    margin: 2em 0;
  }

  .markdown-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid var(--border-color);
    padding: 0.75em;
    text-align: left;
  }

  .markdown-content th {
    background-color: var(--bg-hover);
    font-weight: 600;
    color: var(--text-primary);
  }

  .markdown-content td {
    color: var(--text-primary);
  }

  .markdown-content tr:nth-child(even) {
    background-color: var(--bg-hover);
  }

  /* Demo markdown specific styles */
  .demo-markdown {
    font-size: 13px;
  }

  .demo-markdown h1 {
    font-size: 1.5em;
    margin-top: 1em;
  }

  .demo-markdown h2 {
    font-size: 1.25em;
    margin-top: 1.5em;
  }

  .demo-markdown h3 {
    font-size: 1.125em;
    margin-top: 1.25em;
  }

  .demo-markdown p {
    margin-bottom: 0.75em;
  }

  /* New standalone markdown styles */
  .markdown-standalone-container {
    padding: 32px;
    max-width: 900px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: var(--bg-primary);
  }

  .dark .markdown-standalone-container {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .markdown-standalone-container {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .markdown-standalone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--border-color);
    background-color: var(--bg-secondary);
    padding: 16px 24px;
    margin: -32px -32px 24px -32px;
    border-radius: 8px 8px 0 0;
  }

  .markdown-standalone-title {
    display: flex;
    align-items: center;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  .markdown-icon {
    font-size: 1.25em;
    margin-right: 10px;
  }

  .markdown-standalone-meta {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.875em;
    gap: 12px;
  }

  .markdown-reading-time {
    background-color: var(--bg-hover);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    border: 1px solid var(--border-color);
  }

  .markdown-standalone-content {
    color: var(--text-primary);
    font-size: 15px;
    line-height: 1.6;
  }

  .standalone-markdown h1:first-child {
    margin-top: 0;
  }

  /* Custom scrollbar styles */
  .markdown-standalone-container::-webkit-scrollbar,
  .markdown-content::-webkit-scrollbar {
    width: 8px;
  }

  .markdown-standalone-container::-webkit-scrollbar-track,
  .markdown-content::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  .markdown-standalone-container::-webkit-scrollbar-thumb,
  .markdown-content::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  .markdown-standalone-container::-webkit-scrollbar-thumb:hover,
  .markdown-content::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* Responsive design for standalone markdown */
  @media (max-width: 768px) {
    .markdown-standalone-container {
      padding: 16px;
      margin: 0;
    }
    
    .markdown-standalone-header {
      margin: -16px -16px 16px -16px;
      padding: 12px 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .markdown-standalone-content {
      font-size: 14px;
    }
  }
`;
document.head.appendChild(styleSheet);

// Update button styles
const buttonStyles = {
  homeButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-hover)',
    }
  },
  toggleButton: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    '&:hover': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-hover)',
    }
  },
};

export default Nav

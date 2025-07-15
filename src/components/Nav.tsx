import React, { useState, useEffect } from 'react'
import { NavLink, Route, Routes, useSearchParams, useLocation, Navigate, useNavigate } from 'react-router'
import Tags from './Tags'
import { DemoWithMarkdown } from './DemoWithMarkdown'

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
}

function formatComponent(component: any, itemMeta?: any) {
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
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
                onClick={() => toggleGroup(currentPath)}
              >
                {item.name}
                <ChevronIcon expanded={isExpanded} />
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

  const flattenRoutes = (items: NavItem[], parentPath = ''): Array<{ name: string, path: string, component: any, tags: string[], hasMarkdown?: boolean, markdownContent?: string }> => {
    return items.reduce((acc, item) => {
      const currentPath = parentPath ? `${parentPath}/${item.name}` : `/${item.name}`;

      if (item.children) {
        // Include both the current item (if it has a component) and its children
        // const routes = [...flattenRoutes(item.children, currentPath)];
        // if (item.component) {
        //   routes.unshift({
        //     name: item.name,
        //     path: currentPath,
        //     component: item.component,
        //     tags: item.tags || []
        //   });
        // }
        // return [...acc, ...routes];
        return [...acc, ...flattenRoutes(item.children, currentPath)];
      }

      if (item.component) {
        return [...acc, {
          name: item.name,
          path: currentPath,
          component: item.component,
          tags: item.tags || [],
          hasMarkdown: item.hasMarkdown,
          markdownContent: item.markdownContent
        }];
      }
      return acc;
    }, [] as Array<{ name: string, path: string, component: any, tags: string[], hasMarkdown?: boolean, markdownContent?: string }>);
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
          {flattenRoutes(children).map(({ path, component, hasMarkdown, markdownContent }) => (
            <Route
              key={path}
              path={path}
              element={formatComponent(component, { hasMarkdown, markdownContent })}
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
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4 {
    color: var(--text-primary);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }

  .markdown-content h1 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  .markdown-content h2 {
    font-size: 1.3em;
  }

  .markdown-content h3 {
    font-size: 1.1em;
  }

  .markdown-content h4 {
    font-size: 1em;
  }

  .markdown-content code {
    background-color: var(--bg-hover);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .markdown-content pre {
    background-color: var(--bg-hover);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
  }

  .markdown-content pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }

  .markdown-content a {
    color: var(--link-color);
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
  }

  .markdown-content p {
    margin-bottom: 1em;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }

  .markdown-content li {
    margin-bottom: 0.5em;
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

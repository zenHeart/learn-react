import React, { useState, useEffect } from 'react'
import { NavLink, Route, Routes, useSearchParams, useLocation, Navigate, useNavigate } from 'react-router-dom'
import Tags from './Tags'

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    borderRight: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    overflowY: 'auto' as const,
    position: 'relative' as const,
    height: '100vh'
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
    overflowY: 'auto' as const,
    display: 'sticky' as const,
    top: 0,
    height: '100vh',
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
}

function formatComponent(component: any) {
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

function Nav({ children, tagsColor }: { children: NavItem[], tagsColor: string }) {
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

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
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

  const renderNavItems = (items: NavItem[], parentPath = '') => {
    return items
      .filter(matchesFilter)
      .map(item => {
        const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        const itemTags = item.tags || [];
        const isExpanded = expandedGroups.includes(item.name);

        if (item.children) {
          const filteredChildren = item.children.filter(matchesFilter);
          if (filteredChildren.length === 0) return null;

          return (
            <div key={item.name} style={styles.navSection}>
              <div
                style={{
                  ...styles.navSectionTitle,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleGroup(item.name)}
              >
                {item.name}
                <ChevronIcon expanded={isExpanded} />
              </div>
              <ul style={{
                ...styles.navList,
                display: isExpanded ? 'block' : 'none',
              }}>
                {renderNavItems(item.children, item.name)}
              </ul>
            </div>
          );
        }

        return (
          <li key={currentPath} style={styles.navItem}>
            <NavLink
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
              to={{ pathname: currentPath, search: location.search }}
            >
              {item.name}
              {itemTags.length > 0 && (
                <span style={styles.navTags}>
                  <Tags onClickTag={handleTagChange} tagsColor={tagsColor} tags={itemTags} />
                </span>
              )}
            </NavLink>
          </li>
        );
      })
      .filter(Boolean);
  }

  const flattenRoutes = (items: NavItem[], parentPath = ''): Array<{ name: string, path: string, component: any, tags: string[] }> => {
    return items.reduce((acc, item) => {
      const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;

      if (item.children) {
        return [...acc, ...flattenRoutes(item.children, item.name)];
      }
      if (item.component) {
        return [...acc, {
          name: item.name,
          path: currentPath,
          component: item.component,
          tags: item.tags || []
        }];
      }
      return acc;
    }, [] as Array<{ name: string, path: string, component: any, tags: string[] }>);
  }

  // Get first available route for redirect
  const getFirstAvailableRoute = () => {
    const flatRoutes = flattenRoutes(children);
    return flatRoutes[0]?.path || '/';
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
            <ChevronIcon expanded={!isSidebarExpanded} />
          </button>
        </div>
        <div
          style={{
            ...styles.navContent,
            ...(isSidebarExpanded ? {} : styles.navContentHidden)
          }}
        >
          <ul style={styles.navList}>
            {renderNavItems(children)}
          </ul>
        </div>
      </nav>
      <main style={{
        ...styles.content,
      }}>
        <Routes>
          {flattenRoutes(children).map(({ path, component }) => (
            <Route
              key={path}
              path={path}
              element={formatComponent(component)}
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

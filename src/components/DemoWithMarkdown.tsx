import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DemoWithMarkdownProps {
  demoComponent: React.ComponentType | string;
  markdownContent: string;
}

export function DemoWithMarkdown({ demoComponent, markdownContent }: DemoWithMarkdownProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 渲染 demo 组件
  const renderDemo = () => {
    if (typeof demoComponent === 'string') {
      return <iframe srcDoc={demoComponent} style={{ width: '100%', height: '100%', border: 'none' }} />;
    } else {
      return React.createElement(demoComponent);
    }
  };
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: 'var(--bg-primary)'
  };
  
  const markdownSectionStyle: React.CSSProperties = {
    flex: isCollapsed ? '0 0 auto' : (isMobile ? 1 : '0 0 45%'),
    overflowY: 'auto',
    borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
    borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
    maxHeight: isMobile ? (isCollapsed ? '60px' : '50vh') : 'none',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    minWidth: isCollapsed ? 'auto' : (isMobile ? 'auto' : '400px')
  };
  
  const markdownHeaderStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  };
  
  const markdownContentStyle: React.CSSProperties = {
    padding: isCollapsed ? '0' : '24px',
    maxHeight: isCollapsed ? '0' : 'none',
    overflow: isCollapsed ? 'hidden' : 'visible',
    transition: 'all 0.3s ease'
  };
  
  const demoSectionStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative'
  };
  
  const toggleButtonStyle: React.CSSProperties = {
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
  };
  
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
  
  return (
    <div style={containerStyle}>
      <div style={markdownSectionStyle}>
        <div style={markdownHeaderStyle}>
          <span>📖 Documentation</span>
          <button
            style={toggleButtonStyle}
            onClick={() => setIsCollapsed(!isCollapsed)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {isCollapsed ? 'Show' : 'Hide'}
            <ChevronIcon expanded={!isCollapsed} />
          </button>
        </div>
        <div style={markdownContentStyle}>
          <MarkdownRenderer content={markdownContent} className="demo-markdown" />
        </div>
      </div>
      <div style={demoSectionStyle}>
        {renderDemo()}
      </div>
    </div>
  );
} 
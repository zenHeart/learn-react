import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DemoWithMarkdownProps {
  demoComponent: React.ComponentType | string;
  markdownContent: string;
}

export function DemoWithMarkdown({ demoComponent, markdownContent }: DemoWithMarkdownProps) {
  const [isMobile, setIsMobile] = useState(false);
  
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
    flexDirection: isMobile ? 'column' : 'row'
  };
  
  const markdownSectionStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
    borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
    maxHeight: isMobile ? '50vh' : 'none'
  };
  
  const demoSectionStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden'
  };
  
  return (
    <div style={containerStyle}>
      <div style={markdownSectionStyle}>
        <MarkdownRenderer content={markdownContent} />
      </div>
      <div style={demoSectionStyle}>
        {renderDemo()}
      </div>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { parseMarkdownMeta, MarkdownMetadata, getReadingTime, formatReadingTime } from '../utils/markdownMeta';

interface DemoWithMarkdownProps {
  demoComponent: React.ComponentType | string;
  markdownContent: string;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function DemoWithMarkdown({ demoComponent, markdownContent }: DemoWithMarkdownProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [metadata, setMetadata] = useState<MarkdownMetadata>({});
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 提取文档标题生成TOC
  useEffect(() => {
    const extractToc = () => {
      // 使用解析后的内容（无YAML frontmatter）
      const { content } = parseMarkdownMeta(markdownContent);
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const toc: TocItem[] = [];
      let match;
      
      while ((match = headingRegex.exec(content)) !== null) {
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
  }, [markdownContent]);

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setShowToc(false);
    }
  };

  const handleMetaParsed = (parsedMetadata: MarkdownMetadata) => {
    setMetadata(parsedMetadata);
  };

  const readingTime = getReadingTime(metadata);
  const formattedReadingTime = formatReadingTime(readingTime);
  
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
    flex: isMobile ? 1 : '0 0 45%',
    overflowY: 'auto',
    borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
    borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
    maxHeight: isMobile ? '50vh' : 'none',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    minWidth: isMobile ? 'auto' : '400px'
  };
  
  const markdownHeaderStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '13px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10
  };
  
  const markdownContentStyle: React.CSSProperties = {
    padding: '24px'
  };
  
  const demoSectionStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative'
  };
  
  const tocButtonStyle: React.CSSProperties = {
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

  const tocDropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: '20px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 20,
    minWidth: '200px',
    maxHeight: '300px',
    overflowY: 'auto',
    display: showToc ? 'block' : 'none'
  };

  const tocItemStyle = (level: number): React.CSSProperties => ({
    padding: '8px 12px',
    paddingLeft: `${12 + (level - 1) * 16}px`,
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease'
  });
  
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
    <div style={containerStyle}>
      <div style={markdownSectionStyle}>
        <div style={markdownHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
            <span style={{ fontSize: '1.25em', marginRight: '10px' }}>📖</span>
            <span>Documentation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {formattedReadingTime && (
              <span style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-hover)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75em',
                border: '1px solid var(--border-color)'
              }}>
                {formattedReadingTime}
              </span>
            )}
          {tocItems.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  style={tocButtonStyle}
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
                <div style={tocDropdownStyle}>
                  {tocItems.map((item, index) => (
                    <div
                      key={index}
                      style={tocItemStyle(item.level)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => {
                        scrollToHeading(item.id);
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
        <div style={markdownContentStyle}>
          <MarkdownRenderer content={markdownContent} className="demo-markdown" onMetaParsed={handleMetaParsed} />
        </div>
      </div>
      <div style={demoSectionStyle}>
        {renderDemo()}
      </div>
    </div>
  );
} 
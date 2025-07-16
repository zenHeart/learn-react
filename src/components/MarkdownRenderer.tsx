import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [html, setHtml] = React.useState('');
  
  React.useEffect(() => {
    const processMarkdown = async () => {
      try {
        // 动态导入 marked 库，如果安装失败则使用简单解析器
        const { marked } = await import('marked');
        
        // 移除 YAML front matter
        const contentWithoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        // 配置 marked
        marked.setOptions({
          breaks: true,
          gfm: true
        });

        const renderedHtml = marked(contentWithoutFrontMatter);
        // 如果 marked 返回 Promise，则等待其解析
        if (renderedHtml instanceof Promise) {
          renderedHtml.then((htmlString) => setHtml(htmlString));
        } else {
          setHtml(renderedHtml);
        }
      } catch (error) {
        console.warn('Failed to load marked, using simple parser', error);
        // 使用简单的 markdown 解析器作为后备
        const contentWithoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        let renderedHtml = contentWithoutFrontMatter
          // 标题
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
          .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
          .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
          // 粗体
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // 斜体
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // 行内代码
          .replace(/`(.*?)`/g, '<code>$1</code>')
          // 代码块
          .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
          // 链接
          .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
          // 水平线
          .replace(/^---$/gm, '<hr>')
          // 引用
          .replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>')
          // 有序列表
          .replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
          // 无序列表
          .replace(/^[-*+]\s+(.*)$/gm, '<li>$1</li>')
          // 段落（双换行分隔）
          .replace(/\n\n/g, '</p><p>')
          // 单换行
          .replace(/\n/g, '<br/>');
        
        // 包裹段落
        renderedHtml = `<p>${renderedHtml}</p>`;
        
        // 包裹列表项
        renderedHtml = renderedHtml.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/g, (match) => {
          if (match.includes('1.')) {
            return `<ol>${match}</ol>`;
          } else {
            return `<ul>${match}</ul>`;
          }
        });
        
        setHtml(renderedHtml);
      }
    };
    
    processMarkdown();
  }, [content]);
  
  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 
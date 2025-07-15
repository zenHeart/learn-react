import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
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
          gfm: true,
          highlight: function(code: string, lang: string) {
            return code; // 可以后续集成代码高亮
          }
        });
        
        const renderedHtml = marked(contentWithoutFrontMatter);
        setHtml(renderedHtml);
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
          // 粗体
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // 斜体
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // 行内代码
          .replace(/`(.*?)`/g, '<code>$1</code>')
          // 代码块
          .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
          // 链接
          .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>')
          // 列表
          .replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
          .replace(/^-\s+(.*)$/gm, '<li>$1</li>')
          // 换行
          .replace(/\n/g, '<br/>');
        
        // 包裹列表项
        renderedHtml = renderedHtml.replace(/(<li>.*<\/li>)+/g, (match) => {
          return `<ol>${match}</ol>`;
        });
        
        setHtml(renderedHtml);
      }
    };
    
    processMarkdown();
  }, [content]);
  
  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 
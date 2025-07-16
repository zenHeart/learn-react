import React from 'react';
import { parseMarkdownMeta, MarkdownMetadata } from '../utils/markdownMeta';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onMetaParsed?: (metadata: MarkdownMetadata) => void;
}

export function MarkdownRenderer({ content, className = '', onMetaParsed }: MarkdownRendererProps) {
  const [html, setHtml] = React.useState('');
  
  // 生成标题ID的函数
  const generateHeadingId = (text: string): string => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };
  
  React.useEffect(() => {
    const processMarkdown = async () => {
      try {
        // 解析 YAML frontmatter
        const { metadata, content: contentWithoutFrontMatter } = parseMarkdownMeta(content);
        
        // 通知父组件 metadata 已解析
        if (onMetaParsed) {
          onMetaParsed(metadata);
        }
        
        // 动态导入 marked 库，如果安装失败则使用简单解析器
        const { marked } = await import('marked');
        
        // 配置 marked
        marked.setOptions({
          breaks: true,
          gfm: true
        });

        const renderedHtml = marked(contentWithoutFrontMatter);
        // 如果 marked 返回 Promise，则等待其解析
        if (renderedHtml instanceof Promise) {
          renderedHtml.then((htmlString) => {
            // 为标题添加ID
            const htmlWithIds = htmlString.replace(
              /<h([1-6])>(.*?)<\/h[1-6]>/g,
              (match, level, text) => {
                const id = generateHeadingId(text);
                return `<h${level} id="${id}">${text}</h${level}>`;
              }
            );
            setHtml(htmlWithIds);
          });
        } else {
          // 为标题添加ID
          const htmlWithIds = renderedHtml.replace(
            /<h([1-6])>(.*?)<\/h[1-6]>/g,
            (match, level, text) => {
              const id = generateHeadingId(text);
              return `<h${level} id="${id}">${text}</h${level}>`;
            }
          );
          setHtml(htmlWithIds);
        }
      } catch (error) {
        console.warn('Failed to load marked, using simple parser', error);
        
        // 解析 YAML frontmatter（即使是简单解析器也需要）
        const { metadata, content: contentWithoutFrontMatter } = parseMarkdownMeta(content);
        
        // 通知父组件 metadata 已解析
        if (onMetaParsed) {
          onMetaParsed(metadata);
        }
        
        // 使用简单的 markdown 解析器作为后备
        let renderedHtml = contentWithoutFrontMatter
          // 标题（同时添加ID）
          .replace(/^# (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h1 id="${id}">${text}</h1>`;
          })
          .replace(/^## (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h2 id="${id}">${text}</h2>`;
          })
          .replace(/^### (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h3 id="${id}">${text}</h3>`;
          })
          .replace(/^#### (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h4 id="${id}">${text}</h4>`;
          })
          .replace(/^##### (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h5 id="${id}">${text}</h5>`;
          })
          .replace(/^###### (.*$)/gm, (match, text) => {
            const id = generateHeadingId(text);
            return `<h6 id="${id}">${text}</h6>`;
          })
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
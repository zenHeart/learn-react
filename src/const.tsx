import { createTagsColor, parserHtml } from './utils/utils'
import { DemoType, wrapDemoWithSandpack } from '@/utils/demoComponentParser'

// Define component meta interface
interface ComponentMeta {
  tags?: string[];
  title?: string;
  description?: string;
  hasMarkdown?: boolean;
  markdownPath?: string;
  markdownContent?: string;
  isStandaloneMarkdown?: boolean;
  [key: string]: any;
}

// Define component with meta property
interface ComponentWithMeta extends React.FC {
  meta?: ComponentMeta;
}

// 添加检查 markdown 文件的函数
function findCorrespondingMarkdown(demoPath: string): { path: string; content: string } | null {
  // 移除 .demo.{ext} 后缀，添加 .md 后缀
  const basePath = demoPath.replace(/\.demo\.(jsx|tsx|html)$/, '').replace(/^\.\/demos\//, '');
  const mdPath = `${basePath}.md`;
  
  // 检查文件是否存在
  const allMdFiles = import.meta.glob('./demos/**/*.md', { eager: true, as: 'raw' });
  const fullMdPath = `./demos/${mdPath}`;
  
  if (allMdFiles[fullMdPath]) {
    return {
      path: mdPath,
      content: allMdFiles[fullMdPath] as string
    };
  }
  
  return null;
}

// 新增：处理独立的 markdown 文件
function getStandaloneMarkdownFiles(existingDemoPaths: Set<string>): Component[] {
  const allMdFiles = import.meta.glob('./demos/**/*.md', { eager: true, as: 'raw' });
  const standaloneMarkdownComponents: Component[] = [];
  
  Object.entries(allMdFiles).forEach(([fullPath, content], index) => {
    try {
      const path = fullPath.replace(/^\.\/demos\//, '').replace(/\.md$/, '');
      
      // 检查路径是否有效
      if (!path || path.trim() === '') {
        console.warn('Invalid markdown file path:', fullPath);
        return;
      }
      
      // 检查优先级规则
      // 1. 检查是否已经有对应的 demo 文件（这些已经在 existingDemoPaths 中）
      if (existingDemoPaths.has(path)) {
        return; // 跳过，因为已经作为 demo 文件的文档处理了
      }
      
      // 2. 检查是否是目录级别的文档（index.md, README.md）
      const fileName = path.split('/').pop();
      let finalPath = path;
      let isDirectoryDoc = false;
      
      if (fileName === 'index' || fileName === 'README') {
        // 这是目录级别的文档，路由应该指向目录
        const pathParts = path.split('/');
        pathParts.pop(); // 移除文件名
        finalPath = pathParts.join('/');
        isDirectoryDoc = true;
        
        // 检查这个目录路由是否已经被处理过
        if (existingDemoPaths.has(finalPath)) {
          return;
        }
      }
      
      // 3. 处理独立的 markdown 文件（包括目录级别的文档）
      let markdownMeta = {};
      try {
        markdownMeta = parserHtml(content as string) || {};
      } catch (error) {
        console.warn('Failed to parse markdown meta for:', fullPath, error);
        markdownMeta = {};
      }
      
      standaloneMarkdownComponents.push({
        ...markdownMeta,
        name: finalPath,
        component: null, // 独立 markdown 不需要组件
        id: 10000 + index, // 使用较大的 ID 避免冲突
        isStandaloneMarkdown: true,
        isDirectoryDoc: isDirectoryDoc, // 标记是否为目录级别文档
        markdownContent: content as string,
        hasMarkdown: true,
        tags: (markdownMeta as any)?.tags || [] // 确保 tags 是数组
      });
      
      // 如果是目录级别文档，也记录这个路径避免重复处理
      if (isDirectoryDoc) {
        existingDemoPaths.add(finalPath);
      }
      
    } catch (error) {
      console.error('Error processing markdown file:', fullPath, error);
    }
  });
  
  return standaloneMarkdownComponents;
}

// Create a map of all demo-related files
function createRawFilesMap(demosRaw: Record<string, string>): Record<string, string> {
  const rawFilesMap: Record<string, string> = {};

  // First, get all demo files and their directories
  const demoDirs = new Set<string>();
  Object.keys(demosRaw).forEach(path => {
    const dir = path.substring(0, path.lastIndexOf('/'));
    demoDirs.add(dir);
  });

  // Then import all files from these directories
  const allFiles = import.meta.glob(
    ['./demos/**/*.{js,jsx,tsx,ts,html}'],
    { eager: true, as: 'raw' }
  );

  // Normalize paths and add to map
  Object.entries(allFiles).forEach(([path, content]) => {
    const normalizedPath = path.replace(/^\.\/demos\//, '');
    rawFilesMap[normalizedPath] = content as string;
  });
  return rawFilesMap;
}



interface Component {
  name: string;
  component: any;
  id: number;
  tags?: string[];
  isStandaloneMarkdown?: boolean;
  isDirectoryDoc?: boolean;
  markdownContent?: string;
  hasMarkdown?: boolean;
  [key: string]: any;
}

interface NestedComponent extends Component {
  children?: NestedComponent[];
  hasDirectoryDoc?: boolean; // 标记目录是否有对应的文档
  directoryDocContent?: string; // 目录文档内容
}


function createNestedStructure(components: Component[]): NestedComponent[] {
  const result: NestedComponent[] = [];
  const directoryDocMap = new Map<string, Component>(); // 存储目录级别文档的映射

  // 第一遍：找出所有目录级别的文档
  components.forEach(component => {
    if (component.isDirectoryDoc && component.name) {
      directoryDocMap.set(component.name, component);
    }
  });

  components.forEach(component => {
    // 确保 component 有必要的属性
    if (!component.name) {
      console.warn('Component missing name:', component);
      return;
    }

    // 跳过目录级别的文档，它们会被关联到对应的目录节点
    if (component.isDirectoryDoc) {
      return;
    }

    const paths = component.name.split('/').filter(p => p.trim() !== ''); // 过滤空路径

    if (paths.length === 0) {
      console.warn('Component has empty path:', component);
      return;
    }

    // Handle index files differently
    if (paths[paths.length - 1] === 'index') {
      // Remove 'index' and use parent directory name
      paths.pop();
      if (paths.length === 0) {
        console.warn('Index file has no parent directory:', component);
        return;
      }
      const fileName = paths.pop()!;
      let currentLevel = result;
      let currentDirPath = '';

      // Process any remaining path segments
      paths.forEach((path, index) => {
        currentDirPath = currentDirPath ? `${currentDirPath}/${path}` : path;
        let found = currentLevel.find(item => item.name === path);
        if (!found) {
          const dirDoc = directoryDocMap.get(currentDirPath);
          
          found = {
            name: path,
            children: [],
            id: Math.random(),
            component: null,
            tags: [],
            hasDirectoryDoc: !!dirDoc,
            directoryDocContent: dirDoc?.markdownContent,
            markdownContent: dirDoc?.markdownContent,
            hasMarkdown: !!dirDoc,
            isStandaloneMarkdown: !!dirDoc
          };
          currentLevel.push(found);
        }
        // 确保 children 存在且是数组
        if (!found.children || !Array.isArray(found.children)) {
          found.children = [];
        }
        currentLevel = found.children;
      });

      // Add component with parent directory name
      if (currentLevel && Array.isArray(currentLevel)) {
        const finalDirPath = currentDirPath ? `${currentDirPath}/${fileName}` : fileName;
        const dirDoc = directoryDocMap.get(finalDirPath);
        
        currentLevel.push({
          ...component,
          name: fileName,
          tags: component.tags || [],
          hasDirectoryDoc: !!dirDoc,
          directoryDocContent: dirDoc?.markdownContent,
          markdownContent: dirDoc?.markdownContent || component.markdownContent,
          hasMarkdown: !!dirDoc || component.hasMarkdown,
          isStandaloneMarkdown: !!dirDoc || component.isStandaloneMarkdown
        });
      }
    } else {
      // Handle non-index files normally
      const fileName = paths.pop()!;
      let currentLevel = result;
      let currentDirPath = '';

      paths.forEach(path => {
        currentDirPath = currentDirPath ? `${currentDirPath}/${path}` : path;
        let found = currentLevel.find(item => item.name === path);
        if (!found) {
          const dirDoc = directoryDocMap.get(currentDirPath);
          
          found = {
            name: path,
            children: [],
            id: Math.random(),
            component: null,
            tags: [],
            hasDirectoryDoc: !!dirDoc,
            directoryDocContent: dirDoc?.markdownContent,
            markdownContent: dirDoc?.markdownContent,
            hasMarkdown: !!dirDoc,
            isStandaloneMarkdown: !!dirDoc
          };
          currentLevel.push(found);
        }
        // 确保 children 存在且是数组
        if (!found.children || !Array.isArray(found.children)) {
          found.children = [];
        }
        currentLevel = found.children;
      });

      // 确保 currentLevel 是有效的数组
      if (currentLevel && Array.isArray(currentLevel)) {
        currentLevel.push({
          ...component,
          name: fileName,
          tags: component.tags || []
        });
      }
    }
  });

  return result;
}

function extractComponentMetaInfo(type: DemoType, component: ComponentWithMeta | string, demoPath: string) {
  let baseMeta = {};
  
  if (type === DemoType.HTML) {
    baseMeta = parserHtml(component as string);
  } else if (type === DemoType.REACT) {
    baseMeta = (component as ComponentWithMeta).meta || {};
  }
  
  // 检查是否有对应的 markdown 文件
  const markdownFile = findCorrespondingMarkdown(demoPath);
  if (markdownFile) {
    const mdMeta = parserHtml(markdownFile.content);
    // markdown meta 优先级更高
    return {
      ...baseMeta,
      ...mdMeta,
      hasMarkdown: true,
      markdownPath: markdownFile.path,
      markdownContent: markdownFile.content
    };
  }
  
  return baseMeta;
}

export function getFlatComponents(): Component[] {
  let flatComponents: Component[] = [];

  try {
    const reactDemos: any = import.meta.glob('./demos/**/*.demo.{jsx,tsx}', {
      eager: true,
      query: { raw: true },
      import: 'default'
    });
    const allDemosRaw: Record<string, string> = import.meta.glob('./demos/**/*.demo.{jsx,tsx,html}', {
      eager: true,
      as: 'raw'
    });
    
    // Create all raw files map once
    const rawFilesMap = createRawFilesMap(allDemosRaw);
    
    // 记录已存在的 demo 文件路径（去除 .demo.{ext} 后缀）
    const existingDemoPaths = new Set<string>();
    
    // Process demo components
    Object.keys(allDemosRaw).forEach((filename, index) => {
      try {
        const DemoComponent: ComponentWithMeta | string = reactDemos[filename] || allDemosRaw[filename];
        const rawContent = allDemosRaw[filename];
        const componentType = filename.endsWith('.html') ? DemoType.HTML : DemoType.REACT;
        const name = filename
          .replace(/^\.\/demos\//, '')
          .replace(/\.demo\.\w+$/, '');
        
        // 检查名称是否有效
        if (!name || name.trim() === '') {
          console.warn('Invalid demo component name:', filename);
          return;
        }
        
        // 记录这个路径已经被 demo 文件占用
        existingDemoPaths.add(name);
        
        const componentMetaInfo:any = extractComponentMetaInfo(componentType, DemoComponent, filename);
        const sandpackComponent = wrapDemoWithSandpack(componentType, rawContent, filename, rawFilesMap);
        
        flatComponents.push({
          ...componentMetaInfo,
          name,
          // @ts-ignore
          component: componentMetaInfo?.disableSandpack ? DemoComponent : sandpackComponent,
          id: index,
          tags: componentMetaInfo?.tags || [] // 确保 tags 是数组
        });
      } catch (error) {
        console.error('Error processing demo component:', filename, error);
      }
    });

    // 添加独立的 markdown 文件
    try {
      const standaloneMarkdownComponents = getStandaloneMarkdownFiles(existingDemoPaths);
      flatComponents.push(...standaloneMarkdownComponents);
    } catch (error) {
      console.error('Error processing standalone markdown files:', error);
    }
  } catch (error) {
    console.error('Error in getFlatComponents:', error);
  }

  return flatComponents;
}
const FLAT_COMPONENTS = getFlatComponents();
export const TREE_COMPONENTS = createNestedStructure(FLAT_COMPONENTS);
export const TAGS_COLOR = createTagsColor(FLAT_COMPONENTS);

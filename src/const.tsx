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
  [key: string]: any;
}

interface NestedComponent extends Component {
  children?: NestedComponent[];
}


function createNestedStructure(components: Component[]): NestedComponent[] {
  const result: NestedComponent[] = [];

  components.forEach(component => {
    const paths = component.name.split('/');

    // Handle index files differently
    if (paths[paths.length - 1] === 'index') {
      // Remove 'index' and use parent directory name
      paths.pop();
      const fileName = paths.pop()!;
      let currentLevel = result;

      // Process any remaining path segments
      paths.forEach(path => {
        let found = currentLevel.find(item => item.name === path);
        if (!found) {
          found = {
            name: path,
            children: [],
            id: Math.random(),
            component: null
          };
          currentLevel.push(found);
        }
        currentLevel = found.children!;
      });

      // Add component with parent directory name
      currentLevel.push({
        ...component,
        name: fileName
      });
    } else {
      // Handle non-index files normally
      const fileName = paths.pop()!;
      let currentLevel = result;

      paths.forEach(path => {
        let found = currentLevel.find(item => item.name === path);
        if (!found) {
          found = {
            name: path,
            children: [],
            id: Math.random(),
            component: null
          };
          currentLevel.push(found);
        }
        currentLevel = found.children!;
      });

      currentLevel.push({
        ...component,
        name: fileName
      });
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

  const reactDemos: Record<string, ComponentWithMeta | string> = import.meta.glob('./demos/**/*.demo.{jsx,tsx}', {
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
  // Process components
  Object.keys(allDemosRaw).forEach((filename, index) => {
    const DemoComponent: ComponentWithMeta | string = reactDemos[filename] || allDemosRaw[filename];
    const rawContent = allDemosRaw[filename];
    const componentType = filename.endsWith('.html') ? DemoType.HTML : DemoType.REACT;
    const name = filename
      .replace(/^\.\/demos\//, '')
      .replace(/\.demo\.\w+$/, '');
    const componentMetaInfo = extractComponentMetaInfo(componentType, DemoComponent, filename);
    const sandpackComponent = wrapDemoWithSandpack(componentType, rawContent, filename, rawFilesMap);
    flatComponents.push({
      ...componentMetaInfo,
      name,
      // @ts-ignore
      component: componentMetaInfo?.disableSandpack ? DemoComponent : sandpackComponent,
      id: index
    })
  });

  return flatComponents;
}
const FLAT_COMPONENTS = getFlatComponents();
export const TREE_COMPONENTS = createNestedStructure(FLAT_COMPONENTS);
export const TAGS_COLOR = createTagsColor(FLAT_COMPONENTS);

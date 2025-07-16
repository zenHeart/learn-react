export interface MarkdownMetadata {
  minute?: number;
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
  description?: string;
  [key: string]: any; // Allow for future extensibility
}

/**
 * Parse YAML frontmatter from markdown content
 * @param content - The markdown content with potential YAML frontmatter
 * @returns Object containing parsed metadata and content without frontmatter
 */
export function parseMarkdownMeta(content: string): {
  metadata: MarkdownMetadata;
  content: string;
} {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return {
      metadata: {},
      content: content
    };
  }
  
  const frontMatter = match[1];
  const contentWithoutFrontMatter = content.replace(frontMatterRegex, '');
  
  try {
    const metadata = parseYaml(frontMatter);
    return {
      metadata,
      content: contentWithoutFrontMatter
    };
  } catch (error) {
    console.warn('Failed to parse YAML frontmatter:', error);
    return {
      metadata: {},
      content: contentWithoutFrontMatter
    };
  }
}

/**
 * Simple YAML parser for basic key-value pairs
 * Supports strings, numbers, booleans, and arrays
 */
function parseYaml(yamlContent: string): MarkdownMetadata {
  const lines = yamlContent.split('\n');
  const result: MarkdownMetadata = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmedLine.slice(0, colonIndex).trim();
    let value = trimmedLine.slice(colonIndex + 1).trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Parse arrays (simple format: [item1, item2, item3])
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      result[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
      continue;
    }
    
    // Parse numbers
    if (!isNaN(Number(value)) && value !== '') {
      result[key] = Number(value);
      continue;
    }
    
    // Parse booleans
    if (value.toLowerCase() === 'true') {
      result[key] = true;
      continue;
    }
    if (value.toLowerCase() === 'false') {
      result[key] = false;
      continue;
    }
    
    // Default to string
    result[key] = value;
  }
  
  return result;
}

/**
 * Get reading time from metadata or calculate from content
 * @param metadata - Parsed metadata object
 * @param content - Markdown content for fallback calculation
 * @returns Reading time in minutes or null if not available
 */
export function getReadingTime(metadata: MarkdownMetadata, content?: string): number | null {
  // Priority 1: Use minute field from metadata
  if (typeof metadata.minute === 'number' && metadata.minute > 0) {
    return metadata.minute;
  }
  
  // Priority 2: Don't display if no metadata minute field
  return null;
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @returns Formatted string for display
 */
export function formatReadingTime(minutes: number | null): string | null {
  if (minutes === null || minutes <= 0) {
    return null;
  }
  
  return `${minutes} min read`;
} 
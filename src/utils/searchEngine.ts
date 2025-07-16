import { parseMarkdownMeta } from './markdownMeta';

// 搜索结果接口
export interface SearchResult {
  id: string;
  name: string;
  title?: string;
  path: string;
  type: 'demo' | 'markdown' | 'code';
  content: string;
  tags: string[];
  metadata?: any;
  score: number;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

// 搜索索引项
interface IndexItem {
  id: string;
  name: string;
  path: string;
  type: 'demo' | 'markdown' | 'code';
  title: string;
  content: string;
  tags: string[];
  author?: string;
  description?: string;
  metadata: any;
}

// Lucene 查询 AST 节点类型
interface QueryNode {
  type: 'term' | 'field' | 'wildcard' | 'fuzzy' | 'phrase' | 'boolean' | 'group';
}

interface TermNode extends QueryNode {
  type: 'term';
  value: string;
}

interface FieldNode extends QueryNode {
  type: 'field';
  field: string;
  value: QueryNode;
}

interface WildcardNode extends QueryNode {
  type: 'wildcard';
  pattern: string;
}

interface FuzzyNode extends QueryNode {
  type: 'fuzzy';
  term: string;
  distance?: number;
}

interface PhraseNode extends QueryNode {
  type: 'phrase';
  phrase: string;
}

interface BooleanNode extends QueryNode {
  type: 'boolean';
  left: QueryNode;
  operator: 'AND' | 'OR' | 'NOT';
  right?: QueryNode;
}

interface GroupNode extends QueryNode {
  type: 'group';
  query: QueryNode;
}

type QueryAST = QueryNode;

export class LuceneSearchEngine {
  private index: IndexItem[] = [];
  private fieldWeights = {
    title: 3.0,
    path: 2.0,
    tags: 2.5,
    content: 1.0,
    description: 1.5,
    author: 1.0
  };

  // 构建搜索索引
  buildIndex(components: any[]): void {
    this.index = components.map((component, idx) => {
      let content = '';
      let title = component.name || '';
      let metadata = {};

      // 处理 markdown 内容
      if (component.markdownContent) {
        const { metadata: parsedMeta, content: cleanContent } = parseMarkdownMeta(component.markdownContent);
        content = cleanContent;
        metadata = parsedMeta;
        title = parsedMeta.title || title;
      }

      // 处理代码内容（如果有的话）
      if (component.rawContent) {
        content = content + '\n' + component.rawContent;
      }

      return {
        id: `${idx}`,
        name: component.name || '',
        path: component.name || '',
        type: component.isStandaloneMarkdown ? 'markdown' : 'demo',
        title,
        content: content.toLowerCase(),
        tags: component.tags || [],
        author: metadata.author || '',
        description: metadata.description || '',
        metadata
      };
    });
  }

  // Lucene 语法解析器
  private parseQuery(query: string): QueryAST {
    const tokens = this.tokenize(query);
    return this.parseExpression(tokens);
  }

  private tokenize(query: string): string[] {
    // 简化的分词器，支持引号、括号、操作符等
    const regex = /(".*?")|(\()|(\))|(\w+:\w+|\w+:\*|\w+:".*?")|(\w+~\d*)|(\w+\*|\w+\?)|(\w+)|(AND|OR|NOT)/g;
    const tokens: string[] = [];
    let match;

    while ((match = regex.exec(query)) !== null) {
      tokens.push(match[0]);
    }

    return tokens.filter(token => token.trim() !== '');
  }

  private parseExpression(tokens: string[]): QueryAST {
    let left = this.parseTerm(tokens);

    while (tokens.length > 0) {
      const operator = tokens[0];
      if (operator === 'AND' || operator === 'OR' || operator === 'NOT') {
        tokens.shift(); // 消费操作符
        const right = operator === 'NOT' ? undefined : this.parseTerm(tokens);
        left = {
          type: 'boolean',
          left,
          operator: operator as 'AND' | 'OR' | 'NOT',
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  private parseTerm(tokens: string[]): QueryAST {
    if (tokens.length === 0) {
      throw new Error('Unexpected end of query');
    }

    const token = tokens.shift()!;

    // 分组
    if (token === '(') {
      const query = this.parseExpression(tokens);
      if (tokens.shift() !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return { type: 'group', query };
    }

    // 引号短语
    if (token.startsWith('"') && token.endsWith('"')) {
      return {
        type: 'phrase',
        phrase: token.slice(1, -1)
      };
    }

    // 字段搜索
    if (token.includes(':')) {
      const [field, value] = token.split(':', 2);
      let valueNode: QueryNode;

      if (value.startsWith('"') && value.endsWith('"')) {
        valueNode = { type: 'phrase', phrase: value.slice(1, -1) };
      } else if (value.includes('*') || value.includes('?')) {
        valueNode = { type: 'wildcard', pattern: value };
      } else {
        valueNode = { type: 'term', value };
      }

      return { type: 'field', field, value: valueNode };
    }

    // 模糊搜索
    if (token.includes('~')) {
      const [term, distanceStr] = token.split('~');
      const distance = distanceStr ? parseInt(distanceStr) : 1;
      return { type: 'fuzzy', term, distance };
    }

    // 通配符
    if (token.includes('*') || token.includes('?')) {
      return { type: 'wildcard', pattern: token };
    }

    // 普通词项
    return { type: 'term', value: token };
  }

  // 执行搜索
  search(query: string, limit: number = 20): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    try {
      const ast = this.parseQuery(query);
      const results: Array<{ item: IndexItem; score: number; highlights: SearchHighlight[] }> = [];

      for (const item of this.index) {
        const result = this.evaluateQuery(ast, item);
        if (result.matches) {
          results.push({
            item,
            score: result.score,
            highlights: result.highlights
          });
        }
      }

      // 按分数排序并限制结果数量
      results.sort((a, b) => b.score - a.score);

      return results.slice(0, limit).map(result => ({
        id: result.item.id,
        name: result.item.name,
        title: result.item.title,
        path: result.item.path,
        type: result.item.type,
        content: result.item.content,
        tags: result.item.tags,
        metadata: result.item.metadata,
        score: result.score,
        highlights: result.highlights
      }));
    } catch (error) {
      console.warn('Search query parse error:', error);
      // 降级为简单搜索
      return this.simpleSearch(query, limit);
    }
  }

  private evaluateQuery(node: QueryAST, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    switch (node.type) {
      case 'term':
        return this.evaluateTerm(node.value, item);

      case 'field':
        return this.evaluateField(node.field, node.value, item);

      case 'wildcard':
        return this.evaluateWildcard(node.pattern, item);

      case 'fuzzy':
        return this.evaluateFuzzy(node.term, item, node.distance);

      case 'phrase':
        return this.evaluatePhrase(node.phrase, item);

      case 'boolean':
        return this.evaluateBoolean(node, item);

      case 'group':
        return this.evaluateQuery(node.query, item);

      default:
        return { matches: false, score: 0, highlights: [] };
    }
  }

  private evaluateTerm(term: string, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const termLower = term.toLowerCase();
    let totalScore = 0;
    const highlights: SearchHighlight[] = [];

    // 在所有字段中搜索
    const fields = ['title', 'content', 'path', 'tags', 'description', 'author'];
    
    for (const field of fields) {
      const fieldValue = this.getFieldValue(item, field);
      if (fieldValue.includes(termLower)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        const occurrences = (fieldValue.match(new RegExp(termLower, 'g')) || []).length;
        totalScore += occurrences * weight;

        // 生成高亮片段
        if (field !== 'tags') {
          const fragments = this.generateHighlights(fieldValue, termLower);
          if (fragments.length > 0) {
            highlights.push({ field, fragments });
          }
        }
      }
    }

    return {
      matches: totalScore > 0,
      score: totalScore,
      highlights
    };
  }

  private evaluateField(field: string, valueNode: QueryNode, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const fieldValue = this.getFieldValue(item, field);
    
    if (valueNode.type === 'term') {
      const term = valueNode.value.toLowerCase();
      if (fieldValue.includes(term)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        const occurrences = (fieldValue.match(new RegExp(term, 'g')) || []).length;
        const score = occurrences * weight * 2; // 字段搜索加权

        const highlights: SearchHighlight[] = [];
        if (field !== 'tags') {
          const fragments = this.generateHighlights(fieldValue, term);
          if (fragments.length > 0) {
            highlights.push({ field, fragments });
          }
        }

        return { matches: true, score, highlights };
      }
    } else if (valueNode.type === 'wildcard') {
      const regex = this.wildcardToRegex(valueNode.pattern);
      if (regex.test(fieldValue)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        return { matches: true, score: weight, highlights: [] };
      }
    } else if (valueNode.type === 'phrase') {
      const phrase = valueNode.phrase.toLowerCase();
      if (fieldValue.includes(phrase)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        const highlights: SearchHighlight[] = [];
        if (field !== 'tags') {
          const fragments = this.generateHighlights(fieldValue, phrase);
          if (fragments.length > 0) {
            highlights.push({ field, fragments });
          }
        }
        return { matches: true, score: weight * 1.5, highlights }; // 短语搜索加权
      }
    }

    return { matches: false, score: 0, highlights: [] };
  }

  private evaluateWildcard(pattern: string, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const regex = this.wildcardToRegex(pattern);
    const fields = ['title', 'content', 'path', 'tags', 'description', 'author'];
    
    for (const field of fields) {
      const fieldValue = this.getFieldValue(item, field);
      if (regex.test(fieldValue)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        return { matches: true, score: weight * 0.8, highlights: [] }; // 通配符搜索稍微降权
      }
    }

    return { matches: false, score: 0, highlights: [] };
  }

  private evaluateFuzzy(term: string, item: IndexItem, distance: number = 1): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const fields = ['title', 'content', 'path', 'description', 'author'];
    
    for (const field of fields) {
      const fieldValue = this.getFieldValue(item, field);
      const words = fieldValue.split(/\s+/);
      
      for (const word of words) {
        if (this.levenshteinDistance(term.toLowerCase(), word) <= distance) {
          const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
          return { matches: true, score: weight * 0.7, highlights: [] }; // 模糊搜索降权
        }
      }
    }

    return { matches: false, score: 0, highlights: [] };
  }

  private evaluatePhrase(phrase: string, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const phraseLower = phrase.toLowerCase();
    const fields = ['title', 'content', 'description'];
    let totalScore = 0;
    const highlights: SearchHighlight[] = [];

    for (const field of fields) {
      const fieldValue = this.getFieldValue(item, field);
      if (fieldValue.includes(phraseLower)) {
        const weight = this.fieldWeights[field as keyof typeof this.fieldWeights] || 1.0;
        totalScore += weight * 1.5; // 短语搜索加权

        const fragments = this.generateHighlights(fieldValue, phraseLower);
        if (fragments.length > 0) {
          highlights.push({ field, fragments });
        }
      }
    }

    return {
      matches: totalScore > 0,
      score: totalScore,
      highlights
    };
  }

  private evaluateBoolean(node: BooleanNode, item: IndexItem): { matches: boolean; score: number; highlights: SearchHighlight[] } {
    const leftResult = this.evaluateQuery(node.left, item);
    
    if (node.operator === 'NOT') {
      return {
        matches: !leftResult.matches,
        score: leftResult.matches ? 0 : 1,
        highlights: []
      };
    }

    if (!node.right) {
      return leftResult;
    }

    const rightResult = this.evaluateQuery(node.right, item);

    switch (node.operator) {
      case 'AND':
        return {
          matches: leftResult.matches && rightResult.matches,
          score: leftResult.matches && rightResult.matches ? leftResult.score + rightResult.score : 0,
          highlights: [...leftResult.highlights, ...rightResult.highlights]
        };

      case 'OR':
        return {
          matches: leftResult.matches || rightResult.matches,
          score: Math.max(leftResult.score, rightResult.score),
          highlights: leftResult.matches ? leftResult.highlights : rightResult.highlights
        };

      default:
        return { matches: false, score: 0, highlights: [] };
    }
  }

  // 辅助方法
  private getFieldValue(item: IndexItem, field: string): string {
    switch (field) {
      case 'title': return item.title.toLowerCase();
      case 'content': return item.content;
      case 'path': return item.path.toLowerCase();
      case 'tags': return item.tags.join(' ').toLowerCase();
      case 'description': return (item.description || '').toLowerCase();
      case 'author': return (item.author || '').toLowerCase();
      default: return '';
    }
  }

  private wildcardToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(escaped, 'i');
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private generateHighlights(text: string, term: string, maxFragments: number = 3): string[] {
    const fragments: string[] = [];
    const termRegex = new RegExp(term, 'gi');
    const matches = [...text.matchAll(termRegex)];

    for (let i = 0; i < Math.min(matches.length, maxFragments); i++) {
      const match = matches[i];
      const start = Math.max(0, match.index! - 50);
      const end = Math.min(text.length, match.index! + match[0].length + 50);
      let fragment = text.slice(start, end);

      // 添加省略号
      if (start > 0) fragment = '...' + fragment;
      if (end < text.length) fragment = fragment + '...';

      // 高亮匹配项
      fragment = fragment.replace(termRegex, `<mark>$&</mark>`);
      fragments.push(fragment);
    }

    return fragments;
  }

  // 简单搜索作为降级选项
  private simpleSearch(query: string, limit: number): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: Array<{ item: IndexItem; score: number }> = [];

    for (const item of this.index) {
      let score = 0;
      
      if (item.title.includes(queryLower)) score += 3;
      if (item.path.includes(queryLower)) score += 2;
      if (item.content.includes(queryLower)) score += 1;
      if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 2;

      if (score > 0) {
        results.push({ item, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(result => ({
      id: result.item.id,
      name: result.item.name,
      title: result.item.title,
      path: result.item.path,
      type: result.item.type,
      content: result.item.content,
      tags: result.item.tags,
      metadata: result.item.metadata,
      score: result.score,
      highlights: []
    }));
  }
} 
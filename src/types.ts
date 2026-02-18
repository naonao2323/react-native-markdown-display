import MarkdownIt, { Token } from 'markdown-it';
import { ReactNode } from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export type CombinedStyle = TextStyle | ViewStyle | ImageStyle;

export interface ASTNode {
  type: string;
  sourceType: string;
  sourceInfo?: string;
  sourceMeta?: unknown;
  block?: boolean;
  key: string;
  content: string;
  tokenIndex: number;
  index: number;
  attributes: Record<string, unknown>;
  children: ASTNode[];
  markup?: string;
}

// Flexible render function type that supports various argument combinations
export type RenderFunction = (
  node: ASTNode,
  children: ReactNode,
  parent: ASTNode[],
  styles: StylesType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...additionalArgs: any[]
) => ReactNode;

export interface RenderRules {
  [key: string]: RenderFunction;
}

export interface MarkdownParser {
  parse: (value: string, options?: unknown) => Token[];
}

export type MarkdownItType = MarkdownIt;

export interface StylesType {
  [key: string]: StyleProp<CombinedStyle>;
}

export interface MarkdownProps {
  children: string;
  rules?: RenderRules;
  style?: StylesType;
  renderer?: import('./lib/AstRenderer').default | ((nodes: readonly ASTNode[]) => ReactNode);
  markdownit?: MarkdownIt;
  plugins?: Array<import('./lib/plugin/PluginContainer').default<unknown>>;
  mergeStyle?: boolean;
  onLinkPress?: (url: string) => boolean | void;
  maxTopLevelChildren?: number | null;
  topLevelMaxExceededItem?: ReactNode;
  allowedImageHandlers?: string[];
  defaultImageHandler?: string;
  debugPrintTree?: boolean;
  textLimit?: number;
}

export type { default as AstRenderer } from './lib/AstRenderer';

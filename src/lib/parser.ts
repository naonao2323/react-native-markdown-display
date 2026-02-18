import { ReactNode } from 'react';
import tokensToAST from './util/tokensToAST';
import { stringToTokens } from './util/stringToTokens';
import { cleanupTokens } from './util/cleanupTokens';
import groupTextTokens from './util/groupTextTokens';
import { ASTNode } from '../types';
import MarkdownIt from 'markdown-it';

/**
 * Parse markdown source and render it
 * @param source - The markdown string to parse
 * @param renderer - Function to render the AST nodes
 * @param markdownIt - The markdown-it parser instance
 * @return Rendered React elements
 */
export default function parser(
  source: string,
  renderer: (nodes: readonly ASTNode[]) => ReactNode,
  markdownIt: MarkdownIt,
): ReactNode {
  let tokens = stringToTokens(source, markdownIt);
  tokens = cleanupTokens(tokens);
  tokens = groupTextTokens(tokens);

  const astTree = tokensToAST(tokens);

  return renderer(astTree);
}

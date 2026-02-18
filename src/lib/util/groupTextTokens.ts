import { Token as MarkdownItToken } from 'markdown-it';
import Token from './Token';

export default function groupTextTokens(tokens: MarkdownItToken[]): MarkdownItToken[] {
  const result: MarkdownItToken[] = [];

  let hasGroup = false;

  tokens.forEach(token => {
    if (!token.block && !hasGroup) {
      hasGroup = true;
      // Custom Token class doesn't fully match MarkdownItToken interface
      result.push(new Token('textgroup', 1) as any as MarkdownItToken);
      result.push(token);
    } else if (!token.block && hasGroup) {
      result.push(token);
    } else if (token.block && hasGroup) {
      hasGroup = false;
      // Custom Token class doesn't fully match MarkdownItToken interface
      result.push(new Token('textgroup', -1) as any as MarkdownItToken);
      result.push(token);
    } else {
      result.push(token);
    }
  });

  return result;
}

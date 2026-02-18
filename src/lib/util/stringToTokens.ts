import { Token } from 'markdown-it';
import { MarkdownParser } from '../../types';

export function stringToTokens(source: string, markdownIt: MarkdownParser): Token[] {
  let result: Token[] = [];
  try {
    result = markdownIt.parse(source, {});
  } catch (err) {
    console.warn(err);
  }

  return result;
}

import { Token } from 'markdown-it';

export default function renderInlineAsText(tokens: Token[]): string {
  let result = '';

  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i];
    if (token && token.type === 'text') {
      result += token.content;
    } else if (token && token.type === 'image' && token.children) {
      result += renderInlineAsText(token.children);
    }
  }

  return result;
}

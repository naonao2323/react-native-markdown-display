import { Token } from 'markdown-it';

export default function flattenTokens(tokens: Token[]): Token[] {
  return tokens.reduce((acc: Token[], curr) => {
    if (curr.type === 'inline' && curr.children && curr.children.length > 0) {
      const children = flattenTokens(curr.children);
      while (children.length) {
        const shifted = children.shift();
        if (shifted) acc.push(shifted);
      }
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);
}

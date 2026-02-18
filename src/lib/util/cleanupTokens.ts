import { Token } from 'markdown-it';
import getTokenTypeByToken from './getTokenTypeByToken';
import flattenInlineTokens from './flattenInlineTokens';
import renderInlineAsText from './renderInlineAsText';

// Exported for testing purposes; treated as a private implementation detail.
export function normalizeToken(token: Token): void {
  token.type = getTokenTypeByToken(token);

  // set image and hardbreak to block elements
  if (token.type === 'image' || token.type === 'hardbreak') {
    token.block = true;
  }

  // Set img alt text
  if (token.type === 'image' && token.children) {
    const altIndex = token.attrIndex('alt');
    if (altIndex >= 0 && token.attrs && token.attrs[altIndex]) {
      token.attrs[altIndex][1] = renderInlineAsText(token.children);
    }
  }
}

// Exported for testing purposes; treated as a private implementation detail.
// Converts link tokens that contain block-level children (e.g. images) into
// blocklink tokens so they can be wrapped in TouchableWithoutFeedback instead
// of Text, avoiding a View-inside-Text crash in React Native.
export function convertToBlockLinks(tokens: Token[]): Token[] {
  const stack: Token[] = [];
  return tokens.reduce((acc: Token[], token) => {
    if (token.type === 'link' && token.nesting === 1) {
      stack.push(token);
    } else if (
      stack.length > 0 &&
      token.type === 'link' &&
      token.nesting === -1
    ) {
      if (stack.some(stackToken => stackToken.block)) {
        const firstToken = stack[0];
        if (firstToken) {
          firstToken.type = 'blocklink';
          firstToken.block = true;
        }
        token.type = 'blocklink';
        token.block = true;
      }

      stack.push(token);

      while (stack.length) {
        const shifted = stack.shift();
        if (shifted) acc.push(shifted);
      }
    } else if (stack.length > 0) {
      stack.push(token);
    } else {
      acc.push(token);
    }

    return acc;
  }, []);
}

export function cleanupTokens(tokens: Token[]): Token[] {
  const cleanedTokens = flattenInlineTokens(tokens);
  cleanedTokens.forEach(normalizeToken);
  return convertToBlockLinks(cleanedTokens);
}

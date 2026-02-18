import { Token } from 'markdown-it';
import getTokenTypeByToken from './getTokenTypeByToken';
import flattenInlineTokens from './flattenInlineTokens';
import renderInlineAsText from './renderInlineAsText';

export function cleanupTokens(tokens: Token[]): Token[] {
  let cleanedTokens = flattenInlineTokens(tokens);
  cleanedTokens.forEach(token => {
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
  })

  /**
   * changing a link token to a blocklink to fix issue where link tokens with
   * nested non text tokens breaks component
   */
  const stack: Token[] = [];
  cleanedTokens = cleanedTokens.reduce((acc: Token[], token) => {
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

  return cleanedTokens;
}

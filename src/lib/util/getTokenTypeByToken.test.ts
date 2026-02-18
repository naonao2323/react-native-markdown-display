import fc from 'fast-check';
import getTokenTypeByToken from './getTokenTypeByToken';

describe('getTokenTypeByToken', () => {
  it('should return type without _open or _close', () => {
    const token = { type: 'paragraph_open' };
    expect(getTokenTypeByToken(token)).toBe('paragraph');
  });

  it('should handle _close suffix', () => {
    const token = { type: 'list_item_close' };
    expect(getTokenTypeByToken(token)).toBe('list_item');
  });

  it('should handle heading tokens with tag', () => {
    const token = { type: 'heading_open', tag: 'h1' };
    expect(getTokenTypeByToken(token)).toBe('heading1');
  });

  it('should handle h2, h3, etc', () => {
    expect(getTokenTypeByToken({ type: 'heading_open', tag: 'h2' })).toBe('heading2');
    expect(getTokenTypeByToken({ type: 'heading_open', tag: 'h3' })).toBe('heading3');
    expect(getTokenTypeByToken({ type: 'heading_open', tag: 'h6' })).toBe('heading6');
  });

  it('should return unknown for tokens without type', () => {
    const token = {};
    expect(getTokenTypeByToken(token)).toBe('unknown');
  });

  it('should handle text tokens', () => {
    const token = { type: 'text' };
    expect(getTokenTypeByToken(token)).toBe('text');
  });

  it('property: should always return a string', () => {
    const tokenArb = fc.record({
      type: fc.option(fc.string(), { nil: undefined }),
      tag: fc.option(fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6'), { nil: undefined })
    });

    fc.assert(
      fc.property(tokenArb, (token) => {
        const result = getTokenTypeByToken(token);
        return typeof result === 'string';
      })
    );
  });

  it('property: should handle various markdown token types', () => {
    const typeArb = fc.constantFrom(
      'paragraph_open', 'paragraph_close',
      'list_item_open', 'list_item_close',
      'blockquote_open', 'blockquote_close',
      'text', 'inline', 'code_inline'
    );

    fc.assert(
      fc.property(typeArb, (type) => {
        const token = { type };
        const result = getTokenTypeByToken(token);
        return typeof result === 'string' && result.length > 0;
      })
    );
  });
});

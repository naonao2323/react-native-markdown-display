import { Token } from 'markdown-it';
import flattenInlineTokens from './flattenInlineTokens';

/** Build a minimal markdown-it Token mock */
function makeToken(
  type: string,
  options: { children?: Token[] | null; block?: boolean } = {},
): Token {
  return {
    type,
    tag: '',
    attrs: null,
    map: null,
    nesting: 0,
    level: 0,
    children: options.children ?? null,
    content: '',
    markup: '',
    info: '',
    meta: null,
    block: options.block ?? false,
    hidden: false,
    attrIndex: () => -1,
    attrPush: () => {},
    attrSet: () => {},
    attrGet: () => null,
    attrJoin: () => '',
  } as unknown as Token;
}

describe('flattenInlineTokens', () => {
  // ── basic cases ───────────────────────────────────────────

  it('returns an empty array when given an empty array', () => {
    expect(flattenInlineTokens([])).toEqual([]);
  });

  it('returns non-inline tokens unchanged', () => {
    const tokens = [
      makeToken('heading_open', { block: true }),
      makeToken('text'),
      makeToken('heading_close', { block: true }),
    ];
    const result = flattenInlineTokens(tokens);
    expect(result).toHaveLength(3);
    expect(result.map(t => t.type)).toEqual(['heading_open', 'text', 'heading_close']);
  });

  // ── inline token expansion ────────────────────────────────

  it('replaces an inline token with its children', () => {
    const child1 = makeToken('text');
    const child2 = makeToken('softbreak');
    const inlineToken = makeToken('inline', { children: [child1, child2] });

    const result = flattenInlineTokens([inlineToken]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(child1);
    expect(result[1]).toBe(child2);
  });

  it('keeps an inline token as-is when children is an empty array', () => {
    const inlineToken = makeToken('inline', { children: [] });
    const result = flattenInlineTokens([inlineToken]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('inline');
  });

  it('keeps an inline token as-is when children is null', () => {
    const inlineToken = makeToken('inline', { children: null });
    const result = flattenInlineTokens([inlineToken]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('inline');
  });

  // ── order preservation ────────────────────────────────────

  it('preserves order when block tokens and inline tokens are mixed', () => {
    const paragraph_open = makeToken('paragraph_open', { block: true });
    const text = makeToken('text');
    const strong_open = makeToken('strong_open');
    const inlineToken = makeToken('inline', { children: [text, strong_open] });
    const paragraph_close = makeToken('paragraph_close', { block: true });

    const result = flattenInlineTokens([paragraph_open, inlineToken, paragraph_close]);

    expect(result.map(t => t.type)).toEqual([
      'paragraph_open',
      'text',
      'strong_open',
      'paragraph_close',
    ]);
  });

  it('expands multiple inline tokens and concatenates their children', () => {
    const a = makeToken('text');
    const b = makeToken('text');
    const inline1 = makeToken('inline', { children: [a] });
    const inline2 = makeToken('inline', { children: [b] });

    const result = flattenInlineTokens([inline1, inline2]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  // ── recursive flattening ──────────────────────────────────

  it('recursively flattens inline tokens nested inside inline children', () => {
    const deepText = makeToken('text');
    const innerInline = makeToken('inline', { children: [deepText] });
    const outerInline = makeToken('inline', { children: [innerInline] });

    const result = flattenInlineTokens([outerInline]);

    // innerInline is also inline, so only deepText survives
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(deepText);
  });

  it('keeps non-inline children of an inline token unchanged', () => {
    const strong = makeToken('strong_open');
    const text = makeToken('text');
    const strong_close = makeToken('strong_close');
    const inlineToken = makeToken('inline', { children: [strong, text, strong_close] });

    const result = flattenInlineTokens([inlineToken]);

    expect(result).toHaveLength(3);
    expect(result.map(t => t.type)).toEqual(['strong_open', 'text', 'strong_close']);
  });
});

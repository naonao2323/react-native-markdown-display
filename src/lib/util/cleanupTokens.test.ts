import { Token } from 'markdown-it';
import { normalizeToken, convertToBlockLinks } from './cleanupTokens';

/** Build a minimal markdown-it Token mock */
function makeToken(
  type: string,
  options: {
    tag?: string;
    nesting?: number;
    block?: boolean;
    children?: Token[] | null;
    attrs?: [string, string][] | null;
  } = {},
): Token {
  const attrs = options.attrs ?? null;
  return {
    type,
    tag: options.tag ?? '',
    attrs,
    map: null,
    nesting: options.nesting ?? 0,
    level: 0,
    children: options.children ?? null,
    content: '',
    markup: '',
    info: '',
    meta: null,
    block: options.block ?? false,
    hidden: false,
    attrIndex: (name: string) => {
      if (!attrs) return -1;
      return attrs.findIndex(([key]) => key === name);
    },
    attrPush: () => {},
    attrSet: () => {},
    attrGet: () => null,
    attrJoin: () => '',
  } as unknown as Token;
}

describe('normalizeToken', () => {
  // ── type normalization ────────────────────────────────────

  it('removes _open suffix from token type', () => {
    const token = makeToken('strong_open', { nesting: 1 });
    normalizeToken(token);
    expect(token.type).toBe('strong');
  });

  it('removes _close suffix from token type', () => {
    const token = makeToken('strong_close', { nesting: -1 });
    normalizeToken(token);
    expect(token.type).toBe('strong');
  });

  it('appends heading level for heading tokens', () => {
    const token = makeToken('heading_open', { tag: 'h2', nesting: 1 });
    normalizeToken(token);
    expect(token.type).toBe('heading2');
  });

  it('leaves non-open/close types unchanged', () => {
    const token = makeToken('fence');
    normalizeToken(token);
    expect(token.type).toBe('fence');
  });

  // ── block promotion ───────────────────────────────────────

  it('sets block=true for image tokens', () => {
    const token = makeToken('image', { block: false });
    normalizeToken(token);
    expect(token.block).toBe(true);
  });

  it('sets block=true for hardbreak tokens', () => {
    const token = makeToken('hardbreak', { block: false });
    normalizeToken(token);
    expect(token.block).toBe(true);
  });

  it('does not change block for other token types', () => {
    const token = makeToken('text', { block: false });
    normalizeToken(token);
    expect(token.block).toBe(false);
  });

  // ── image alt text ────────────────────────────────────────

  it('sets alt attribute from text children of an image token', () => {
    const textChild = makeToken('text');
    (textChild as any).content = 'my alt text';

    const token = makeToken('image', {
      attrs: [['src', 'img.png'], ['alt', '']],
      children: [textChild],
    });

    normalizeToken(token);

    expect(token.attrs![1][1]).toBe('my alt text');
  });

  it('concatenates multiple text children for alt', () => {
    const t1 = makeToken('text');
    (t1 as any).content = 'hello ';
    const t2 = makeToken('text');
    (t2 as any).content = 'world';

    const token = makeToken('image', {
      attrs: [['src', 'img.png'], ['alt', '']],
      children: [t1, t2],
    });

    normalizeToken(token);

    expect(token.attrs![1][1]).toBe('hello world');
  });

  it('ignores non-text tokens when building alt text', () => {
    const strong = makeToken('strong_open');
    const text = makeToken('text');
    (text as any).content = 'bold';
    const strongClose = makeToken('strong_close');

    const token = makeToken('image', {
      attrs: [['src', 'img.png'], ['alt', '']],
      children: [strong, text, strongClose],
    });

    normalizeToken(token);

    expect(token.attrs![1][1]).toBe('bold');
  });

  it('does not mutate alt when image has no children', () => {
    const token = makeToken('image', {
      attrs: [['src', 'img.png'], ['alt', 'original']],
      children: null,
    });

    normalizeToken(token);

    expect(token.attrs![1][1]).toBe('original');
  });

  it('does not mutate alt when image has no alt attribute', () => {
    const text = makeToken('text');
    (text as any).content = 'ignored';

    const token = makeToken('image', {
      attrs: [['src', 'img.png']],
      children: [text],
    });

    normalizeToken(token);

    // alt attr does not exist, so attrs should be unchanged
    expect(token.attrs).toEqual([['src', 'img.png']]);
  });
});

describe('convertToBlockLinks', () => {
  // ── no conversion needed ──────────────────────────────────

  it('returns an empty array for empty input', () => {
    expect(convertToBlockLinks([])).toEqual([]);
  });

  it('passes through tokens with no links unchanged', () => {
    const tokens = [makeToken('text'), makeToken('image', { block: true })];
    const result = convertToBlockLinks(tokens);
    expect(result.map(t => t.type)).toEqual(['text', 'image']);
  });

  it('passes through a plain text link unchanged', () => {
    const open = makeToken('link', { nesting: 1, block: false });
    const text = makeToken('text', { block: false });
    const close = makeToken('link', { nesting: -1, block: false });

    const result = convertToBlockLinks([open, text, close]);

    expect(result.map(t => t.type)).toEqual(['link', 'text', 'link']);
    expect(result[0].block).toBe(false);
    expect(result[2].block).toBe(false);
  });

  // ── blocklink conversion ──────────────────────────────────

  it('converts link containing a block-level image to blocklink', () => {
    const open = makeToken('link', { nesting: 1, block: false });
    const image = makeToken('image', { nesting: 0, block: true });
    const close = makeToken('link', { nesting: -1, block: false });

    const result = convertToBlockLinks([open, image, close]);

    expect(result[0].type).toBe('blocklink');
    expect(result[0].block).toBe(true);
    expect(result[1].type).toBe('image');
    expect(result[2].type).toBe('blocklink');
    expect(result[2].block).toBe(true);
  });

  it('preserves the order of tokens inside the converted link', () => {
    const open = makeToken('link', { nesting: 1, block: false });
    const image = makeToken('image', { nesting: 0, block: true });
    const text = makeToken('text', { block: false });
    const close = makeToken('link', { nesting: -1, block: false });

    const result = convertToBlockLinks([open, image, text, close]);

    expect(result.map(t => t.type)).toEqual(['blocklink', 'image', 'text', 'blocklink']);
  });

  // ── surrounding tokens are unaffected ─────────────────────

  it('does not affect tokens outside the link', () => {
    const before = makeToken('paragraph');
    const open = makeToken('link', { nesting: 1, block: false });
    const image = makeToken('image', { nesting: 0, block: true });
    const close = makeToken('link', { nesting: -1, block: false });
    const after = makeToken('paragraph');

    const result = convertToBlockLinks([before, open, image, close, after]);

    expect(result[0].type).toBe('paragraph');
    expect(result[4].type).toBe('paragraph');
  });
});

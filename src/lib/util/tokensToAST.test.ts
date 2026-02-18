import fc from 'fast-check';
import tokensToAST from './tokensToAST';

// ── token factories ────────────────────────────────────────

function makeSelfToken(type: string, content = '') {
  return { type, tag: '', attrs: null, map: null, nesting: 0, level: 0,
    children: null, content, markup: '', info: '', meta: null,
    block: false, hidden: false };
}

function makeOpenToken(type: string) {
  return { type: `${type}_open`, tag: '', attrs: null, map: null, nesting: 1,
    level: 0, children: null, content: '', markup: '', info: '', meta: null,
    block: false, hidden: false };
}

function makeCloseToken(type: string) {
  return { type: `${type}_close`, tag: '', attrs: null, map: null, nesting: -1,
    level: 0, children: null, content: '', markup: '', info: '', meta: null,
    block: false, hidden: false };
}

// ── unit tests ─────────────────────────────────────────────

describe('tokensToAST', () => {
  it('should handle empty array', () => {
    const result = tokensToAST([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle null input', () => {
    const result = tokensToAST(null);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle undefined input', () => {
    const result = tokensToAST(undefined);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('self-closing token produces one root node', () => {
    const result = tokensToAST([makeSelfToken('fence', 'code')]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('fence');
    expect(result[0].content).toBe('code');
  });

  it('open/close pair produces one root node with no children', () => {
    const result = tokensToAST([makeOpenToken('paragraph'), makeCloseToken('paragraph')]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('paragraph');
    expect(result[0].children).toHaveLength(0);
  });

  it('open/self/close produces one root node with one child', () => {
    const result = tokensToAST([
      makeOpenToken('paragraph'),
      makeSelfToken('text', 'hello'),
      makeCloseToken('paragraph'),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].content).toBe('hello');
  });

  it('nested open/close pairs build a deep tree', () => {
    const result = tokensToAST([
      makeOpenToken('bullet_list'),
        makeOpenToken('list_item'),
          makeSelfToken('text', 'item'),
        makeCloseToken('list_item'),
      makeCloseToken('bullet_list'),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('bullet_list');
    expect(result[0].children[0].type).toBe('list_item');
    expect(result[0].children[0].children[0].content).toBe('item');
  });

  it('multiple root-level tokens produce multiple root nodes', () => {
    const result = tokensToAST([
      makeOpenToken('paragraph'), makeCloseToken('paragraph'),
      makeSelfToken('fence', ''),
      makeOpenToken('paragraph'), makeCloseToken('paragraph'),
    ]);
    expect(result).toHaveLength(3);
  });

  it('empty text token (type=text, content="") is skipped', () => {
    const result = tokensToAST([
      makeSelfToken('text', ''),
      makeSelfToken('text', 'hello'),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('hello');
  });

  it('node index reflects its position among siblings', () => {
    const result = tokensToAST([
      makeSelfToken('fence', 'a'),
      makeSelfToken('fence', 'b'),
      makeSelfToken('fence', 'c'),
    ]);
    expect(result[0].index).toBe(0);
    expect(result[1].index).toBe(1);
    expect(result[2].index).toBe(2);
  });

  // ── property-based tests ─────────────────────────────────

  it('property: self-closing tokens each produce exactly one root node', () => {
    const selfTokenType = fc.constantFrom('fence', 'hr', 'code_block', 'hardbreak', 'softbreak');

    fc.assert(
      fc.property(
        fc.array(selfTokenType, { minLength: 1, maxLength: 20 }),
        (types) => {
          const tokens = types.map(t => makeSelfToken(t, 'x'));
          const result = tokensToAST(tokens);
          return Array.isArray(result) && result.length === types.length;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: N valid open/close pairs produce exactly N root nodes', () => {
    const pairType = fc.constantFrom('paragraph', 'strong', 'em', 'blockquote', 'bullet_list');

    fc.assert(
      fc.property(
        fc.array(pairType, { minLength: 1, maxLength: 10 }),
        (types) => {
          const tokens = types.flatMap(t => [makeOpenToken(t), makeCloseToken(t)]);
          const result = tokensToAST(tokens);
          return Array.isArray(result) && result.length === types.length;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: open/self-closing children/close puts children inside the parent node', () => {
    const selfTokenType = fc.constantFrom('fence', 'hr', 'hardbreak');
    const pairType = fc.constantFrom('paragraph', 'strong', 'blockquote');

    fc.assert(
      fc.property(
        pairType,
        fc.array(selfTokenType, { minLength: 1, maxLength: 5 }),
        (parentType, childTypes) => {
          const tokens = [
            makeOpenToken(parentType),
            ...childTypes.map(t => makeSelfToken(t, 'x')),
            makeCloseToken(parentType),
          ];
          const result = tokensToAST(tokens);
          return (
            result.length === 1 &&
            result[0].children.length === childTypes.length
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

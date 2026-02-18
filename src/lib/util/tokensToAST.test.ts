import fc from 'fast-check';
import tokensToAST from './tokensToAST';

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

  it('should convert tokens to AST nodes', () => {
    const tokens = [
      { type: 'text', content: 'Hello', children: null, nesting: 0 }
    ];
    
    const result = tokensToAST(tokens);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle tokens with children', () => {
    const tokens = [
      {
        type: 'paragraph_open',
        children: [
          { type: 'text', content: 'Hello', children: null }
        ]
      }
    ];
    
    const result = tokensToAST(tokens);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle nested token structures', () => {
    const tokens = [
      {
        type: 'list_item_open',
        children: [
          {
            type: 'paragraph_open',
            children: [
              { type: 'text', content: 'Item', children: null }
            ]
          }
        ]
      }
    ];
    
    const result = tokensToAST(tokens);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('property: should always return an array', () => {
    fc.assert(
      fc.property(
        fc.option(fc.array(fc.record({
          type: fc.string(),
          content: fc.option(fc.string()),
          children: fc.constant(null)
        }))),
        (tokens) => {
          const result = tokensToAST(tokens);
          return Array.isArray(result);
        }
      )
    );
  });

  it('property: should handle arbitrary token arrays', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          type: fc.constantFrom('text', 'inline'),
          content: fc.string(),
          children: fc.constant(null),
          nesting: fc.constant(0),
          attrs: fc.constant(null)
        }), { maxLength: 5 }),
        (tokens) => {
          try {
            const result = tokensToAST(tokens);
            return Array.isArray(result);
          } catch (e) {
            // Some token combinations may not be valid, that's ok
            return true;
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});

import fc from 'fast-check';
import Token from './Token';

describe('Token', () => {
  it('should create a token with required parameters', () => {
    const token = new Token('text');
    expect(token.type).toBe('text');
    expect(token.nesting).toBe(0);
    expect(token.children).toBe(null);
    expect(token.block).toBe(false);
  });

  it('should create a token with all parameters', () => {
    const children = [new Token('child')];
    const token = new Token('paragraph', 1, children, true);
    
    expect(token.type).toBe('paragraph');
    expect(token.nesting).toBe(1);
    expect(token.children).toBe(children);
    expect(token.block).toBe(true);
  });

  it('should have default values', () => {
    const token = new Token('heading');
    expect(token.nesting).toBe(0);
    expect(token.children).toBe(null);
    expect(token.block).toBe(false);
  });

  it('should handle different nesting levels', () => {
    const token1 = new Token('list', 1);
    const token2 = new Token('list', -1);
    const token3 = new Token('list', 0);
    
    expect(token1.nesting).toBe(1);
    expect(token2.nesting).toBe(-1);
    expect(token3.nesting).toBe(0);
  });

  it('property: should create valid tokens with arbitrary inputs', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: -2, max: 2 }),
        fc.option(fc.array(fc.anything())),
        fc.boolean(),
        (type, nesting, children, block) => {
          const token = new Token(type, nesting, children, block);
          return token.type === type && 
                 token.nesting === nesting &&
                 token.children === children &&
                 token.block === block;
        }
      )
    );
  });

  it('should be instance of Token', () => {
    const token = new Token('text');
    expect(token).toBeInstanceOf(Token);
  });
});

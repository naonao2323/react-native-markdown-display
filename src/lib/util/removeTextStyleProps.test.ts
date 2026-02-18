import fc from 'fast-check';
import removeTextStyleProps from './removeTextStyleProps';

describe('removeTextStyleProps', () => {
  it('should remove text style properties', () => {
    const style = {
      color: 'red',
      fontSize: 16,
      padding: 10,
      margin: 5
    };
    
    const result = removeTextStyleProps(style);
    
    expect(result).not.toHaveProperty('color');
    expect(result).not.toHaveProperty('fontSize');
    expect(result).toHaveProperty('padding', 10);
    expect(result).toHaveProperty('margin', 5);
  });

  it('should handle style with only text properties', () => {
    const style = {
      color: 'blue',
      fontWeight: 'bold',
      lineHeight: 20
    };
    
    const result = removeTextStyleProps(style);
    
    expect(Object.keys(result).length).toBe(0);
  });

  it('should handle style with no text properties', () => {
    const style = {
      padding: 10,
      margin: 5,
      backgroundColor: 'white'
    };
    
    const result = removeTextStyleProps(style);
    
    expect(result).toEqual(style);
  });

  it('should not mutate original style object', () => {
    const style = {
      color: 'red',
      padding: 10
    };
    
    const original = { ...style };
    removeTextStyleProps(style);
    
    expect(style).toEqual(original);
  });

  it('should handle empty style object', () => {
    const result = removeTextStyleProps({});
    expect(result).toEqual({});
  });

  it('should remove all known text style properties', () => {
    const style = {
      color: 'red',
      fontSize: 16,
      fontStyle: 'italic',
      fontWeight: 'bold',
      lineHeight: 20,
      textAlign: 'center',
      textDecorationLine: 'underline',
      fontFamily: 'Arial',
      letterSpacing: 1,
      textTransform: 'uppercase'
    };
    
    const result = removeTextStyleProps(style);
    
    expect(Object.keys(result).length).toBe(0);
  });

  it('property: should always return an object', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string(), fc.anything()),
        (style) => {
          const result = removeTextStyleProps(style);
          return typeof result === 'object' && result !== null;
        }
      )
    );
  });

  it('property: output should have fewer or equal keys than input', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string(), fc.anything()),
        (style) => {
          const result = removeTextStyleProps(style);
          return Object.keys(result).length <= Object.keys(style).length;
        }
      )
    );
  });
});

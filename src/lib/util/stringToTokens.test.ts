import fc from 'fast-check';
import { stringToTokens } from './stringToTokens';
import MarkdownIt from 'markdown-it';

describe('stringToTokens', () => {
  let md;

  beforeEach(() => {
    md = new MarkdownIt();
  });

  it('should parse simple markdown text', () => {
    const tokens = stringToTokens('Hello world', md);
    expect(tokens).toBeDefined();
    expect(Array.isArray(tokens)).toBe(true);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should parse markdown with headers', () => {
    const tokens = stringToTokens('# Heading 1\n## Heading 2', md);
    expect(tokens).toBeDefined();
    expect(tokens.some(t => t.type === 'heading_open')).toBe(true);
  });

  it('should parse markdown with lists', () => {
    const tokens = stringToTokens('- Item 1\n- Item 2', md);
    expect(tokens).toBeDefined();
    expect(tokens.some(t => t.type === 'bullet_list_open')).toBe(true);
  });

  it('should handle empty string', () => {
    const tokens = stringToTokens('', md);
    expect(tokens).toBeDefined();
    expect(Array.isArray(tokens)).toBe(true);
  });

  it('should handle errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const invalidMd = null;
    
    const tokens = stringToTokens('test', invalidMd);
    expect(tokens).toEqual([]);
    
    consoleSpy.mockRestore();
  });

  it('property: should never crash with arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const tokens = stringToTokens(input, md);
        return Array.isArray(tokens);
      }),
      { numRuns: 100 }
    );
  });

  it('property: should handle special markdown characters', () => {
    const specialChars = fc.constantFrom(
      '# ', '## ', '### ',
      '* ', '- ', '+ ',
      '> ', '`', '```',
      '[', ']', '(', ')',
      '**', '__', '*', '_'
    );

    fc.assert(
      fc.property(
        fc.array(specialChars),
        fc.string(),
        (chars, text) => {
          const input = chars.join('') + text;
          const tokens = stringToTokens(input, md);
          return Array.isArray(tokens);
        }
      ),
      { numRuns: 50 }
    );
  });
});

import fc from 'fast-check';
import parser from './parser';
import MarkdownIt from 'markdown-it';

describe('parser', () => {
  let md;
  let mockRenderer;

  beforeEach(() => {
    md = new MarkdownIt();
    mockRenderer = jest.fn(ast => ast);
  });

  it('should parse simple markdown and call renderer', () => {
    const result = parser('Hello world', mockRenderer, md);
    
    expect(mockRenderer).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should parse heading markdown', () => {
    parser('# Heading 1', mockRenderer, md);
    
    const ast = mockRenderer.mock.calls[0][0];
    expect(ast).toBeDefined();
    expect(Array.isArray(ast)).toBe(true);
  });

  it('should parse list markdown', () => {
    parser('- Item 1\n- Item 2', mockRenderer, md);
    
    const ast = mockRenderer.mock.calls[0][0];
    expect(ast).toBeDefined();
    expect(Array.isArray(ast)).toBe(true);
  });

  it('should handle empty string', () => {
    parser('', mockRenderer, md);
    
    expect(mockRenderer).toHaveBeenCalled();
  });

  it('should process tokens through pipeline', () => {
    const source = '# Test\n\nParagraph text.';
    parser(source, mockRenderer, md);
    
    const ast = mockRenderer.mock.calls[0][0];
    expect(ast).toBeDefined();
    expect(Array.isArray(ast)).toBe(true);
  });

  it('property: should never crash with arbitrary markdown', () => {
    fc.assert(
      fc.property(fc.string(), (markdown) => {
        try {
          parser(markdown, mockRenderer, md);
          return true;
        } catch {
          return false;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('property: should handle complex markdown structures', () => {
    const markdownElements = fc.constantFrom(
      '# Heading\n',
      '## Subheading\n',
      'Paragraph text\n',
      '- List item\n',
      '1. Numbered item\n',
      '> Quote\n',
      '`code`\n',
      '**bold**\n',
      '*italic*\n'
    );

    fc.assert(
      fc.property(fc.array(markdownElements, { maxLength: 10 }), (elements) => {
        const markdown = elements.join('');
        try {
          mockRenderer.mockClear();
          parser(markdown, mockRenderer, md);
          return mockRenderer.mock.calls.length > 0;
        } catch {
          return false;
        }
      }),
      { numRuns: 50 }
    );
  });
});

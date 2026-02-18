import * as Benchmark from 'benchmark';
import MarkdownIt from 'markdown-it';
import { stringToTokens } from '../src/lib/util/stringToTokens';
import flattenInlineTokens from '../src/lib/util/flattenInlineTokens';
import { cleanupTokens } from '../src/lib/util/cleanupTokens';
import groupTextTokens from '../src/lib/util/groupTextTokens';
import tokensToAST from '../src/lib/util/tokensToAST';

// ── inputs ────────────────────────────────────────────────

const SMALL = `# Hello

This is **bold** and *italic*.

- item1
- item2
`;

const MEDIUM = Array.from({ length: 50 }, (_, i) => `
## Section ${i}

Paragraph with **bold**, *italic*, and \`code\` text.

- item ${i}-1
- item ${i}-2

[link](https://example.com)
`).join('\n');

const LARGE = Array.from({ length: 500 }, (_, i) => `
## Section ${i}

Paragraph with **bold**, *italic*, and \`code\` text here.

- item ${i}-1
- item ${i}-2
- item ${i}-3

> blockquote text

\`\`\`js
const x = ${i};
\`\`\`
`).join('\n');

// ── suite builder ─────────────────────────────────────────

const md = new MarkdownIt({ typographer: true });

function addSuite(suiteName: string, source: string): void {
  const tokens      = stringToTokens(source, md);
  const flattened   = flattenInlineTokens(tokens);
  const cleaned     = cleanupTokens(tokens);
  const grouped     = groupTextTokens(cleaned);

  const suite = new Benchmark.Suite(suiteName);

  suite
    .add(`stringToTokens          [${suiteName}]`, () => {
      stringToTokens(source, md);
    })
    .add(`flattenInlineTokens     [${suiteName}]`, () => {
      flattenInlineTokens(tokens);
    })
    .add(`cleanupTokens           [${suiteName}]`, () => {
      cleanupTokens(flattened);
    })
    .add(`groupTextTokens         [${suiteName}]`, () => {
      groupTextTokens(cleaned);
    })
    .add(`tokensToAST             [${suiteName}]`, () => {
      tokensToAST(grouped);
    })
    .add(`full pipeline           [${suiteName}]`, () => {
      const t0 = stringToTokens(source, md);
      const t1 = cleanupTokens(t0);
      const t2 = groupTextTokens(t1);
      tokensToAST(t2);
    })
    .on('cycle', (event: Benchmark.Event) => {
      console.log(String(event.target));
    })
    .on('complete', () => {
      console.log('');
    })
    .run({ async: false });
}

// ── run ───────────────────────────────────────────────────

console.log('\n=== Parser Pipeline Benchmark ===\n');
console.log('Input sizes:');
console.log(`  small : ${SMALL.length.toLocaleString()} chars`);
console.log(`  medium: ${MEDIUM.length.toLocaleString()} chars`);
console.log(`  large : ${LARGE.length.toLocaleString()} chars`);
console.log('');

addSuite('small',  SMALL);
addSuite('medium', MEDIUM);
addSuite('large',  LARGE);


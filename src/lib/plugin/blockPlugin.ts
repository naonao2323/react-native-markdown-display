/* code is still in beta, thats why im disabling linter */
/* eslint-disable @typescript-eslint/no-explicit-any */

import MarkdownIt from 'markdown-it';

interface BlockPluginOptions {
  marker?: string;
  marker_end?: string;
  validate?: (params: string) => boolean;
  render?: (
    tokens: any[],
    idx: number,
    options: MarkdownIt.Options,
    env: unknown,
    self: any,
  ) => string;
}

/**
 * How to use?
 *  new PluginContainer(blockPlugin, '__name_of_block__', {})
 * @param md
 * @param name
 * @param options
 */
export default function blockPlugin(
  md: MarkdownIt,
  name: string,
  options?: BlockPluginOptions,
): void {
  function renderDefault(
    tokens: any[],
    idx: number,
    _options: MarkdownIt.Options,
    _env: unknown,
    self: any,
  ): string {
    return self.renderToken(tokens, idx, _options);
  }

  options = options || {};

  const min_markers = 1;
  const marker_str = options.marker || `[${name}]`;
  const marker_end_str = options.marker_end || `[/${name}]`;
  const marker_char = marker_str.charCodeAt(0);
  const marker_len = marker_str.length;
  const marker_end_len = marker_end_str.length;

  const render = options.render || renderDefault;

  function container(state: any, startLine: number, endLine: number, silent: boolean): boolean {
    let pos: number;
    let nextLine: number;
    let marker_count: number;
    let markup: string;
    let params: string;
    let token: any;
    let old_parent: string;
    let old_line_max: number;
    let auto_closed = false;
    let start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (marker_char !== state.src.charCodeAt(start)) {
      return false;
    }

    // Check out the rest of the marker string
    //
    for (pos = start + 1; pos <= max; pos++) {
      if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
        break;
      }
    }

    marker_count = Math.floor((pos - start) / marker_len);
    if (marker_count < min_markers) {
      return false;
    }
    pos -= (pos - start) % marker_len;

    markup = state.src.slice(start, pos);
    params = state.src.slice(pos, max);

    // if (!validate(params)) {
    //   return false;
    // }

    // Since start is found, we can report success here in validation mode
    //
    if (silent) {
      return true;
    }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (marker_char !== state.src.charCodeAt(start)) {
        continue;
      }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      for (pos = start + 1; pos <= max; pos++) {
        if (marker_end_str[(pos - start) % marker_end_len] !== state.src[pos]) {
          break;
        }
      }

      // closing code fence must be at least as long as the opening one
      if (Math.floor((pos - start) / marker_end_len) < marker_count) {
        continue;
      }

      // make sure tail has spaces only
      pos -= (pos - start) % marker_end_len;
      pos = state.skipSpaces(pos);

      if (pos < max) {
        continue;
      }

      // found!
      auto_closed = true;
      break;
    }

    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = 'container';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token = state.push(`container_${name}_open`, name, 1);
    token.markup = markup;
    token.block = true;
    token.info = params;
    token.map = [startLine, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push(`container_${name}_close`, name, -1);
    token.markup = state.src.slice(start, pos);
    token.block = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'container_checklist', container, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });

  md.renderer.rules['container_' + name + '_open'] = render;
  md.renderer.rules['container_' + name + '_close'] = render;
}

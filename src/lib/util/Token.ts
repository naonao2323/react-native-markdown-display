import { Token as MarkdownItToken } from 'markdown-it';

export default class Token {
  type: string;
  nesting: number;
  children: MarkdownItToken[] | null;
  block: boolean;

  constructor(
    type: string,
    nesting = 0,
    children: MarkdownItToken[] | null = null,
    block = false,
  ) {
    this.type = type;
    this.nesting = nesting;
    this.children = children;
    this.block = block;
  }
}

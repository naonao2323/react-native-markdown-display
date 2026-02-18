import { Token } from 'markdown-it';
import getUniqueID from './getUniqueID';
import getTokenTypeByToken from './getTokenTypeByToken';
import { ASTNode } from '../../types';

function createNode(token: Token, tokenIndex: number): ASTNode {
  const type = getTokenTypeByToken(token);
  const content = token.content;

  let attributes: Record<string, unknown> = {};

  if (token.attrs) {
    attributes = token.attrs.reduce((prev, curr) => {
      const [name, value] = curr;
      return { ...prev, [name]: value };
    }, {} as Record<string, unknown>);
  }

  return {
    type,
    sourceType: token.type,
    sourceInfo: token.info,
    sourceMeta: token.meta,
    block: token.block,
    key: getUniqueID() + '_' + type,
    content,
    tokenIndex,
    index: 0,
    attributes,
    children: tokensToAST(token.children || []),
    markup: token.markup,
  } as ASTNode;
}

export default function tokensToAST(tokens: Token[] | null): ASTNode[] {
  const stack: ASTNode[][] = [];
  let children: ASTNode[] = [];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    
    const astNode = createNode(token, i);

    if (
      !(
        astNode.type === 'text' &&
        astNode.children.length === 0 &&
        astNode.content === ''
      )
    ) {
      astNode.index = children.length;

      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        children = astNode.children;
      } else if (token.nesting === -1) {
        const popped = stack.pop();
        if (popped) children = popped;
      } else if (token.nesting === 0) {
        children.push(astNode);
      }
    }
  }

  return children;
}

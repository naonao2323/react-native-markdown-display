import { ReactNode } from 'react';
import { StyleSheet, TextStyle } from 'react-native';

import getUniqueID from './util/getUniqueID';
import convertAdditionalStyles from './util/convertAdditionalStyles';

import textStyleProps from './data/textStyleProps';
import { ASTNode, RenderRules, StylesType, RenderFunction } from '../types';

export default class AstRenderer {
  private _renderRules: RenderRules;
  private _style: StylesType;
  private _onLinkPress?: (url: string) => boolean | void;
  private _maxTopLevelChildren?: number | null;
  private _topLevelMaxExceededItem?: ReactNode;
  private _allowedImageHandlers?: string[];
  private _defaultImageHandler?: string;
  private _debugPrintTree?: boolean;

  constructor(
    renderRules: RenderRules,
    style: StylesType,
    onLinkPress?: (url: string) => boolean | void,
    maxTopLevelChildren?: number | null,
    topLevelMaxExceededItem?: ReactNode,
    allowedImageHandlers?: string[],
    defaultImageHandler?: string,
    debugPrintTree?: boolean,
  ) {
    this._renderRules = renderRules;
    this._style = style;
    this._onLinkPress = onLinkPress;
    this._maxTopLevelChildren = maxTopLevelChildren;
    this._topLevelMaxExceededItem = topLevelMaxExceededItem;
    this._allowedImageHandlers = allowedImageHandlers;
    this._defaultImageHandler = defaultImageHandler;
    this._debugPrintTree = debugPrintTree;
  }

  getRenderFunction = (type: string): RenderFunction => {
    const renderFunction = this._renderRules[type];

    if (!renderFunction) {
      throw new Error(
        `${type} renderRule not defined example: <Markdown rules={renderRules}>`,
      );
    }

    return renderFunction;
  };

  renderNode = (node: ASTNode, parentNodes: readonly ASTNode[], _isRoot = false): ReactNode => {
    const renderFunction = this.getRenderFunction(node.type);
    const parents = [...parentNodes];
    const parentNodesArray = parentNodes as ASTNode[];

    if (this._debugPrintTree === true) {
      let str = '';

      for (let a = 0; a < parents.length; a++) {
        str = str + '-';
      }

      console.log(`${str}${node.type}`);
    }

    parents.unshift(node);

    // calculate the children first
    const children = node.children.map((value: ASTNode) => {
      return this.renderNode(value, parents);
    });

    // render any special types of nodes that have different renderRule function signatures

    if (node.type === 'link' || node.type === 'blocklink') {
      return renderFunction(
        node,
        children,
        parentNodes as ASTNode[],
        this._style,
        this._onLinkPress,
      );
    }

    if (node.type === 'image') {
      return renderFunction(
        node,
        children,
        parentNodes as ASTNode[],
        this._style,
        this._allowedImageHandlers,
        this._defaultImageHandler,
      );
    }

    // We are at the bottom of some tree - grab all the parent styles
    // this effectively grabs the styles from parents and
    // applies them in order of priority parent (least) to child (most)
    // to allow styling global, then lower down things individually

    // we have to handle list_item seperately here because they have some child
    // pseudo classes that need the additional style props from parents passed down to them
    if (children.length === 0 || node.type === 'list_item') {
      const styleObj: TextStyle = {};

      for (let a = parentNodesArray.length - 1; a > -1; a--) {
        // grab and additional attributes specified by markdown-it
        let refStyle: Record<string, unknown> = {};

        const nodeAttrs = parentNodesArray[a]?.attributes;
        if (
          nodeAttrs &&
          nodeAttrs.style &&
          typeof nodeAttrs.style === 'string'
        ) {
          refStyle = convertAdditionalStyles(nodeAttrs.style) as Record<string, unknown>;
        }

        // combine in specific styles for the object
        const nodeType = parentNodesArray[a]?.type ?? '';
        if (nodeType && this._style[nodeType]) {
          const flattenedStyle = StyleSheet.flatten(this._style[nodeType]) as Record<string, unknown>;
          refStyle = {
            ...refStyle,
            ...flattenedStyle,
          };

          // workaround for list_items and their content cascading down the tree
          if (parentNodesArray[a]?.type === 'list_item') {
            let contentStyle: Record<string, unknown> = {};

            if (parentNodesArray[a + 1]?.type === 'bullet_list') {
              contentStyle = (StyleSheet.flatten(this._style.bullet_list_content) as Record<string, unknown>) || {};
            } else if (parentNodesArray[a + 1]?.type === 'ordered_list') {
              contentStyle = (StyleSheet.flatten(this._style.ordered_list_content) as Record<string, unknown>) || {};
            }

            refStyle = {
              ...refStyle,
              ...contentStyle,
            };
          }
        }

        // then work out if any of them are text styles that should be used in the end.
        const arr = Object.keys(refStyle);

        for (let b = 0; b < arr.length; b++) {
          const key = arr[b];
          if (key && textStyleProps.includes(key)) {
            (styleObj as Record<string, unknown>)[key] = refStyle[key];
          }
        }
      }

      return renderFunction(
        node,
        children,
        parentNodesArray,
        this._style,
        styleObj,
        node.type === 'text' ? this._onLinkPress : undefined,
      );
    }

    // cull top level children

    let finalChildren = children;
    if (
      this._maxTopLevelChildren &&
      children.length > this._maxTopLevelChildren
    ) {
      finalChildren = children.slice(0, this._maxTopLevelChildren);
      finalChildren.push(this._topLevelMaxExceededItem);
    }

    // render anythign else that has a normal signature

    return renderFunction(node, finalChildren, parentNodesArray, this._style);
  };

  render = (nodes: readonly ASTNode[]): ReactNode => {
    const root: ASTNode = {
      type: 'body',
      sourceType: 'body',
      key: getUniqueID(),
      content: '',
      tokenIndex: -1,
      index: -1,
      attributes: {},
      children: nodes as ASTNode[],
    };
    return this.renderNode(root, [], true);
  };
}

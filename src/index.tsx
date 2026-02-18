/**
 * Base Markdown component
 * @author Mient-jan Stelling + contributors
 */

import React, { useMemo, ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import parser from './lib/parser';
import getUniqueID from './lib/util/getUniqueID';
import hasParents from './lib/util/hasParents';
import openUrl from './lib/util/openUrl';
import tokensToAST from './lib/util/tokensToAST';
import renderRules from './lib/renderRules';
import AstRenderer from './lib/AstRenderer';
import MarkdownIt from 'markdown-it';
import PluginContainer from './lib/plugin/PluginContainer';
import blockPlugin from './lib/plugin/blockPlugin';
import removeTextStyleProps from './lib/util/removeTextStyleProps';
import { styles } from './lib/styles';
import { stringToTokens } from './lib/util/stringToTokens';
import { ASTNode, MarkdownProps, RenderRules, StylesType } from './types';

export {
  getUniqueID,
  openUrl,
  hasParents,
  renderRules,
  AstRenderer,
  parser,
  stringToTokens,
  tokensToAST,
  MarkdownIt,
  PluginContainer,
  blockPlugin,
  styles,
  removeTextStyleProps,
};

// we use StyleSheet.flatten here to make sure we have an object, in case someone
// passes in a StyleSheet.create result to the style prop
const getStyle = (mergeStyle: boolean, style: StylesType | null): StylesType => {
  let useStyles: StylesType = {};

  if (mergeStyle === true && style) {
    Object.keys(styles).forEach(value => {
      useStyles[value] = {
        ...styles[value],
        ...(style !== null ? StyleSheet.flatten(style[value]) : {}),
      };
    });
  } else {
    useStyles = {
      ...styles,
    };

    if (style !== null) {
      Object.keys(style).forEach(value => {
        useStyles[value] = {
          ...StyleSheet.flatten(style[value]),
        };
      });
    }
  }

  Object.keys(useStyles).forEach(value => {
    const styleValue = StyleSheet.flatten(useStyles[value]);
    useStyles['_VIEW_SAFE_' + value] = removeTextStyleProps(styleValue || {});
  });

  return StyleSheet.create(useStyles as any) as StylesType; // StyleSheet.create doesn't preserve custom style keys
};

type RendererLike = {
  render: (nodes: readonly ASTNode[]) => ReactNode;
};

const getRenderer = (
  renderer: AstRenderer | ((nodes: readonly ASTNode[]) => ReactNode) | null,
  rules: RenderRules | null,
  style: StylesType | null,
  mergeStyle: boolean,
  onLinkPress?: (url: string) => boolean | void,
  maxTopLevelChildren?: number | null,
  topLevelMaxExceededItem?: ReactNode,
  allowedImageHandlers?: string[],
  defaultImageHandler?: string,
  debugPrintTree?: boolean,
  textLimit?: number,
): RendererLike => {
  if (renderer && rules) {
    console.warn(
      'react-native-markdown-display you are using renderer and rules at the same time. This is not possible, props.rules is ignored',
    );
  }

  if (renderer && style) {
    console.warn(
      'react-native-markdown-display you are using renderer and style at the same time. This is not possible, props.style is ignored',
    );
  }

  // these checks are here to prevent extra overhead.
  if (renderer) {
    if (renderer instanceof AstRenderer) {
      return renderer;
    }
    return { render: renderer };
  }
  
  const useStyles = getStyle(mergeStyle, style);

  return new AstRenderer(
    {
      ...renderRules(textLimit),
      ...(rules || {}),
    },
    useStyles,
    onLinkPress,
    maxTopLevelChildren,
    topLevelMaxExceededItem,
    allowedImageHandlers,
    defaultImageHandler,
    debugPrintTree,
  );
};

const getMarkdownParser = (
  markdownit: MarkdownIt,
  plugins?: Array<PluginContainer<unknown>>,
): MarkdownIt => {
  let md = markdownit;
  if (plugins && plugins.length > 0) {
    plugins.forEach(plugin => {
      const [fn, ...args] = plugin.toArray();
      md = md.use(fn as any, ...args);
    });
  }

  return md;
};

const Markdown = React.memo<MarkdownProps>(
  ({
    children,
    renderer = null,
    rules = null,
    plugins = [],
    style = null,
    mergeStyle = true,
    markdownit = MarkdownIt({
      typographer: true,
    }),
    onLinkPress,
    maxTopLevelChildren = null,
    topLevelMaxExceededItem = <Text key="dotdotdot">...</Text>,
    allowedImageHandlers = [
      'data:image/png;base64',
      'data:image/gif;base64',
      'data:image/jpeg;base64',
      'https://',
      'http://',
    ],
    defaultImageHandler = 'https://',
    debugPrintTree = false,
    textLimit = undefined,
  }) => {
    const memoizedRenderer = useMemo(
      () =>
        getRenderer(
          renderer,
          rules,
          style,
          mergeStyle,
          onLinkPress,
          maxTopLevelChildren,
          topLevelMaxExceededItem,
          allowedImageHandlers,
          defaultImageHandler,
          debugPrintTree,
          textLimit,
        ),
      [
        maxTopLevelChildren,
        onLinkPress,
        renderer,
        rules,
        style,
        mergeStyle,
        topLevelMaxExceededItem,
        allowedImageHandlers,
        defaultImageHandler,
        debugPrintTree,
        textLimit,
      ],
    );

    const markdownParser = useMemo(
      () => getMarkdownParser(markdownit, plugins),
      [markdownit, plugins],
    );

    return parser(
      children,
      memoizedRenderer.render,
      markdownParser,
    );
  },
);

Markdown.displayName = 'Markdown';

export default Markdown;

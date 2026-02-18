import React, { ReactNode } from 'react';
import {
  Text,
  Pressable,
  View,
  Platform,
  StyleSheet,
  TextStyle,
  Image,
  ImageStyle,
} from 'react-native';

import openUrl from './util/openUrl';
import hasParents from './util/hasParents';

import textStyleProps from './data/textStyleProps';
import { RenderRules, ASTNode, StylesType, RenderFunction } from '../types';

const renderRules = (textLimit?: number): RenderRules => ({
  // when unknown elements are introduced, so it wont break
  unknown: (_node, _children, _parent, _styles) => null,

  // The main container
  body: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_body}>
      {children}
    </View>
  ),

  // Headings
  heading1: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading1}>
      {children}
    </View>
  ),
  heading2: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading2}>
      {children}
    </View>
  ),
  heading3: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading3}>
      {children}
    </View>
  ),
  heading4: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading4}>
      {children}
    </View>
  ),
  heading5: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading5}>
      {children}
    </View>
  ),
  heading6: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading6}>
      {children}
    </View>
  ),

  // Horizontal Rule
  hr: (node, _children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_hr} />
  ),

  // Emphasis
  strong: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.strong}>
      {children}
    </Text>
  ),
  em: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.em}>
      {children}
    </Text>
  ),
  s: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.s}>
      {children}
    </Text>
  ),

  // Blockquotes
  blockquote: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_blockquote}>
      {children}
    </View>
  ),

  // Lists
  bullet_list: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_bullet_list}>
      {children}
    </View>
  ),
  ordered_list: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_ordered_list}>
      {children}
    </View>
  ),
  // this is a unique and quite annoying render rule because it has
  // child items that can be styled (the list icon and the list content)
  // outside of the AST tree so there are some work arounds in the
  // AST renderer specifically to get the styling right here
  list_item: ((node: ASTNode, children: ReactNode, parent: ASTNode[], styles: StylesType, inheritedStyles: TextStyle = {}) => {
    // we need to grab any text specific stuff here that is applied on the list_item style
    // and apply it onto bullet_list_icon. the AST renderer has some workaround code to make
    // the content classes apply correctly to the child AST tree items as well
    // as code that forces the creation of the inheritedStyles object for list_items
    const refStyle = {
      ...inheritedStyles,
      ...StyleSheet.flatten(styles.list_item),
    };

    const arr = Object.keys(refStyle);

    const modifiedInheritedStylesObj: TextStyle = {};

    for (let b = 0; b < arr.length; b++) {
      const key = arr[b];
      if (key && textStyleProps.includes(key)) {
        (modifiedInheritedStylesObj as Record<string, unknown>)[key] = (refStyle as Record<string, unknown>)[key];
      }
    }

    if (hasParents(parent, 'bullet_list')) {
      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text style={[modifiedInheritedStylesObj, styles.bullet_list_icon]}>
            {Platform.select({
              android: '\u2022',
              ios: '\u00B7',
              default: '\u2022',
            })}
          </Text>
          <View style={styles._VIEW_SAFE_bullet_list_content}>{children}</View>
        </View>
      );
    }

    if (hasParents(parent, 'ordered_list')) {
      const orderedListIndex = parent.findIndex(
        (el: ASTNode) => el.type === 'ordered_list',
      );

      const orderedList = parent[orderedListIndex];
      let listItemNumber;

      if (orderedList && orderedList.attributes && orderedList.attributes.start) {
        listItemNumber = (orderedList.attributes.start as number) + node.index;
      } else {
        listItemNumber = node.index + 1;
      }

      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text style={[modifiedInheritedStylesObj, styles.ordered_list_icon]}>
            {listItemNumber}
            {node.markup}
          </Text>
          <View style={styles._VIEW_SAFE_ordered_list_content}>{children}</View>
        </View>
      );
    }

    // we should not need this, but just in case
    return (
      <View key={node.key} style={styles._VIEW_SAFE_list_item}>
        {children}
      </View>
    );
  }) as RenderFunction,

  // Code
  code_inline: ((node: ASTNode, _children: ReactNode, _parent: ASTNode[], styles: StylesType, inheritedStyles: TextStyle = {}) => (
    <Text key={node.key} style={[inheritedStyles, styles.code_inline]}>
      {node.content}
    </Text>
  )) as RenderFunction,
  code_block: ((node: ASTNode, _children: ReactNode, _parent: ASTNode[], styles: StylesType, inheritedStyles: TextStyle = {}) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.
    let {content} = node;

    if (
      typeof node.content === 'string' &&
      node.content.charAt(node.content.length - 1) === '\n'
    ) {
      content = node.content.substring(0, node.content.length - 1);
    }

    return (
      <Text key={node.key} style={[inheritedStyles, styles.code_block]}>
        {content}
      </Text>
    );
  }) as RenderFunction,
  fence: ((node: ASTNode, _children: ReactNode, _parent: ASTNode[], styles: StylesType, inheritedStyles: TextStyle = {}) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.
    let {content} = node;

    if (
      typeof node.content === 'string' &&
      node.content.charAt(node.content.length - 1) === '\n'
    ) {
      content = node.content.substring(0, node.content.length - 1);
    }

    return (
      <Text key={node.key} style={[inheritedStyles, styles.fence]}>
        {content}
      </Text>
    );
  }) as RenderFunction,

  // Tables
  table: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_table}>
      {children}
    </View>
  ),
  thead: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_thead}>
      {children}
    </View>
  ),
  tbody: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_tbody}>
      {children}
    </View>
  ),
  th: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_th}>
      {children}
    </View>
  ),
  tr: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_tr}>
      {children}
    </View>
  ),
  td: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_td}>
      {children}
    </View>
  ),

  // Links
  link: ((node: ASTNode, children: ReactNode, _parent: ASTNode[], styles: StylesType, onLinkPress?: (url: string) => boolean | void) => (
    <Text
      key={node.key}
      style={styles.link}
      onPress={() => openUrl(node.attributes.href as string, onLinkPress)}>
      {children}
    </Text>
  )) as RenderFunction,
  blocklink: ((node: ASTNode, children: ReactNode, _parent: ASTNode[], styles: StylesType, onLinkPress?: (url: string) => boolean | void) => (
    <Pressable
      key={node.key}
      onPress={() => openUrl(node.attributes.href as string, onLinkPress)}
      style={styles.blocklink}>
      <View style={styles.image}>{children}</View>
    </Pressable>
  )) as RenderFunction,

  // Images
  image: ((
    node: ASTNode,
    _children: ReactNode,
    _parent: ASTNode[],
    styles: StylesType,
    allowedImageHandlers?: string[],
    defaultImageHandler?: string | null,
  ) => {
    const { src, alt } = node.attributes as { src?: string; alt?: string };

    // we check that the source starts with at least one of the elements in allowedImageHandlers
    const show =
      allowedImageHandlers?.filter(value => {
        return src?.toLowerCase().startsWith(value.toLowerCase());
      }).length ?? 0 > 0;

    if (show === false && defaultImageHandler === null) {
      return null;
    }

    return (
      <Image
        key={node.key}
        style={styles._VIEW_SAFE_image as ImageStyle}
        source={{
          uri: show === true ? (src || '') : `${defaultImageHandler}${src || ''}`,
        }}
        resizeMode="contain"
        {...(alt ? { accessible: true, accessibilityLabel: alt } : {})}
      />
    );
  }) as RenderFunction,

  // Text Output
  text: ((node: ASTNode, _children: ReactNode, _parent: ASTNode[], styles: StylesType, inheritedStyles: TextStyle = {}, onLinkPress?: (url: string) => boolean | void) => {
    if (textLimit) {
      const longerThanLimit = node.content.length >= textLimit;

      return (
        <Text key={node.key} style={[inheritedStyles, styles.text]}>
          {longerThanLimit
            ? `${node.content.slice(0, textLimit)}...`
            : node.content}{' '}
          <Text
            style={[inheritedStyles, styles.link]}
            onPress={() => openUrl('/seemore', onLinkPress)}>
            See more
          </Text>
        </Text>
      );
    }

    return (
      <Text key={node.key} style={[inheritedStyles, styles.text]}>
        {node.content}
      </Text>
    );
  }) as RenderFunction,
  textgroup: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.textgroup}>
      {children}
    </Text>
  ),
  paragraph: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_paragraph}>
      {children}
    </View>
  ),
  hardbreak: (node, _children, _parent, styles) => (
    <Text key={node.key} style={styles.hardbreak}>
      {'\n'}
    </Text>
  ),
  softbreak: (node, _children, _parent, styles) => (
    <Text key={node.key} style={styles.softbreak}>
      {'\n'}
    </Text>
  ),

  // Believe these are never used but retained for completeness
  pre: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_pre}>
      {children}
    </View>
  ),
  inline: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.inline}>
      {children}
    </Text>
  ),
  span: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.span}>
      {children}
    </Text>
  ),
});

export default renderRules;

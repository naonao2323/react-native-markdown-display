import textStyleProps from '../data/textStyleProps';

const textStylePropsSet = new Set(textStyleProps);

export default function removeTextStyleProps(style) {
  const obj = {};

  for (const key in style) {
    if (style.hasOwnProperty(key) && !textStylePropsSet.has(key)) {
      obj[key] = style[key];
    }
  }

  return obj;
}

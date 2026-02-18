import textStyleProps from '../data/textStyleProps';
import { TextStyle, ViewStyle } from 'react-native';

export default function removeTextStyleProps(
  style: TextStyle | ViewStyle,
): ViewStyle {
  const intersection = textStyleProps.filter(value =>
    Object.keys(style).includes(value),
  );

  const obj = { ...style };

  intersection.forEach(value => {
    delete obj[value as keyof typeof obj];
  });

  return obj as ViewStyle;
}

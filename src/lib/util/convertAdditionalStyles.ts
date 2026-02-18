import cssToReactNative from 'css-to-react-native';
import { TextStyle } from 'react-native';

export default function convertAdditionalStyles(style: string): TextStyle {
  const rules = style.split(';');

  const tuples = rules
    .map(rule => {
      const [key, value] = rule.split(':');

      if (key && value) {
        return [key.trim(), value.trim()] as [string, string];
      } else {
        return null;
      }
    })
    .filter((x): x is [string, string] => x !== null);

  const conv = cssToReactNative(tuples);

  return conv;
}

module.exports = {
  StyleSheet: {
    create: styles => styles,
    flatten: style => style || {},
  },
  Platform: {
    OS: 'ios',
    select: obj => obj.ios || obj.default,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
  },
  Text: 'Text',
  View: 'View',
  Image: 'Image',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
  },
};

import { Linking } from 'react-native';

/**
 * Opens a URL in the default browser
 * @param url - The URL to open. If empty/falsy, no action taken.
 * @param customCallback - Optional callback to handle URL opening
 *   - Return true: callback handled it, don't open URL
 *   - Return false or void: callback didn't handle, open URL with Linking.openURL
 * 
 * This matches the documented API behavior in README.md
 */
export default function openUrl(
  url: string,
  customCallback?: (url: string) => boolean | void,
): void {
  if (customCallback) {
    const handled = customCallback(url);
    // If callback returns truthy value, it handled the URL, don't open
    // If callback returns falsy value (false/void/null/undefined), open the URL
    if (!handled && url) {
      Linking.openURL(url);
    }
  } else if (url) {
    Linking.openURL(url);
  }
}

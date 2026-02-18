import fc from 'fast-check';
import openUrl from './openUrl';
import { Linking } from 'react-native';

jest.mock('react-native');

describe('openUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy path: No callback', () => {
    it('should call Linking.openURL when URL is provided', () => {
      // Arrange
      const url = 'https://example.com';
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge case: null and undefined', () => {
    it('should not call Linking.openURL when URL is null', () => {
      // Arrange
      const url = null;
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should not call Linking.openURL when URL is undefined', () => {
      // Arrange
      const url = undefined;
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should not call Linking.openURL when URL is empty string', () => {
      // Arrange
      const url = '';
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('Happy path: Callback returns true (handled)', () => {
    it('should NOT open URL when callback returns true (callback handled it)', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => true);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('Happy path: Callback returns false (not handled)', () => {
    it('should open URL when callback returns false (callback did not handle)', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => false);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });
  });

  describe('Edge case: Callback returns non-boolean (treated as falsy)', () => {
    it('should NOT open URL when callback returns string (truthy value treated as handled)', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => 'string');
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should NOT open URL when callback returns number (truthy value treated as handled)', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => 1);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should NOT open URL when callback returns object (truthy value treated as handled)', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => ({}));
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('Property-based tests', () => {
    it('should call openURL at most once for any URL', () => {
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          // Arrange
          Linking.openURL.mockClear();
          
          // Act
          openUrl(url);
          
          // Assert
          return Linking.openURL.mock.calls.length <= 1;
        }),
        { numRuns: 50 }
      );
    });

    it('Callback boolean determines behavior: true=handled (no open), false=not handled (open)', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.boolean(),
          (url, handled) => {
            // Arrange
            Linking.openURL.mockClear();
            const callback = () => handled;
            
            // Act
            openUrl(url, callback);
            
            // Assert
            const callCount = Linking.openURL.mock.calls.length;
            // If callback returned true (handled), should NOT open (callCount === 0)
            // If callback returned false (not handled), should open (callCount === 1)
            return handled ? callCount === 0 : callCount === 1;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

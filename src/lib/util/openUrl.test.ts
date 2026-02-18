import fc from 'fast-check';
import openUrl from './openUrl';
import { Linking } from 'react-native';

jest.mock('react-native');

describe('openUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系: コールバックなし', () => {
    it('URLが与えられた時、Linking.openURLを呼ぶこと', () => {
      // Arrange
      const url = 'https://example.com';
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledTimes(1);
    });
  });

  describe('境界値: nullとundefined', () => {
    it('URLがnullの時、Linking.openURLを呼ばないこと', () => {
      // Arrange
      const url = null;
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('URLがundefinedの時、Linking.openURLを呼ばないこと', () => {
      // Arrange
      const url = undefined;
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('URLが空文字列の時、Linking.openURLを呼ばないこと', () => {
      // Arrange
      const url = '';
      
      // Act
      openUrl(url);
      
      // Assert
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('正常系: コールバックあり - trueを返す', () => {
    it('コールバックがtrueを返す時、URLを開くこと', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => true);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });
  });

  describe('正常系: コールバックあり - falseを返す', () => {
    it('コールバックがfalseを返す時、URLを開かないこと', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => false);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('異常系: コールバックが不正な値を返す', () => {
    it('コールバックが文字列を返す時、URLを開かないこと', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => 'string');
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('コールバックが数値を返す時、URLを開かないこと', () => {
      // Arrange
      const url = 'https://example.com';
      const callback = jest.fn(() => 1);
      
      // Act
      openUrl(url, callback);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('コールバックがオブジェクトを返す時、URLを開かないこと', () => {
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

  describe('プロパティベーステスト', () => {
    it('任意のURLで最大1回しかopenURLが呼ばれないこと', () => {
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

    it('コールバックの真偽値によって動作が決まること', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.boolean(),
          (url, shouldOpen) => {
            // Arrange
            Linking.openURL.mockClear();
            const callback = () => shouldOpen;
            
            // Act
            openUrl(url, callback);
            
            // Assert
            const callCount = Linking.openURL.mock.calls.length;
            return shouldOpen ? callCount === 1 : callCount === 0;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

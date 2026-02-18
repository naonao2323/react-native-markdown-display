import fc from 'fast-check';
import getUniqueID from './getUniqueID';

describe('getUniqueID', () => {
  describe('正常系: IDフォーマット', () => {
    it('rnmr_で始まる文字列を返すこと', () => {
      // Arrange
      // (no setup needed)
      
      // Act
      const id = getUniqueID();
      
      // Assert
      expect(id).toMatch(/^rnmr_/);
    });

    it('16進数の文字列を含むこと', () => {
      // Arrange
      // (no setup needed)
      
      // Act
      const id = getUniqueID();
      
      // Assert
      expect(id).toMatch(/^rnmr_[0-9a-f]+$/);
    });
  });

  describe('正常系: 一意性', () => {
    it('連続して呼び出した時、異なるIDを返すこと', () => {
      // Arrange
      // (no setup needed)
      
      // Act
      const id1 = getUniqueID();
      const id2 = getUniqueID();
      
      // Assert
      expect(id1).not.toBe(id2);
    });

    it('複数回呼び出した時、すべて異なるIDを返すこと', () => {
      // Arrange
      const idCount = 10;
      
      // Act
      const ids = Array.from({ length: idCount }, () => getUniqueID());
      const uniqueIds = new Set(ids);
      
      // Assert
      expect(uniqueIds.size).toBe(idCount);
    });
  });

  describe('正常系: 順序性', () => {
    it('後に生成されたIDは数値的に大きいこと', () => {
      // Arrange
      const id1 = getUniqueID();
      
      // Act
      const id2 = getUniqueID();
      
      // Assert
      const num1 = parseInt(id1.replace('rnmr_', ''), 16);
      const num2 = parseInt(id2.replace('rnmr_', ''), 16);
      expect(num2).toBeGreaterThan(num1);
    });
  });

  describe('プロパティベーステスト', () => {
    it('任意の回数呼び出しても常に一意なIDを生成すること', () => {
      // Property-based test
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
          // Arrange & Act
          const ids = new Set();
          for (let i = 0; i < count; i++) {
            ids.add(getUniqueID());
          }
          
          // Assert
          return ids.size === count;
        })
      );
    });

    it('生成されたIDは常に文字列型であること', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 50 }), (iterations) => {
          for (let i = 0; i < iterations; i++) {
            const id = getUniqueID();
            if (typeof id !== 'string') return false;
          }
          return true;
        })
      );
    });
  });
});

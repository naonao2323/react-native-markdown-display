import fc from 'fast-check';
import hasParents from './hasParents';

describe('hasParents', () => {
  describe('正常系: 存在する型を検索', () => {
    it('配列の最初の要素の型を見つけられること', () => {
      // Arrange
      const parents = [
        { type: 'paragraph' },
        { type: 'list' },
        { type: 'blockquote' }
      ];
      
      // Act
      const result = hasParents(parents, 'paragraph');
      
      // Assert
      expect(result).toBe(true);
    });

    it('配列の中間の要素の型を見つけられること', () => {
      // Arrange
      const parents = [
        { type: 'paragraph' },
        { type: 'list' },
        { type: 'blockquote' }
      ];
      
      // Act
      const result = hasParents(parents, 'list');
      
      // Assert
      expect(result).toBe(true);
    });

    it('配列の最後の要素の型を見つけられること', () => {
      // Arrange
      const parents = [
        { type: 'paragraph' },
        { type: 'list' },
        { type: 'blockquote' }
      ];
      
      // Act
      const result = hasParents(parents, 'blockquote');
      
      // Assert
      expect(result).toBe(true);
    });
  });

  describe('正常系: 存在しない型を検索', () => {
    it('存在しない型の場合、falseを返すこと', () => {
      // Arrange
      const parents = [
        { type: 'paragraph' },
        { type: 'list' }
      ];
      
      // Act
      const result = hasParents(parents, 'heading');
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('境界値: 空配列', () => {
    it('空配列の場合、falseを返すこと', () => {
      // Arrange
      const parents = [];
      
      // Act
      const result = hasParents(parents, 'paragraph');
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('正常系: 追加プロパティを持つオブジェクト', () => {
    it('type以外のプロパティがあっても正しく検索できること', () => {
      // Arrange
      const parents = [
        { type: 'paragraph', level: 1, content: 'test' },
        { type: 'list', ordered: true }
      ];
      
      // Act
      const result = hasParents(parents, 'list');
      
      // Assert
      expect(result).toBe(true);
    });
  });

  describe('プロパティベーステスト', () => {
    it('ランダムな配列でも期待通りの結果を返すこと', () => {
      // Property-based test
      const typeArb = fc.constantFrom('paragraph', 'list', 'heading', 'blockquote', 'code');
      
      fc.assert(
        fc.property(
          fc.array(typeArb.map(type => ({ type }))),
          typeArb,
          (parents, searchType) => {
            // Arrange & Act
            const expected = parents.some(p => p.type === searchType);
            const result = hasParents(parents, searchType);
            
            // Assert
            return result === expected;
          }
        )
      );
    });

    it('任意の文字列型でも型エラーが発生しないこと', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ type: fc.string() })),
          fc.string(),
          (parents, searchType) => {
            try {
              const result = hasParents(parents, searchType);
              return typeof result === 'boolean';
            } catch (e) {
              return false;
            }
          }
        )
      );
    });
  });
});

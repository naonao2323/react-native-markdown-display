import fc from 'fast-check';
import hasParents from './hasParents';

describe('hasParents', () => {
  describe('Happy path: searching for existing types', () => {
    it('should find type of first element in array', () => {
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

    it('should find type of middle element in array', () => {
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

    it('should find type of last element in array', () => {
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

  describe('Happy path: searching for non-existing types', () => {
    it('should return false when type does not exist', () => {
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

  describe('Edge case: empty array', () => {
    it('should return false for empty array', () => {
      // Arrange
      const parents = [];
      
      // Act
      const result = hasParents(parents, 'paragraph');
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Happy path: objects with additional properties', () => {
    it('should correctly search even when objects have properties other than type', () => {
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

  describe('Property-based tests', () => {
    it('should return expected results for random arrays', () => {
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

    it('should not cause type errors with arbitrary string types', () => {
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

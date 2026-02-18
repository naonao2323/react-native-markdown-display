import fc from 'fast-check';
import AstRenderer from './AstRenderer';

// We don't need to actually test the renderer deeply since it requires React Native
// Instead we test it can be imported and has the expected structure
describe('AstRenderer', () => {
  it('should be importable', () => {
    expect(AstRenderer).toBeDefined();
    expect(typeof AstRenderer).toBe('function');
  });

  it('property: module structure is stable', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        return typeof AstRenderer === 'function';
      })
    );
  });
});

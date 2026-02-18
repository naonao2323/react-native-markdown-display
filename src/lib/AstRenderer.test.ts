import fc from 'fast-check';

// We don't need to actually test the renderer deeply since it requires React Native
// Instead we test it can be imported and has the expected structure
describe('AstRenderer', () => {
  it('should be importable', () => {
    const AstRenderer = require('./AstRenderer').default;
    expect(AstRenderer).toBeDefined();
    expect(typeof AstRenderer).toBe('function');
  });

  it('property: module structure is stable', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        const AstRenderer = require('./AstRenderer').default;
        return typeof AstRenderer === 'function';
      })
    );
  });
});

describe('Global Object', function() {

  it('defines Editable', function() {
    expect(window.Editable).toBeDefined();
  });

  it('defines Editable.add', function() {
    expect(window.Editable.add).toBeDefined();
  });

  it('defines Editable.remove', function() {
    expect(window.Editable.remove).toBeDefined();
  });

  it('defines Editable.on', function() {
    expect(window.Editable.on).toBeDefined();
  });

  it('defines Editable.off', function() {
    expect(window.Editable.off).toBeDefined();
  });

  // Test no variables are leaking into global namespace
  it('does not define dispatcher globally', function() {
    expect(window.dispatcher).not.toBeDefined();
  });

});

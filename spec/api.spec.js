describe('Global Object', function() {
  var editable;

  afterEach(function() {
    if (editable) {
      editable.off();
      editable = undefined;
    }
  });

  it('defines Editable', function() {
    expect(window.Editable).toBeDefined();
  });

  it('creates a new Editable instance', function() {
    editable = new Editable();
    expect(editable.on).toBeDefined();
  });

  // Test no variables are leaking into global namespace
  it('does not define dispatcher globally', function() {
    expect(window.dispatcher).not.toBeDefined();
  });

});

describe("Editable configuration", function() {
  var editable;

  afterEach(function() {
    if (editable) {
      editable.off();
      editable = undefined;
    }
  });

  it("should use the default as base", function() {
    editable = new Editable();
    expect(editable.config.log).toEqual(false);
    expect(editable.config.editableClass).toEqual('js-editable');
  });

  it("should override the default", function() {
    editable = new Editable({
      log: true
    });
    expect(editable.config.log).toEqual(true);
    expect(editable.config.editableClass).toEqual('js-editable');
  });

});

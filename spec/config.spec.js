describe("Editable configuration", function() {

  it("should not be exposed", function() {
    expect(window.Editable.config).not.toBeDefined();
  });

  it("should disable logging by default", function() {
    expect(config.log).toEqual(false);
  });

  it("init() should change configuration", function() {
    Editable.init({
      log: true
    });
    expect(config.log).toEqual(true);
  });

});

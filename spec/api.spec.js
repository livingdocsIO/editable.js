describe("Global Object", function() {

  it("should define Editable", function() {
    expect(window.Editable).toBeDefined();
  });

  it("should define Editable.add", function() {
    expect(window.Editable.add).toBeDefined();
  });

  it("should define Editable.remove", function() {
    expect(window.Editable.remove).toBeDefined();
  });

  it("should define Editable.on", function() {
    expect(window.Editable.on).toBeDefined();
  });

  it("should define Editable.off", function() {
    expect(window.Editable.off).toBeDefined();
  });

  // Test no variables are leaking into global namespace
  it("should not define events globally", function() {
    expect(window.events).not.toBeDefined();
  });

});

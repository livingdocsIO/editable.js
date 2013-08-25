describe("Selection Class", function() {

  it("should be defined", function() {
    expect(Selection).toBeDefined();
  });

  it("should have isAllSelected() defined on its prototype", function() {
    expect( Selection.prototype.hasOwnProperty("isAllSelected") ).toEqual(true);
  });

  it("should have isAtEnd() method from Cursor in its protoype chain", function() {
    expect( Selection.prototype.hasOwnProperty("isAtEnd") ).toEqual(false);
    expect( Cursor.prototype.hasOwnProperty("isAtEnd") ).toEqual(true);
    expect( "isAtEnd" in Selection.prototype ).toEqual(true);
  });

});

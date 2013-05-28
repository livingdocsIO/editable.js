describe("Selection Class", function() {

  it("should be defined", function() {
    expect(Selection).toBeDefined();
  });

  it("should have isAllSelected() defined on its prototype", function() {
    expect( Selection.prototype.hasOwnProperty("isAllSelected") ).toEqual(true);
  });

  it("should have isAtTheEnd() method from Cursor in its protoype chain", function() {
    expect( Selection.prototype.hasOwnProperty("isAtTheEnd") ).toEqual(false);
    expect( Cursor.prototype.hasOwnProperty("isAtTheEnd") ).toEqual(true);
    expect( "isAtTheEnd" in Selection.prototype ).toEqual(true);
  });

});

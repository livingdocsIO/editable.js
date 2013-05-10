describe("Cursor Class", function() {

  it("should be defined", function() {
    expect(Cursor).toBeDefined();
  });

  it("should be defined", function() {
    var oneWord = $("<div>foobar</div>")[0];
    var docFragment = document.createDocumentFragment();
    docFragment.appendChild(oneWord);

    var range = rangy.createRange();
    range.selectNodeContents(oneWord);
    var cursor = new Cursor(oneWord, range);
    expect(range.startContainer).toEqual(oneWord);
    expect(range.startOffset).toEqual(0);
    expect(range.endContainer).toEqual(oneWord);
    expect(range.endOffset).toEqual(1);
  });

});

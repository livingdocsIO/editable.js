
describe("Test parser", function() {

  // test elements
  var empty = $("<div></div>");
  var emptyWithWhitespace = $("<div> </div>");
  var oneWord = $("<div>foobar</div>");
  var text = $("<div>foo bar.</div>");
  var textWithLink = $("<div>foo <a href='#'>bar</a>.</div>");
  var link = $("<div><a href='#'>foo bar</a></div>");
  var linkWithSpan = $("<div><a href='#'>foo <span class='important'>bar</span></a></div>");

  it("should get element index of link in text", function() {
    var linkNode = textWithLink.find("a").first()[0]
    expect( parser.getNodeIndex(linkNode) ).toBe( 1 );
  });

  it("should detect an empty node", function() {
    expect( empty[0].childNodes.length ).toBe( 0 );
    expect( parser.isEmpty(empty[0]) ).toBe( true );
  });

  it("should detect an non empty node", function() {
    expect( emptyWithWhitespace[0].childNodes.length ).toBe( 1 );
    expect( parser.isEmpty(emptyWithWhitespace[0]) ).toBe( false );
  });

});


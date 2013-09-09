describe('Parser', function() {

  // test elements
  var empty = $('<div></div>')[0];
  var emptyWithWhitespace = $('<div> </div>')[0];
  var oneWord = $('<div>foobar</div>')[0];
  var oneWordWithWhitespace = $('<div> foobar </div>')[0];
  var textNode = oneWord.firstChild;
  var text = $('<div>foo bar.</div>')[0];
  var textWithLink = $('<div>foo <a href="#">bar</a>.</div>')[0];
  var link = $('<div><a href="#">foo bar</a></div>')[0];
  var linkWithSpan = $('<div><a href="#">foo <span class="important">bar</span></a></div>')[0];


  describe('getNodeIndex()', function() {

    it('gets element index of link in text', function() {
      var linkNode = $(textWithLink).find('a').first()[0]
      expect( parser.getNodeIndex(linkNode) ).toBe( 1 );
    });
  });


  describe('isEmpty()', function() {

    it('detects an empty node', function() {
      expect( empty.childNodes.length ).toBe( 0 );
      expect( parser.isEmpty(empty) ).toBe( true );
    });

    it('detects an non-empty node', function() {
      expect( emptyWithWhitespace.childNodes.length ).toBe( 1 );
      expect( parser.isEmpty(emptyWithWhitespace) ).toBe( false );
    });
  });


  describe('isEndOffset()', function() {

    it('works for single child node', function() {
      // <div>foobar|</div>
      expect(parser.isEndOffset(oneWord, 0)).toEqual(true);
    });

    it('works for empty node', function() {
      // <div>|</div>
      expect(parser.isEndOffset(empty, 0)).toEqual(true);
    });

    it('works with a text node', function() {
      // foobar|
      expect(parser.isEndOffset(textNode, 6)).toEqual(true);

      // fooba|r
      expect(parser.isEndOffset(textNode, 5)).toEqual(false);
    });

    it('works with whitespace at the end', function() {
      // <div> foobar| </div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 7)).toEqual(false);
      // <div> foobar |</div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 8)).toEqual(true);
    });

    it('works with text and element nodes', function() {
      // <div>foo <a href='#'>bar</a>.|</div>
      expect(parser.isEndOffset(textWithLink, 2)).toEqual(true);

      // <div>foo <a href='#'>bar</a>|.</div>
      expect(parser.isEndOffset(textWithLink, 1)).toEqual(false);
    });
  });


  describe('isStartOffset()', function() {

    it('works for single child node', function() {
      // <div>|foobar</div>
      expect(parser.isStartOffset(oneWord, 0)).toEqual(true);
    });

    it('works for empty node', function() {
      // <div>|</div>
      expect(parser.isStartOffset(empty, 0)).toEqual(true);
    });

    it('works with a text node', function() {
      // |foobar
      expect(parser.isStartOffset(textNode, 0)).toEqual(true);

      // f|oobar
      expect(parser.isStartOffset(textNode, 1)).toEqual(false);
    });

    it('works with whitespace at the beginning', function() {
      // <div> |foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 1)).toEqual(false);
      // <div>| foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 0)).toEqual(true);
    });

    it('works with text and element nodes', function() {
      // <div>|foo <a href='#'>bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 0)).toEqual(true);

      // <div>foo <a href='#'>|bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 1)).toEqual(false);
    });
  });


  describe('isEndOfHost()', function() {

    it('works with text node in nested content', function() {
      var endContainer = $(linkWithSpan).find('span')[0].firstChild;
      // <div><a href='#'>foo <span class='important'>bar|</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 3)).toEqual(true);

      // <div><a href='#'>foo <span class='important'>ba|r</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).toEqual(false);
    });

    it('works with link node in nested content', function() {
      var endContainer = $(linkWithSpan).find('a')[0];
      // <div><a href='#'>foo <span class='important'>bar</span>|</a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 1)).toEqual(true);

      // <div><a href='#'>foo |<span class='important'>bar</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 0)).toEqual(false);
    });

    it('works with single text node', function() {
      var endContainer = oneWord.firstChild;
      expect(parser.isEndOfHost(oneWord, endContainer, 6)).toEqual(true);
    });
  });


  describe('isBeginningOfHost()', function() {

    it('works with link node in nested content', function() {
      var endContainer = $(linkWithSpan).find('a')[0];
      // <div><a href='#'>|foo <span class='important'>bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 0)).toEqual(true);

      // <div><a href='#'>foo <span class='important'>|bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 1)).toEqual(false);
    });

    it('works with single text node', function() {
      var endContainer = oneWord.firstChild;
      // <div>|foobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 0)).toEqual(true);

      // <div>f|oobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 1)).toEqual(false);
    });
  });


  describe('isSameNode()', function() {

    it('fails when tags are different', function() {
      var source = text.firstChild;
      var target = link.firstChild;
      expect(parser.isSameNode(target, source)).toEqual(false);
    });

    it('fails when attributes are different', function() {
      var source = link.firstChild;
      var target = link.firstChild.cloneNode(true);
      target.setAttribute('key', 'value');
      expect(parser.isSameNode(target, source)).toEqual(false);
    });

    it('works when nodes have same tag and attributes', function() {
      var source = link.firstChild;
      var target = link.firstChild.cloneNode(true);
      expect(parser.isSameNode(target, source)).toEqual(true);
    });
  });

});


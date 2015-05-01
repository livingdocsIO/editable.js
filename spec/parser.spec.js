var parser = require('../src/parser');
var config = require('../src/config');

describe('Parser', function() {

  // helper methods
  var createRangyCursorAfter = function(node) {
    var range = rangy.createRange();
    range.setStartAfter(node);
    range.setEndAfter(node);
    return range;
  };

  var createRangyCursorAtEnd = function(node) {
    var range = rangy.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    return range;
  };

  // test elements
  var empty = $('<div></div>')[0];
  var linebreak = $('<div><br></div>')[0];
  var emptyWithWhitespace = $('<div> </div>')[0];
  var singleCharacter = $('<div>a</div>')[0];
  var oneWord = $('<div>foobar</div>')[0];
  var oneWordWithWhitespace = $('<div> foobar </div>')[0];
  var oneWordWithNbsp = $('<div>&nbsp;foobar&nbsp;</div>')[0];
  var textNode = oneWord.firstChild;
  var text = $('<div>foo bar.</div>')[0];
  var textWithLink = $('<div>foo <a href="#">bar</a>.</div>')[0];
  var linkWithWhitespace = $('<div><a href="#">bar</a> </div>')[0];
  var link = $('<div><a href="#">foo bar</a></div>')[0];
  var linkWithSpan = $('<div><a href="#">foo <span class="important">bar</span></a></div>')[0];


  describe('getHost()', function() {

    beforeEach(function() {
      this.$host = $('<div class="'+ config.editableClass +'""></div>');
    });

    it('works if host is passed', function() {
      expect( parser.getHost(this.$host[0]) ).toBe( this.$host[0] );
    });

    it('works if a child of host is passed', function() {
      this.$host.html('a<em>b</em>');
      expect( parser.getHost(this.$host.find('em')[0]) ).toBe( this.$host[0] );
    });

    it('works if a text node is passed', function() {
      this.$host.html('a<em>b</em>');
      expect( parser.getHost(this.$host[0].firstChild) ).toBe( this.$host[0] );
    });
  });


  describe('getNodeIndex()', function() {

    it('gets element index of link in text', function() {
      var linkNode = $(textWithLink).find('a').first()[0];
      expect( parser.getNodeIndex(linkNode) ).toBe( 1 );
    });
  });


  describe('isVoid()', function() {

    it('detects an empty node', function() {
      expect( empty.childNodes.length ).toBe( 0 );
      expect( parser.isVoid(empty) ).toBe( true );
    });

    it('detects an non-empty node', function() {
      expect( emptyWithWhitespace.childNodes.length ).toBe( 1 );
      expect( parser.isVoid(emptyWithWhitespace) ).toBe( false );
    });
  });


  describe('isWhitespaceOnly()', function() {

    it('works with void element', function() {
      var textNode = document.createTextNode('');
      expect(parser.isWhitespaceOnly(textNode)).toEqual(true);
    });

    it('works with single whitespace', function() {
      expect(parser.isWhitespaceOnly(emptyWithWhitespace.firstChild)).toEqual(true);
    });

    it('works with a single character', function() {
      expect(parser.isWhitespaceOnly(singleCharacter.firstChild)).toEqual(false);
    });

    it('ignores whitespace after the last element', function() {
      expect(parser.isWhitespaceOnly(link.firstChild)).toEqual(false);
    });
  });


  describe('lastOffsetWithContent()', function() {

    describe('called with a text node', function(){

      it('works for single character', function() {
        // <div>a|</div>
        expect(parser.lastOffsetWithContent(singleCharacter.firstChild)).toEqual(1);
      });

      it('works with a single word text node', function() {
        // <div>foobar|</div>
        expect(parser.lastOffsetWithContent(oneWord.firstChild)).toEqual(6);
      });

      it('works with a single word text node with whitespace', function() {
        // <div> foobar| </div>
        expect(parser.lastOffsetWithContent(oneWordWithWhitespace.firstChild)).toEqual(7);
      });
    });

    describe('called with an element node', function(){

      it('works with an empty tag', function() {
        // <div></div>
        expect(parser.lastOffsetWithContent(empty)).toEqual(0);
      });

      it('works with a single character', function() {
        // <div>a</div>
        expect(parser.lastOffsetWithContent(singleCharacter)).toEqual(1);
      });

      it('works with whitespace after last tag', function() {
        // <div><a href="#">bar</a> </div>
        expect(parser.lastOffsetWithContent(linkWithWhitespace)).toEqual(1);
      });

      it('works with whitespace after last tag', function() {
        // <div>foo <a href="#">bar</a>.</div>
        expect(parser.lastOffsetWithContent(textWithLink)).toEqual(3);
      });
    });

  });

  describe('isEndOffset()', function() {

    it('works for single child node', function() {
      // <div>foobar|</div>
      var range = createRangyCursorAfter(oneWord.firstChild);
      expect(range.endOffset).toEqual(1);
      expect(parser.isEndOffset(oneWord, 1)).toEqual(true);
    });

    it('works for empty node', function() {
      // <div>|</div>
      var range = createRangyCursorAtEnd(empty);
      expect(parser.isEndOffset(empty, range.endOffset)).toEqual(true);
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
      var range = createRangyCursorAfter(textWithLink.childNodes[2]);
      expect(range.endOffset).toEqual(3);
      expect(parser.isEndOffset(textWithLink, 3)).toEqual(true);

      // <div>foo <a href='#'>bar</a>|.</div>
      range = createRangyCursorAfter(textWithLink.childNodes[1]);
      expect(range.endOffset).toEqual(2);
      expect(parser.isEndOffset(textWithLink, 2)).toEqual(false);
    });
  });


  describe('isTextEndOffset()', function() {

    it('ignores whitespace at the end', function() {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 6)).toEqual(false);
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 7)).toEqual(true);
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 8)).toEqual(true);
    });

    it('ignores non-breaking-space at the end', function() {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 6)).toEqual(false);
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 7)).toEqual(true);
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 8)).toEqual(true);
    });

    it('ignores whitespace after the last element', function() {
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 2)).toEqual(false);
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 3)).toEqual(true);
    });

    it('ignores whitespace after the last element', function() {
      // <div><a href="#">bar|</a> </div>
      var range = createRangyCursorAfter(linkWithWhitespace.firstChild.firstChild);
      expect(range.endOffset).toEqual(1);
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 1)).toEqual(true);
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 0)).toEqual(false);
    });

    it('ignores whitespace after the last element', function() {
      // <div><a href="#">bar</a>| </div>
      var range = createRangyCursorAfter(linkWithWhitespace.firstChild);
      expect(range.endOffset).toEqual(1);
      expect(parser.isTextEndOffset(linkWithWhitespace, 1)).toEqual(true);
      expect(parser.isTextEndOffset(linkWithWhitespace, 0)).toEqual(false);
    });

    it('ignores a linebreak', function() {
      // <div>|<br></div>
      var range = rangy.createRange();
      range.selectNodeContents(linebreak);
      range.collapse(true);
      expect(range.endOffset).toEqual(0);
      expect(parser.isTextEndOffset(linebreak, 0)).toEqual(true);
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
      // <div><a href='#'>foo <span class='important'>bar</span>|</a></div>
      var endContainer = $(linkWithSpan).find('a')[0];
      var range = createRangyCursorAtEnd(endContainer);
      expect(range.endOffset).toEqual(2);
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).toEqual(true);

      // <div><a href='#'>foo |<span class='important'>bar</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 1)).toEqual(false);
    });

    it('works with single text node', function() {
      // <div>foobar|</div>
      var endContainer = oneWord.firstChild;
      expect(parser.isEndOfHost(oneWord, endContainer, 6)).toEqual(true);
      expect(parser.isEndOfHost(oneWord, endContainer, 5)).toEqual(false);
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


  describe('latestChild()', function() {
    it('returns the deepest last child', function() {
      var source = linkWithSpan;
      var target = document.createTextNode('bar');
      expect(parser.latestChild(source).isEqualNode(target)).toEqual(true);
    });
  });

  describe('isInlineElement()', function() {
    var $elem;

    afterEach(function() {
      if ($elem) {
        $elem.remove();
        $elem = undefined;
      }
    });

    it('returns false for a div', function() {
      $elem = $('<div>');
      $(document.body).append($elem);
      expect(parser.isInlineElement(window, $elem[0])).toEqual(false);
    });

    it('returns true for a span', function() {
      $elem = $('<span>');
      $(document.body).append($elem);
      expect(parser.isInlineElement(window, $elem[0])).toEqual(true);
    });

    it('returns true for a div with display set to "inline-block"', function() {
      $elem = $('<div style="display:inline-block;">');
      $(document.body).append($elem);
      expect(parser.isInlineElement(window, $elem[0])).toEqual(true);
    });

  });

});

describe('isDocumentFragmentWithoutChildren()', function() {

  beforeEach(function() {
    this.frag = window.document.createDocumentFragment();
  });

  it('returns truthy for a fragment with no children', function() {
    expect(parser.isDocumentFragmentWithoutChildren(this.frag)).toBeTruthy();
  });

  it('returns falsy for a documentFragment with an empty text node as child', function() {
    this.frag.appendChild(window.document.createTextNode(''));
    expect(parser.isDocumentFragmentWithoutChildren(this.frag)).toBeFalsy();
  });

  it('returns falsy for undefined', function() {
    expect(parser.isDocumentFragmentWithoutChildren(undefined)).toBeFalsy();
  });

  it('returns falsy for an element node', function() {
    var node = $('<div>')[0];
    expect(parser.isDocumentFragmentWithoutChildren(node)).toBeFalsy();
  });

});

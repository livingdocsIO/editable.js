describe('highlightText', function() {

  // Helper Methods
  // --------------

  var createParagraphWithTextNodes = function(firstPart, parts) {
    var textNode, part;
    var elem = $('<p>'+ firstPart +'</p>')[0];
    for (var i=1; i<arguments.length; i++) {
      part = arguments[i];
      textNode = document.createTextNode(part);
      elem.appendChild(textNode);
    }
    return elem;
  };

  var highlight = function(elem, regex) {
    var stencil = $('<span data-awesome="crazy">')[0];
    highlightText.highlight(elem, regex, stencil);
  };

  describe('minimal case', function() {

    beforeEach(function() {
      this.textNode = $('<div>a</div>')[0];
      this.range = highlightText.getRange(this.textNode);
      this.regex = /a/g;

    });

    it('extracts the text', function(){
      var text = highlightText.extractText(this.range);
      expect(text).toEqual('a');
    });

    it('finds the letter "a"', function() {
      var matches = highlightText.find(this.range, this.regex);
      var firstMatch = matches[0];
      expect(firstMatch.search).toEqual('a');
      expect(firstMatch.matchIndex).toEqual(0);
      expect(firstMatch.startIndex).toEqual(0);
      expect(firstMatch.endIndex).toEqual(1);
    });

    it('does not find the letter "b"', function() {
      var matches = highlightText.find(this.range, /b/g);
      expect(matches.length).toEqual(0);
    });
  });

  describe('Some juice.', function() {

    beforeEach(function() {
      this.textNode = $('<div>Some juice.</div>')[0];
      this.range = highlightText.getRange(this.textNode);
      this.regex = /juice/g;
    });

    it('finds the word "juice"', function() {
      var matches = highlightText.find(this.range, this.regex);
      var firstMatch = matches[0];
      expect(firstMatch.search).toEqual('juice');
      expect(firstMatch.matchIndex).toEqual(0);
      expect(firstMatch.startIndex).toEqual(5);
      expect(firstMatch.endIndex).toEqual(10);
    });

  });

  describe('iterator', function() {

    beforeEach(function() {
      this.wrapWord = sinon.spy(highlightText, 'wrapWord');
    });

    afterEach(function() {
      this.wrapWord.restore();
    });

    it('finds a letter that is its own text node', function() {
      var elem = createParagraphWithTextNodes('a', 'b', 'c');
      highlight(elem, /b/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(1);
      expect(portions[0].text).toEqual('b');
      expect(portions[0].offset).toEqual(0);
      expect(portions[0].length).toEqual(1);
      expect(portions[0].lastPortion).toEqual(true);
    });

    it('finds a letter that is in a text node with a letter before', function() {
      var elem = createParagraphWithTextNodes('a', 'xb', 'c');
      highlight(elem, /b/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(1);
      expect(portions[0].text).toEqual('b');
      expect(portions[0].offset).toEqual(1);
      expect(portions[0].length).toEqual(1);
      expect(portions[0].lastPortion).toEqual(true);
    });

    it('finds a letter that is in a text node with a letter after', function() {
      var elem = createParagraphWithTextNodes('a', 'bx', 'c');
      highlight(elem, /b/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(1);
      expect(portions[0].text).toEqual('b');
      expect(portions[0].offset).toEqual(0);
      expect(portions[0].length).toEqual(1);
      expect(portions[0].lastPortion).toEqual(true);
    });

    it('finds two letters that span over two text nodes', function() {
      var elem = createParagraphWithTextNodes('a', 'b', 'c');
      highlight(elem, /bc/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(2);
      expect(portions[0].text).toEqual('b');
      expect(portions[0].lastPortion).toEqual(false);

      expect(portions[1].text).toEqual('c');
      expect(portions[1].lastPortion).toEqual(true);
    });

    it('finds three letters that span over three text nodes', function() {
      var elem = createParagraphWithTextNodes('a', 'b', 'c');
      highlight(elem, /abc/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(3);
      expect(portions[0].text).toEqual('a');
      expect(portions[1].text).toEqual('b');
      expect(portions[2].text).toEqual('c');
    });

    it('finds a word that is partially contained in two text nodes', function() {
      var elem = createParagraphWithTextNodes('a', 'bxx', 'xxe');
      highlight(elem, /xxxx/g);
      var portions = this.wrapWord.firstCall.args[0];

      expect(portions.length).toEqual(2);
      expect(portions[0].text).toEqual('xx');
      expect(portions[0].offset).toEqual(1);
      expect(portions[0].length).toEqual(2);
      expect(portions[0].lastPortion).toEqual(false);

      expect(portions[1].text).toEqual('xx');
      expect(portions[1].offset).toEqual(0);
      expect(portions[1].length).toEqual(2);
      expect(portions[1].lastPortion).toEqual(true);
    });

  });

  describe('wrapWord', function() {

    it('wraps a word in a single text node', function() {
      var elem = $('<div>Some juice.</div>')[0];
      highlight(elem, /juice/g);
      expect(elem.outerHTML)
        .toEqual('<div>Some <span data-awesome="crazy">juice</span>.</div>')
    });

    it('wraps a word with a partial <em> element', function() {
      var elem = $('<div>Some jui<em>ce.</em></div>')[0];
      highlight(elem, /juice/g);
      expect(elem.outerHTML)
        .toEqual('<div>Some <span data-awesome="crazy">jui</span><em><span data-awesome="crazy">ce</span>.</em></div>')
    });

    it('wraps two words in the same text node', function() {
      var elem = $('<div>a or b</div>')[0];
      highlight(elem, /a|b/g);
      expect(elem.outerHTML)
        .toEqual('<div><span data-awesome="crazy">a</span> or <span data-awesome="crazy">b</span></div>')
    });

    it('wraps a word in a <em> element', function() {
      var elem = $('<div><em>word</em></div>')[0];
      highlight(elem, /word/g);
      expect(elem.outerHTML)
        .toEqual('<div><em><span data-awesome="crazy">word</span></em></div>')
    });

    it('can handle a non-match', function() {
      var elem = $('<div><em>word</em></div>')[0];
      highlight(elem, /xxx/g);
      expect(elem.outerHTML)
        .toEqual('<div><em>word</em></div>')
    });
  });

});

describe('TextContent', function() {
  var toBeginning = true;
  var toEnd = false;

  it('is defined', function() {
    expect(TextContent).toBeDefined();
  });

  describe('parseHost()', function() {

    it('parses one text node', function() {
      // <div>|ab</div>
      this.host = $('<div>ab</div>')[0];
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(toBeginning);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.length).toEqual(2);
      expect(this.textRange.textNodes.length).toEqual(1);
      expect(this.textRange.textNodes[0].start).toEqual(0);
      expect(this.textRange.textNodes[0].end).toEqual(2);
      expect(this.textRange.textNodes[0].node.nodeValue).toEqual('ab');
    });

    it('parses the cursor at the beginning of a text node', function() {
      // <div>|ab</div>
      this.host = $('<div>ab</div>')[0];
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(toBeginning);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.startIndex).toEqual(0);
      expect(this.textRange.endIndex).toEqual(0);
    });

    it('parses the cursor at the end of a text node', function() {
      // <div>ab|</div>
      this.host = $('<div>ab</div>')[0];
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(toEnd);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.startIndex).toEqual(2);
      expect(this.textRange.endIndex).toEqual(2);
    });

    it('parses the cursor in the middle of a text node', function() {
      // <div>a|b</div>
      this.host = $('<div>ab</div>')[0];
      var range = rangy.createRange();
      var textNode = this.host.firstChild;
      range.setStart(textNode, 1);
      range.setEnd(textNode, 1);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.startIndex).toEqual(1);
      expect(this.textRange.endIndex).toEqual(1);
    });


    it('parses a selection in a child node', function() {
      // <div>a<i>|b|</i>c</div>
      this.host = $('<div>a<i>b</i>c</div>')[0];
      var range = rangy.createRange();
      var iNode = this.host.childNodes[1];
      var innerTextNode = iNode.firstChild;
      range.setStart(iNode, 0);
      range.setEnd(iNode, 1);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.startIndex).toEqual(1);
      expect(this.textRange.endIndex).toEqual(2);
    });

    it('parses a selection in a nested child node', function() {
      // <div>a<i>b|<span>c</span>|d</i>e</div>
      this.host = $('<div>a<i>b<span>c</span>d</i>e</div>')[0];
      var range = rangy.createRange();
      var iNode = this.host.childNodes[1];
      var nestedSpan = iNode.childNodes[1];
      range.setStart(iNode, 1);
      range.setEnd(nestedSpan, 1);

      this.textRange = new TextContent(this.host, range);
      expect(this.textRange.startIndex).toEqual(2);
      expect(this.textRange.endIndex).toEqual(3);
    });

    it('gets the text before, in and after', function() {
      // <div>a<i>b|<span>c</span>|d</i>e</div>
      this.host = $('<div>a<i>b<span>c</span>d</i>e</div>')[0];
      var range = rangy.createRange();
      var iNode = this.host.childNodes[1];
      var nestedSpan = iNode.childNodes[1];
      range.setStart(iNode, 1);
      range.setEnd(nestedSpan, 1);

      this.textRange = new TextContent(this.host, range);
      expect( this.textRange.fullText ).toEqual('abcde');
      expect( this.textRange.getTextBefore() ).toEqual('ab');
      expect( this.textRange.getInnerText() ).toEqual('c');
      expect( this.textRange.getTextAfter() ).toEqual('de');
    });

  });

});


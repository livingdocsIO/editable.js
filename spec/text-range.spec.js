describe('TextRange', function() {
  var toBeginning = true;
  var toEnd = false;

  it('is defined', function() {
    expect(TextRange).toBeDefined();
  });

  describe('with a cursor at the beginning of an element with text', function() {

    beforeEach(function() {
      // <div>|ab</div>
      this.host = $('<div>ab</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(toBeginning);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function() {

      it('expands range by one character', function(){
        this.textRange.expandRight();

        var range = this.textRange.range;
        expect(range.startOffset).toEqual(0);
        expect(range.endOffset).toEqual(1);
        expect(range.toString()).toEqual('a');
      });
    });

    describe('expandLeft()', function() {

      it('does not change the range', function() {
        var range = this.textRange.range;
        var previous = range.cloneRange();
        this.textRange.expandLeft();
        expect(previous.equals(range)).toBe(true);
      });
    });

    describe('nextCharacter()', function() {

      it('to be an "a"', function() {
        expect(this.textRange.nextCharacter()).toEqual('a');
      });
    });

    describe('previousCharacter()', function() {

      it('to be an empty string', function() {
        expect(this.textRange.previousCharacter()).toEqual('');
      });
    });
  });

  describe('with a cursor at the beginning of a text node', function() {

    beforeEach(function() {
      // <div>|ab</div>
      this.host = $('<div>ab</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host.firstChild);
      range.collapse(toBeginning);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function() {

      it('expands range by one character', function() {
        this.textRange.expandRight();

        var range = this.textRange.range;
        expect(range.startOffset).toEqual(0);
        expect(range.endOffset).toEqual(1);
        expect(range.toString()).toEqual('a');
      });
    });

    describe('expandLeft()', function() {

      it('does not change the range', function() {
        var range = this.textRange.range;
        this.textRange.expandLeft();
        expect(parser.isBeginningOfHost(
          this.host,
          range.endContainer,
          range.endOffset)
        ).toBe(true)
      });
    });
  });

  describe('with a cursor at the end of the host', function() {

    beforeEach(function() {
      // <div>a|</div>
      this.host = $('<div>a</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(toEnd);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function() {

      it('does not change the range', function() {
        var range = this.textRange.range;
        var previous = range.cloneRange();
        this.textRange.expandRight();
        expect(previous.equals(range)).toBe(true);
      });
    });

    describe('expandLeft()', function(){

      it('does not change the range', function() {
        var range = this.textRange.range;
        this.textRange.expandLeft();
        expect(range.toString()).toEqual('a');
      });
    });

    describe('nextCharacter()', function() {

      it('to be an empty string', function() {
        expect(this.textRange.nextCharacter()).toEqual('');
      });
    });

    describe('previousCharacter()', function() {

      it('to be an "a"', function() {
        expect(this.textRange.previousCharacter()).toEqual('a');
      });
    });
  });

  describe('with a cursor at the end of a textNode', function() {

    beforeEach(function() {
      // <div>ab|</div>
      this.host = $('<div>ab</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host.firstChild);
      range.collapse(toEnd);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function() {

      it('does not change the range', function() {
        var range = this.textRange.range;
        var previous = range.cloneRange();
        this.textRange.expandRight();
        expect(previous.equals(range)).toBe(true);
      });
    });

    describe('expandLeft()', function() {

      it('does not change the range', function() {
        var range = this.textRange.range;
        this.textRange.expandLeft();
        expect(range.toString()).toEqual('b');
      });
    });
  });

  describe('with a cursor at the end of an element', function() {

    beforeEach(function() {
      // <div><i>a|</i>bc</div>
      this.host = $('<div><i>a</i>bc</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents($(this.host).find('i')[0]);
      range.collapse(toEnd);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function() {

      it('finds the next textNode and expands to it', function() {
        var range = this.textRange.range;
        this.textRange.expandRight();
        expect(range.toString()).toEqual('b');
      });
    });

    describe('nextCharacter()', function() {

      it('to be a "b"', function() {
        expect(this.textRange.nextCharacter()).toEqual('b');
      });
    });

    describe('previousCharacter()', function() {

      it('to be an "a"', function() {
        expect(this.textRange.previousCharacter()).toEqual('a');
      });
    });
  });

  describe('with a cursor at the beginning of an element', function() {

    beforeEach(function() {
      // <div>ab<i>|c</i></div>
      this.host = $('<div>ab<i>c</i></div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents($(this.host).find('i')[0]);
      range.collapse(toBeginning);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandLeft()', function() {

      it('finds the next textNode and expands to it', function() {
        var range = this.textRange.range;
        this.textRange.expandLeft();
        expect(range.toString()).toEqual('b');
      });
    });
  });

});

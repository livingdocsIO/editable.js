describe('TextRange', function() {

  it('is defined', function() {
    expect(TextRange).toBeDefined();
  });

  describe('with a cursor at the beginning of some text', function() {

    beforeEach(function() {
      // <div>|ab</div>
      this.host = $('<div>ab</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(true);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function(){

      it('expands range by one character', function(){
        this.textRange.expandRight(1);

        var range = this.textRange.range;
        expect(range.startOffset).toEqual(0);
        expect(range.endOffset).toEqual(1);
        expect(range.toString()).toEqual('a');
      });
    })
  });

  describe('with a cursor at the end of the host', function() {

    beforeEach(function() {
      // <div>a|</div>
      this.host = $('<div>a</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents(this.host);
      range.collapse(false);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function(){

      it('does not change the range', function() {
        var range = this.textRange.range;
        var previous = range.cloneRange();
        this.textRange.expandRight(1);
        expect(previous.equals(range)).toBe(true);
      });
    });
  });

  describe('with a cursor at the end of an element', function() {

    beforeEach(function() {
      // <div><i>a|</i>bc</div>
      this.host = $('<div><i>a</i>bc</div>')[0]
      var range = rangy.createRange();
      range.selectNodeContents($(this.host).find('i')[0]);
      range.collapse(false);
      this.textRange = new TextRange(this.host, range);
    });

    describe('expandRight()', function(){

      it('finds the next textNode and expands to it', function() {
        var range = this.textRange.range;
        this.textRange.expandRight(1);
        expect(range.toString()).toEqual('b');
      });
    });
  });

});

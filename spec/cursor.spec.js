describe('Cursor', function() {

  it('is defined', function() {
    expect(Cursor).toBeDefined();
  });

  describe('with a range', function() {

    beforeEach(function() {
      this.oneWord = $('<div>foobar</div>')[0];
      this.range = rangy.createRange();
      this.range.selectNodeContents(this.oneWord);
      this.range.collapse(false);
      this.cursor = new Cursor(this.oneWord, this.range);
    });

    it('sets #isCursor to true', function(){
      expect(this.cursor.isCursor).toBe(true);
    });

    it('has a valid range', function() {
      expect(this.range.collapsed).toBe(true);
      expect(this.range.startContainer).toEqual(this.oneWord);
      expect(this.range.endContainer).toEqual(this.oneWord);
      expect(this.range.startOffset).toEqual(1);
      expect(this.range.endOffset).toEqual(1);
    });
  });

});

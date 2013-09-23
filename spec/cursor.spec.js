describe('Cursor', function() {

  it('is defined', function() {
    expect(Cursor).toBeDefined();
  });

  describe('with a collapsed range at the end', function() {

    beforeEach(function() {
      this.oneWord = $('<div class="'+ config.editableClass +'">foobar</div>')[0];
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

    describe('isAtEnd()', function() {
      it('is true', function() {
        expect(this.cursor.isAtEnd()).toBe(true);
      });
    });

    describe('isAtBeginning()', function() {
      it('is false', function() {
        expect(this.cursor.isAtBeginning()).toBe(false);
      });
    });

    describe('save() and restore()', function() {

      it('saves and restores the cursor', function() {
        this.cursor.save();

        // move the cursor so we can check the restore method.
        this.cursor.moveAtBeginning();
        expect(this.cursor.isAtBeginning()).toBe(true);

        this.cursor.restore();
        expect(this.cursor.isAtEnd()).toBe(true);
      });
    });
  });

});

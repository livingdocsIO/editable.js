describe('Cursor', function() {

  it('is defined', function() {
    expect(Cursor).toBeDefined();
  });


  describe('instantiation', function() {
    beforeEach(function() {
      var range = rangy.createRange();
      this.$elem = $('<div>');
      this.cursor = new Cursor(this.$elem, range);
    });

    it('creates an instance from a jQuery element', function() {
      expect(this.cursor.host).toEqual(this.$elem[0]);
    });

    it('sets a reference to window', function() {
      expect(this.cursor.win).toEqual(window);
    });
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

    describe('insertAfter()', function() {

      it('can deal with an empty documentFragment', function() {
        var test = function() {
          var frag = window.document.createDocumentFragment();
          this.cursor.insertAfter(frag);
        }
        expect($.proxy(test, this)).not.toThrow();
      });
    });

    describe('insertBefore()', function() {

      it('can deal with an empty documentFragment', function() {
        var test = function() {
          var frag = window.document.createDocumentFragment();
          this.cursor.insertBefore(frag);
        }
        expect($.proxy(test, this)).not.toThrow();
      });
    });

    describe('getPreviousCharacter()', function() {

      it('gets an "r"', function() {
        expect(this.cursor.getPreviousCharacter()).toEqual('r');
      });
    });

    describe('getNextCharacter()', function() {

      it('gets an empty string', function() {
        expect(this.cursor.getNextCharacter()).toEqual('');
      });
    });

    describe('deletePreviousCharacter()', function() {

      it('deletes the previous character', function() {
        expect($(this.oneWord).text()).toEqual('foobar');
        this.cursor.deletePreviousCharacter();
        expect(this.cursor.range.collapsed).toBe(true);
        expect(this.cursor.range.isValid()).toBe(true);
        expect($(this.oneWord).text()).toEqual('fooba');
      });
    });

    describe('deleteNextCharacter()', function() {

      it('does nothing', function() {
        this.cursor.deleteNextCharacter();
        expect($(this.oneWord).text()).toEqual('foobar');
      });
    });
  });

  describe('with a collapsed range at the beginning', function() {

    beforeEach(function() {
      this.oneWord = $('<div class="'+ config.editableClass +'">foobar</div>')[0];
      this.range = rangy.createRange();
      this.range.selectNodeContents(this.oneWord);
      this.range.collapse(true);
      this.cursor = new Cursor(this.oneWord, this.range);
    });

    describe('getPreviousCharacter()', function() {

      it('gets an empty string', function() {
        expect(this.cursor.getPreviousCharacter()).toEqual('');
      });
    });

    describe('getNextCharacter()', function() {

      it('gets an "f"', function() {
        expect(this.cursor.getNextCharacter()).toEqual('f');
      });
    });

    describe('deletePreviousCharacter()', function() {

      it('does nothing', function() {
        this.cursor.deletePreviousCharacter();
        expect($(this.oneWord).text()).toEqual('foobar');
      });
    });

    describe('deleteNextCharacter()', function() {

      it('deletes the next character', function() {
        expect($(this.oneWord).text()).toEqual('foobar');
        this.cursor.deleteNextCharacter();
        expect(this.cursor.range.collapsed).toBe(true);
        expect(this.cursor.range.isValid()).toBe(true);
        expect($(this.oneWord).text()).toEqual('oobar');
      });
    });
  });
});

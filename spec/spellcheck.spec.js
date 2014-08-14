describe('Spellcheck', function() {

  beforeEach(function() {
    this.editable = new Editable();
  });

  describe('new instance', function() {

    it('is created and has a reference to editable', function() {
      var spellcheck = new Spellcheck(this.editable);
      expect(spellcheck.editable).toEqual(this.editable);
    });
  });

  describe('checkSpelling', function() {
    beforeEach(function() {
      this.div = $('<p>A simple sentence.</p>')[0];
      this.spellcheck = new Spellcheck(this.editable, {
        spellcheckService: function(text, callback) {
          callback(['simple']);
        }
      });
    });

    it('calls highlight', function() {
      var highlight = sinon.spy(this.spellcheck, 'highlight');
      this.spellcheck.checkSpelling(this.div);
      expect(highlight.called).toEqual(true);
    });

    it('highlights a match', function() {
      this.spellcheck.checkSpelling(this.div);
      expect( $(this.div).find('.spellcheck').length ).toEqual(1);
    });

    it('match highlights are marked with "ui-unwrap"', function() {
      this.spellcheck.checkSpelling(this.div);
      var $spellcheck = $(this.div).find('.spellcheck').first();
      var dataEditable = $spellcheck.attr('data-editable');
      expect(dataEditable).toEqual('ui-unwrap');
    });

    it('does not call highlight for an empty wordlist', function() {
      var highlight = sinon.spy(this.spellcheck, 'highlight');
      this.spellcheck.config.spellcheckService = function(text, callback) {
        callback([]);
      };
      this.spellcheck.checkSpelling(this.div);
      expect(highlight.called).toEqual(false);
    });

    it('does not call highlight for an undefined wordlist', function() {
      var highlight = sinon.spy(this.spellcheck, 'highlight');
      this.spellcheck.config.spellcheckService = function(text, callback) {
        callback();
      };
      this.spellcheck.checkSpelling(this.div);
      expect(highlight.called).toEqual(false);
    });
  });
});

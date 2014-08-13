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
  });
});

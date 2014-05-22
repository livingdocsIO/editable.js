describe('Editable', function() {
  var editable, $div;

  afterEach(function() {
    if (editable) {
      editable.off();
      editable = undefined;
    }
  });


  describe('global variable', function(){

    it('is defined', function() {
      expect(window.Editable).toBeDefined();
    });

    it('creates a new Editable instance', function() {
      editable = new Editable();
      expect(editable.on).toBeDefined();
    });

    // Test no variables are leaking into global namespace
    it('does not define dispatcher globally', function() {
      expect(window.dispatcher).not.toBeDefined();
    });
  });


  describe('with an element added', function(){
    beforeEach(function(){
      $div = $('<div></div>')
      $div.appendTo(document.body);
      editable = new Editable();
      editable.add($div);
    });

    afterEach(function(){
      $div.remove();
    });

    describe('getContent()', function(){

      it('getContent() returns its content', function() {
        $div.html('a');
        var content = editable.getContent($div[0]);

        // escape to show invisible characters
        expect(escape(content)).toEqual('a')
      });
    });

    describe('focus event', function(){

      it('fires on focus', function(done) {
        editable.on('focus', done);
        $div.focus();
      });
    });

  });
});

 describe('Clipboard', function() {

  describe('filterContent()', function() {

    var extract = function(str) {
      var div = document.createElement('div');
      div.innerHTML = str;
      return clipboard.filterContent(div);
    };

    it('gets a plain text', function() {
      expect(extract('a')).toEqual('a');
    });

    it('trims text', function() {
      expect(extract(' a ')).toEqual('a');
    });

    it('keeps a <a> element with an href attribute', function() {
      expect(extract('<a href="http://link.com">a</a>')).toEqual('<a href="http://link.com">a</a>');
    });

    it('keeps a <strong> element', function() {
      expect(extract('<strong>a</strong>')).toEqual('<strong>a</strong>');
    });

    it('keeps an <em> element', function() {
      expect(extract('<em>a</em>')).toEqual('<em>a</em>');
    });


    // Remove Elements
    // ---------------

    it('removes a <span> element', function() {
      expect(extract('<span>a</span>')).toEqual('a');
    });

    it('removes an <a> element without an href attribute', function() {
      expect(extract('<a>a</a>')).toEqual('a');
    });

    it('removes an <a> element with an empty href attribute', function() {
      expect(extract('<a href="">a</a>')).toEqual('a');
    });

    it('removes an empty <strong> element', function() {
      expect(extract('<strong></strong>')).toEqual('');
    });

    it('removes a <strong> element with only whitespace', function() {
      expect(extract('<strong> </strong>')).toEqual('');
    });

    it('removes an attribute from an <em> element', function() {
      expect(extract('<em data-something="x">a</em>')).toEqual('<em>a</em>');
    });


    // Transform Elements
    // ------------------

    it('transforms a <b> into a <strong>', function() {
      expect(extract('<b>a</b>')).toEqual('<strong>a</strong>');
    });


    // Escape Content
    // --------------

    it('escapes the string "<b>a</b>"', function() {
      // append the string to test as text node so the browser escapes it.
      var div = document.createElement('div');
      div.appendChild( document.createTextNode('<b>a</b>') );

      expect(clipboard.filterContent(div)).toEqual('&lt;b&gt;a&lt;/b&gt;');
    });

  });
});

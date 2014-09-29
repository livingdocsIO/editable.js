 describe('Clipboard', function() {

  describe('filterContent()', function() {

    var extract = function(str) {
      var div = document.createElement('div');
      div.innerHTML = str;
      return clipboard.filterContent(div);
    };


    // Copy Elements
    // -------------

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

    it('keeps a <br> element', function() {
      expect(extract('a<br>b')).toEqual('a<br>b');
    });

    it('inserts double <br> after a paragraph', function() {
      expect(extract('<p>a</p><p>b</p>')).toEqual('a<br><br>b');
    });

    it('inserts double <br> after a <h1> followed by an <h2>', function() {
      expect(extract('<h1>a</h1><h2>b</h2>')).toEqual('a<br><br>b');
    });


    // Clean Whitespace
    // ----------------

    var checkWhitespace = function(a, b) {
      expect( escape(extract(a)) ).toEqual( escape(b) );
    };

    it('replaces a single &nbsp; character', function() {
      checkWhitespace('a&nbsp;b', 'a b');
    });

    it('replaces a series of &nbsp; with alternating whitespace and &nbsp;', function() {
      checkWhitespace('a&nbsp;&nbsp;&nbsp;&nbsp;b', 'a \u00A0 \u00A0b');
    });

    it('replaces a single &nbsp; character before a <span>', function() {
      checkWhitespace('a&nbsp;<span>b</span>', 'a b');
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

    it('removes an empty <strong> element but keeps its whitespace', function() {
      expect(extract('a<strong> </strong>b')).toEqual('a b');
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

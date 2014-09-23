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

    it('removes a <span> element', function() {
      expect(extract('<span>a</span>')).toEqual('a');
    });

    it('keeps a <a> element with an href attribute', function() {
      expect(extract('<a href="http://link.com">a</a>')).toEqual('<a href="http://link.com">a</a>');
    });
  });
});

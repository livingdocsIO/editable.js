describe('Content', function() {

  describe('normalizeTags()', function() {

    var plain = $('<div>Plain <strong>text</strong><strong>block</strong> example snippet</div>')[0];
    var plainWithSpace = $('<div>Plain <strong>text</strong> <strong>block</strong> example snippet</div>')[0];
    var nested = $('<div>Nested <strong><em>text</em></strong><strong><em>block</em></strong> example snippet</div>')[0];
    var nestedMixed = $('<div>Nested <strong>and mixed <em>text</em></strong><strong><em>block</em> <em>examples</em></strong> snippet</div>')[0];
    var consecutiveNewLines = $('<div>Consecutive<br><br>new lines</div>')[0];
    var emptyTags = $('<div>Example with <strong>empty <em></em>nested</strong><br>tags</div>')[0];

    it('works with plain block', function() {
      var expected = $('<div>Plain <strong>textblock</strong> example snippet</div>')[0];
      var actual = plain.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('does not merge tags if not consecutives', function() {
      var expected = plainWithSpace.cloneNode(true);
      var actual = plainWithSpace.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('works with nested blocks', function() {
      var expected = $('<div>Nested <strong><em>textblock</em></strong> example snippet</div>')[0];
      var actual = nested.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('works with nested blocks that mix other tags', function() {
      var expected = $('<div>Nested <strong>and mixed <em>textblock</em> <em>examples</em></strong> snippet</div>')[0];
      var actual = nestedMixed.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('does not merge consecutive new lines', function() {
      var expected = consecutiveNewLines.cloneNode(true);
      var actual = consecutiveNewLines.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('should remove empty tags and preserve new lines', function() {
      var expected = $('<div>Example with <strong>empty nested</strong><br>tags</div>')[0];
      var actual = emptyTags.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });
  });


  describe('getInnerTags()', function() {

    var range;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('works with partially selected <strong><em>', function() {
      // <div>|a <strong><em>b|</em></strong> c</div>
      var test = $('<div>a <strong><em>b</em></strong> c</div>');
      range.setStart(test[0], 0);
      range.setEnd(test.find('em')[0], 1);
      var tags = content.getInnerTags(range);
      expect(content.getTagNames(tags)).toEqual(['STRONG', 'EM']);
    });

    it('gets nothing inside a <b>', function() {
      // <div><b>|a|</b></div>
      var test = $('<div><b>a</b></div>');
      range.setStart(test.find('b')[0], 0);
      range.setEnd(test.find('b')[0], 1);
      var tags = content.getInnerTags(range);
      expect(content.getTagNames(tags)).toEqual([]);
    });

    it('gets a fully surrounded <b>', function() {
      // <div>|<b>a</b>|</div>
      var test = $('<div><b>a</b></div>');
      range.setStart(test[0], 0);
      range.setEnd(test[0], 1);
      var tags = content.getInnerTags(range);
      expect(content.getTagNames(tags)).toEqual(['B']);
    });

    it('gets partially selected <b> and <i>', function() {
      // <div><b>a|b</b><i>c|d</i></div>
      var test = $('<div><b>ab</b><i>cd</i></div>');
      var range = rangy.createRange();
      range.setStart(test.find('b')[0].firstChild, 1);
      range.setEnd(test.find('i')[0].firstChild, 1);
      var tags = content.getInnerTags(range);
      expect(content.getTagNames(tags)).toEqual(['B', 'I']);
    });
  });


  describe('getTags()', function() {

    var range;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('inside <b>', function() {
      // <div><b>|a|</b></div>
      var test = $('<div><b>a</b></div>');
      range.setStart(test.find('b')[0], 0);
      range.setEnd(test.find('b')[0], 1);
      var tags = content.getTags(test[0], range);
      expect(content.getTagNames(tags)).toEqual(['B']);
    });

    it('insde <em><b>', function() {
      // <div><i><b>|a|</b></i></div>
      var test = $('<div><i><b>a</b></i></div>');
      range.setStart(test.find('b')[0], 0);
      range.setEnd(test.find('b')[0], 1);
      var tags = content.getTags(test[0], range);
      expect(content.getTagNames(tags)).toEqual(['B', 'I']);
    });
  });


  describe('wrap()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('creates an <em>', function() {
      // <div>|b|</div>
      host = $('<div>b</div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 1);

      content.wrap(range, '<em>')
      expect(host.html()).toEqual('<em>b</em>');
    });
  });


  describe('isAffectedBy()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('detects a <b> tag', function() {
      // <div><b>|a|</b></div>
      host = $('<div><b>a</b></div>');
      range.setStart(host.find('b')[0], 0);
      range.setEnd(host.find('b')[0], 1);

      expect(content.isAffectedBy(host[0], range, 'b')).toEqual(true);
      expect(content.isAffectedBy(host[0], range, 'strong')).toEqual(false);
    });
  });

  describe('containsString()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('finds a character in the range', function() {
      // <div>|ab|c</div>
      host = $('<div>abc</div>');
      range.setStart(host[0].firstChild, 0);
      range.setEnd(host[0].firstChild, 2);

      expect(content.containsString(range, 'a')).toEqual(true);
      expect(content.containsString(range, 'b')).toEqual(true);
      expect(content.containsString(range, 'c')).toEqual(false);
    });
  });

  describe('deleteCharacter()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('removes a character in the range and preserves the range', function() {
      // <div>|ab|c</div>
      host = $('<div>abc</div>');
      range.setStart(host[0].firstChild, 0);
      range.setEnd(host[0].firstChild, 2);

      range = content.deleteCharacter(host[0], range, 'a');
      expect(host.html()).toEqual('bc');

      // show resulting text nodes
      expect(host[0].childNodes.length).toEqual(1);
      expect(host[0].childNodes[0].nodeValue).toEqual('bc');

      // check range. It should look like this:
      // <div>|b|c</div>
      expect(range.startContainer).toEqual(host[0]);
      expect(range.startOffset).toEqual(0);
      expect(range.endContainer).toEqual(host[0].firstChild);
      expect(range.endOffset).toEqual(1);
      expect(range.toString()).toEqual('b');
    });

    it('works with a partially selected tag', function() {
      // <div>|a<em>b|b</em></div>
      host = $('<div>a<em>bb</em></div>');
      range.setStart(host[0].firstChild, 0);
      range.setEnd(host.find('em')[0].firstChild, 1);

      range = content.deleteCharacter(host[0], range, 'b');
      expect(host.html()).toEqual('a<em>b</em>');

      // show resulting nodes
      expect(host[0].childNodes.length).toEqual(2);
      expect(host[0].childNodes[0].nodeValue).toEqual('a');
      expect(host[0].childNodes[1].tagName).toEqual('EM');
    });
  });


  describe('toggleTag()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('toggles a <b> tag', function() {
      // <div><b>|a|</b></div>
      host = $('<div><b>a</b></div>');
      range.setStart(host.find('b')[0], 0);
      range.setEnd(host.find('b')[0], 1);

      range = content.toggleTag(host[0], range, $('<b>')[0])
      expect(host.html()).toEqual('a');

      content.toggleTag(host[0], range, $('<b>')[0])
      expect(host.html()).toEqual('<b>a</b>');
    });
  });


  describe('nuke()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('removes surrounding <b>', function() {
      // <div><b>|a|</b></div>
      host = $('<div><b>a</b></div>');
      range.setStart(host.find('b')[0], 0);
      range.setEnd(host.find('b')[0], 1);
      content.nuke(host[0], range);
      expect(host.html()).toEqual('a');
    });

    it('removes tons of tags', function() {
      // <div><b>|a<i>b</i><em>c|d</em></b></div>
      host = $('<div><b>a<i>b</i><em>cd</em></b></div>');
      range.setStart(host.find('b')[0], 0);
      range.setEnd(host.find('em')[0].firstChild, 1);
      content.nuke(host[0], range);
      expect(host.html()).toEqual('abcd');
    });

    it('leaves <br> alone', function() {
      // <div>|a<br>b|</div>
      host = $('<div>a<br>b</div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 3);
      content.nuke(host[0], range);
      expect(host.html()).toEqual('a<br>b');
    });

    it('leaves saved range markers intact', function() {
      // <div><b>|a|</b></div>
      host = $('<div><b>a</b></div>');
      range.setStart(host.find('b')[0], 0);
      range.setEnd(host.find('b')[0], 1);
      rangeSaveRestore.save(range);
      content.nuke(host[0], range);
      expect(host.find('span').length).toEqual(2);
      expect(host.find('b').length).toEqual(0);
    });
  });


  describe('forceWrap()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('adds a link with an href attribute', function() {
      // <div>|b|</div>
      host = $('<div>b</div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 1);

      var $link = $('<a>');
      $link.attr('href', 'www.link.io');

      content.forceWrap(host[0], range, $link[0]);
      expect(host.html()).toEqual('<a href="www.link.io">b</a>');
    });

    it('does not nest tags', function() {
      // <div>|<em>b</em>|</div>
      host = $('<div><em>b</em></div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 1);

      var $em = $('<em>');
      content.forceWrap(host[0], range, $em[0]);
      expect(host.html()).toEqual('<em>b</em>');
    });

    it('removes partially selected tags', function() {
      // <div><em>b|c|</em></div>
      host = $('<div><em>bc</em></div>');
      range.setStart(host.find('em')[0].firstChild, 1);
      range.setEnd(host.find('em')[0].firstChild, 2);

      var $em = $('<em>');
      content.forceWrap(host[0], range, $em[0]);
      expect(host.html()).toEqual('b<em>c</em>');
    });
  });

  describe('surround()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('wraps text in double angle quotes', function() {
      // <div><i>|b|</i></div>
      host = $('<div><i>a</i></div>');
      range.setStart(host.find('i')[0], 0);
      range.setEnd(host.find('i')[0], 1);
      content.surround(host[0], range, '«', '»');
      expect(host.html()).toEqual('<i>«a»</i>');
    });

    it('wraps text in double angle quotes', function() {
      // <div><i>|b|</i></div>
      host = $('<div><i>a</i></div>');
      range.setStart(host.find('i')[0], 0);
      range.setEnd(host.find('i')[0], 1);
      content.surround(host[0], range, '«', '»');

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.find('i')[0].childNodes[0].nodeValue).toEqual('«');
      expect(host.find('i')[0].childNodes[1].nodeValue).toEqual('a');
      expect(host.find('i')[0].childNodes[2].nodeValue).toEqual('»');

      expect(range.startContainer).toEqual(host.find('i')[0]);
      expect(range.startOffset).toEqual(0);
      expect(range.endContainer).toEqual(host.find('i')[0]);
      expect(range.endOffset).toEqual(3);
    });

    it('wraps text in double angle quotes', function() {
      // <div><i>a|b|</i></div>
      host = $('<div><i>ab</i></div>');
      range.setStart(host.find('i')[0].firstChild, 1);
      range.setEnd(host.find('i')[0].firstChild, 2);
      content.surround(host[0], range, '«', '»');
      expect(host.html()).toEqual('<i>a«b»</i>');

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.find('i')[0].childNodes[0].nodeValue).toEqual('a«');
      expect(host.find('i')[0].childNodes[1].nodeValue).toEqual('b');
      expect(host.find('i')[0].childNodes[2].nodeValue).toEqual('»');
      expect(range.startContainer).toEqual(host.find('i')[0].firstChild);
      expect(range.startOffset).toEqual(1);
      expect(range.endContainer).toEqual(host.find('i')[0]);
      expect(range.endOffset).toEqual(3);
    });
  });
});

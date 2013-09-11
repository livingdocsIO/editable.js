describe('Content', function() {

  describe('normalizeTags()', function() {

    var plain = $('<div>Plain <strong>text</strong><strong>block</strong> example snippet</div>')[0];
    var plainWithSpace = $('<div>Plain <strong>text</strong> <strong>block</strong> example snippet</div>')[0];
    var nested = $('<div>Nested <strong><em>text</em></strong><strong><em>block</em></strong> example snippet</div>')[0];
    var nestedMixed = $('<div>Nested <strong>and mixed <em>text</em></strong><strong><em>block</em> <em>examples</em></strong> snippet</div>')[0];
    var consecutiveNewLines = $('<div>Consecutive<br><br>new lines</div>')[0];

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
    })
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


  describe('link()', function() {

    var range, host;
    beforeEach(function() {
      range = rangy.createRange();
    });

    it('adds a link with href', function() {
      // <div>|b|</div>
      host = $('<div>b</div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 1);
      var attrs = {
        href: 'www.link.io',
      };
      content.link(host[0], range, attrs);
      expect(host.html()).toEqual('<a href="www.link.io">b</a>');
    });

    it('does not nest links', function() {
      // <div>|<a>b</a>|</div>
      host = $('<div><a>b</a></div>');
      range.setStart(host[0], 0);
      range.setEnd(host[0], 1);
      var attrs = {
        href: 'www.link.io',
      };
      content.link(host[0], range, attrs);
      expect(host.html()).toEqual('<a href="www.link.io">b</a>');
    });

    it('removes partially selected links', function() {
      // <div><a>b|c|</a></div>
      host = $('<div><a>bc</a></div>');
      range.setStart(host.find('a')[0].firstChild, 1);
      range.setEnd(host.find('a')[0].firstChild, 2);
      var attrs = {
        href: 'www.link.io',
      };
      content.link(host[0], range, attrs);
      expect(host.html()).toEqual('b<a href="www.link.io">c</a>');
    });
  });
});

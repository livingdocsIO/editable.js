describe('Content', function() {

  describe('normalizeTags', function() {

    var plain = $('<div>Plain <strong>text</strong><strong>block</strong> example snippet</div>')[0];
    var plainWithSpace = $('<div>Plain <strong>text</strong> <strong>block</strong> example snippet</div>')[0];
    var nested = $('<div>Nested <strong><em>text</em></strong><strong><em>block</em></strong> example snippet</div>')[0];
    var nestedMixed = $('<div>Nested <strong>and mixed <em>text</em></strong><strong><em>block</em> <em>examples</em></strong> snippet</div>')[0];
    var consecutiveNewLines = $('<div>Consecutive<br><br>new lines</div>')[0];

    it('should work with plain block', function() {
      var expected = $('<div>Plain <strong>textblock</strong> example snippet</div>')[0];
      var actual = plain.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('should not merge tags if not consecutives', function() {
      var expected = plainWithSpace.cloneNode(true);
      var actual = plainWithSpace.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('should work with nested blocks', function() {
      var expected = $('<div>Nested <strong><em>textblock</em></strong> example snippet</div>')[0];
      var actual = nested.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('should work with nested blocks that mix other tags', function() {
      var expected = $('<div>Nested <strong>and mixed <em>textblock</em> <em>examples</em></strong> snippet</div>')[0];
      var actual = nestedMixed.cloneNode(true);
      content.normalizeTags(actual);
      expect(actual.innerHTML).toEqual(expected.innerHTML);
    });

    it('should not merge consecutive new lines', function() {
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

    it('works', function() {
      // <div>|a <strong><em>b|</em></strong> c</div>
      var test = $('<div>a <strong><em>b</em></strong> c</div>');
      range.setStart(test[0], 0);
      range.setEnd(test.find('em')[0], 1);
      expect( content.getInnerTags(range) ).toEqual(['STRONG', 'EM']);
    });

    it('works', function() {
      // <div><b>|a|</b></div>
      var test = $('<div><b>a</b></div>');
      range.setStart(test.find('b')[0], 0);
      range.setEnd(test.find('b')[0], 1);
      expect( content.getInnerTags(range) ).toEqual([]);
    });

    it('works', function() {
      // <div>|<b>a</b>|</div>
      var test = $('<div><b>a</b></div>');
      range.setStart(test[0], 0);
      range.setEnd(test[0], 1);
      expect( content.getInnerTags(range) ).toEqual(['B']);
    });

    it('works', function() {
      // <div><b>a|b</b><i>c|d</i></div>
      var test = $('<div><b>ab</b><i>cd</i></div>');
      var range = rangy.createRange();
      range.setStart(test.find('b')[0].firstChild, 1);
      range.setEnd(test.find('i')[0].firstChild, 1);
      expect( content.getInnerTags(range) ).toEqual(['B', 'I']);
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
      expect( content.getTags(test[0], range) ).toEqual(['B']);
    });

    it('insde <em><b>', function() {
      // <div><i><b>|a|</b></i></div>
      var test = $('<div><i><b>a</b></i></div>');
      range.setStart(test.find('b')[0], 0);
      range.setEnd(test.find('b')[0], 1);
      expect( content.getTags(test[0], range) ).toEqual(['B', 'I']);
    });
  });
});

describe('Test content', function() {
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
});

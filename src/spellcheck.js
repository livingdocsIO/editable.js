var Spellcheck = (function() {

  // Unicode character blocks for letters.
  // See: http://jrgraphix.net/research/unicode_blocks.php
  //
  // \\u0041-\\u005A    A-Z (Basic Latin)
  // \\u0061-\\u007A    a-z (Basic Latin)
  // \\u0030-\\u0039    0-9 (Basic Latin)
  // \\u00AA            ª   (Latin-1 Supplement)
  // \\u00B5            µ   (Latin-1 Supplement)
  // \\u00BA            º   (Latin-1 Supplement)
  // \\u00C0-\\u00D6    À-Ö (Latin-1 Supplement)
  // \\u00D8-\\u00F6    Ø-ö (Latin-1 Supplement)
  // \\u00F8-\\u00FF    ø-ÿ (Latin-1 Supplement)
  // \\u0100-\\u017F    Ā-ſ (Latin Extended-A)
  // \\u0180-\\u024F    ƀ-ɏ (Latin Extended-B)
  var letterChars = '\\u0041-\\u005A\\u0061-\\u007A\\u0030-\\u0039\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF\\u0100-\\u017F\\u0180-\\u024F';

  var escapeRegEx = function(s) {
    return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  };

  /**
   * Spellcheck class.
   *
   * @class Spellcheck
   * @constructor
   */
  var Spellcheck = function(editable) {
    this.editable = editable;
    this.setup();
  };

  Spellcheck.prototype.setup = function(editable) {
    this.editable.on('focus', $.proxy(this, 'onFocus'));
    this.editable.on('change', $.proxy(this, 'onChange'));
  }

  Spellcheck.prototype.onFocus = function(editableHost) {
    this.checkSpelling(editableHost);
  };

  Spellcheck.prototype.onChange = function(editableHost) {
    // todo: get the editable instance here (transform spellchecker into a class)
    var selection = this.editable.getSelection();
    var that = this;
    if (selection.isCursor) {
      selection.retainVisibleSelection(function() {
        that.checkSpelling(editableHost);
      })
    }
  };

  Spellcheck.prototype.createWrapperNode = function() {
    var marker = document.createElement('span');
    marker.className = 'spellcheck';
    marker.setAttribute('data-editable', 'remove');
    return marker;
  };

  Spellcheck.prototype.removeHighlights = function(editableHost) {
    $(editableHost).find('.spellcheck').each(function(index, elem) {
      content.unwrap(elem);
    });
  };

  Spellcheck.prototype.createRegex = function(words) {
    var escapedWords = $.map(words, function(word) {
      return escapeRegEx(word);
    });

    var regex = '';
    regex += '([^' + letterChars + ']|^)';
    regex += '(' + escapedWords.join('|') + ')';
    regex += '(?=[^' + letterChars + ']|$)';

    return new RegExp(regex, 'g');
  };

  Spellcheck.prototype.highlight = function(editableHost, regex) {

    // Remove old highlights
    this.removeHighlights(editableHost);

    // Create new highlights
    var span = this.createWrapperNode();
    highlightText.highlight(editableHost, regex, span);
  };

  Spellcheck.prototype.checkSpelling = function(editableHost) {
    var regex = this.createRegex(['test', 'xxx', 'Lorem', 'dolor', 'ante', 'nunc.']);
    this.highlight(editableHost, regex);
  }

  return Spellcheck;
})();


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
  var Spellcheck = function(editable, configuration) {
    var defaultConfig = {
      checkOnFocus: false, // check on focus and blur
      checkOnChange: true, // check after changes
      throttle: 1000, // todo: only apply this for changes: unbounce rate in ms before calling the spellcheck service
      removeOnCorrection: true, // remove highlights after a change if the cursor is inside a highlight
      markerNode: $('<span class="spellcheck"></span>')[0],
      spellcheckService: undefined
    };

    this.config = $.extend(defaultConfig, configuration);
    this.prepareMarkerNode();
    this.editable = editable;
    this.setup();
  };

  Spellcheck.prototype.setup = function(editable) {
    if (this.config.checkOnFocus) {
      this.editable.on('focus', $.proxy(this, 'onFocus'));
      this.editable.on('blur', $.proxy(this, 'onBlur'));
    }
    if (this.config.checkOnChange || this.config.removeOnCorrection) {
      this.editable.on('change', $.proxy(this, 'onChange'));
    }
  };

  Spellcheck.prototype.onFocus = function(editableHost) {
    if (this.focusedEditable !== editableHost) {
      this.focusedEditable = editableHost;
      this.editableHasChanged(editableHost);
    }
  };

  Spellcheck.prototype.onBlur = function(editableHost) {
    if (this.focusedEditable === editableHost) {
      this.focusedEditable = undefined;
    }
  };

  Spellcheck.prototype.onChange = function(editableHost) {
    if (this.config.checkOnChange) {
      this.editableHasChanged(editableHost);
    }
    if (this.config.removeOnCorrection) {
      this.removeHighlightsAtCursor(editableHost);
    }
  };

  Spellcheck.prototype.prepareMarkerNode = function() {
    var marker = this.config.markerNode;
    if (marker.jquery) {
      this.config.markerNode = marker = marker[0];
    }
    marker.setAttribute('data-editable', 'ui-unwrap');
    marker.setAttribute('data-spellcheck', 'spellcheck');
  };

  Spellcheck.prototype.createMarkerNode = function() {
    return this.config.markerNode.cloneNode();
  };

  Spellcheck.prototype.removeHighlights = function(editableHost) {
    $(editableHost).find('[data-spellcheck=spellcheck]').each(function(index, elem) {
      content.unwrap(elem);
    });
  };

  Spellcheck.prototype.removeHighlightsAtCursor = function(editableHost) {
    var wordId;
    var selection = this.editable.getSelection(editableHost);
    if (selection && selection.isCursor) {
      var elementAtCursor = selection.range.startContainer;
      if (elementAtCursor.nodeType === nodeType.textNode) {
        elementAtCursor = elementAtCursor.parentNode;
        if (elementAtCursor === editableHost) return;
      }

      do {
        if (elementAtCursor === editableHost) return;
        if ( elementAtCursor.hasAttribute('data-word-id') ) {
          wordId = elementAtCursor.getAttribute('data-word-id');
          break;
        }
      } while ( (elementAtCursor = elementAtCursor.parentNode) );

      if (wordId) {
        selection.retainVisibleSelection(function() {
          $(editableHost).find('[data-word-id='+ wordId +']').each(function(index, elem) {
            content.unwrap(elem);
          });
        });
      }
    }
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

  Spellcheck.prototype.highlight = function(editableHost, misspelledWords) {

    // Remove old highlights
    this.removeHighlights(editableHost);

    // Create new highlights
    if (misspelledWords && misspelledWords.length > 0) {
      var regex = this.createRegex(misspelledWords);
      var span = this.createMarkerNode();
      highlightText.highlight(editableHost, regex, span);
    }
  };

  Spellcheck.prototype.editableHasChanged = function(editableHost) {
    if (this.timeoutId && this.currentEditableHost === editableHost) {
      clearTimeout(this.timeoutId);
    }

    var that = this;
    this.timeoutId = setTimeout(function() {
      that.checkSpelling(editableHost);
      that.currentEditableHost = undefined;
      that.timeoutId = undefined;
    }, this.config.throttle);

    this.currentEditableHost = editableHost;
  };

  Spellcheck.prototype.checkSpelling = function(editableHost) {
    var that = this;
    var text = highlightText.extractText(editableHost);
    text = content.normalizeWhitespace(text);

    this.config.spellcheckService(text, function(misspelledWords) {
      var selection = that.editable.getSelection(editableHost);
      if (selection) {
        selection.retainVisibleSelection(function() {
          that.highlight(editableHost, misspelledWords);
        });
      } else {
        that.highlight(editableHost, misspelledWords);
      }
    });
  };

  return Spellcheck;
})();


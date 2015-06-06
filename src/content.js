var nodeType = require('./node-type');
var rangeSaveRestore = require('./range-save-restore');
var parser = require('./parser');
var string = require('./util/string');

var content;
module.exports = content = (function() {

  var restoreRange = function(host, range, func) {
    range = rangeSaveRestore.save(range);
    func.call(content);
    return rangeSaveRestore.restore(host, range);
  };

  var zeroWidthSpace = /\u200B/g;
  var zeroWidthNonBreakingSpace = /\uFEFF/g;
  var whitespaceExceptSpace = /[^\S ]/g;

  return {

    /**
     * Clean up the Html.
     */
    tidyHtml: function(element) {
      // if (element.normalize) element.normalize();
      this.normalizeTags(element);
    },


    /**
     * Remove empty tags and merge consecutive tags (they must have the same
     * attributes).
     *
     * @method normalizeTags
     * @param  {HTMLElement} element The element to process.
     */
    normalizeTags: function(element) {
      var i, j, node, sibling;

      var fragment = document.createDocumentFragment();

      for (i = 0; i < element.childNodes.length; i++) {
        node = element.childNodes[i];
        if (!node) continue;

        // skip empty tags, so they'll get removed
        if (node.nodeName !== 'BR' && !node.textContent) continue;

        if (node.nodeType === nodeType.elementNode && node.nodeName !== 'BR') {
          sibling = node;
          while ((sibling = sibling.nextSibling) !== null) {
            if (!parser.isSameNode(sibling, node))
              break;

            for (j = 0; j < sibling.childNodes.length; j++) {
              node.appendChild(sibling.childNodes[j].cloneNode(true));
            }

            sibling.parentNode.removeChild(sibling);
          }

          this.normalizeTags(node);
        }

        fragment.appendChild(node.cloneNode(true));
      }

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(fragment);
    },

    normalizeWhitespace: function(text) {
      return text.replace(whitespaceExceptSpace, ' ');
    },

    /**
     * Clean the element from character, tags, etc... added by the plugin logic.
     *
     * @method cleanInternals
     * @param  {HTMLElement} element The element to process.
     */
    cleanInternals: function(element) {
      // Uses extract content for simplicity. A custom method
      // that does not clone the element could be faster if needed.
      element.innerHTML = this.extractContent(element, true);
    },

    /**
     * Extracts the content from a host element.
     * Does not touch or change the host. Just returns
     * the content and removes elements marked for removal by editable.
     *
     * @param {DOM node or document framgent} Element where to clean out the innerHTML. If you pass a document fragment it will be empty after this call.
     * @param {Boolean} Flag whether to keep ui elements like spellchecking highlights.
     * @returns {String} The cleaned innerHTML of the passed element or document fragment.
     */
    extractContent: function(element, keepUiElements) {
      var innerHtml;
      if (element.nodeType === nodeType.documentFragmentNode) {
        innerHtml = this.getInnerHtmlOfFragment(element);
      } else {
        innerHtml = element.innerHTML;
      }

      innerHtml = innerHtml.replace(zeroWidthNonBreakingSpace, ''); // Used for forcing inline elments to have a height
      innerHtml = innerHtml.replace(zeroWidthSpace, '<br>'); // Used for cross-browser newlines

      var clone = document.createElement('div');
      clone.innerHTML = innerHtml;
      this.unwrapInternalNodes(clone, keepUiElements);

      return clone.innerHTML;
    },

    getInnerHtmlOfFragment: function(documentFragment) {
      var div = document.createElement('div');
      div.appendChild(documentFragment);
      return div.innerHTML;
    },

    /**
     * Create a document fragment from an html string
     * @param {String} e.g. 'some html <span>text</span>.'
     */
    createFragmentFromString: function(htmlString) {
      var fragment = document.createDocumentFragment();
      var contents = $('<div>').html(htmlString).contents();
      for (var i = 0; i < contents.length; i++) {
        var el = contents[i];
        fragment.appendChild(el);
      }
      return fragment;
    },

    adoptElement: function(node, doc) {
      if (node.ownerDocument !== doc) {
        return doc.adoptNode(node);
      } else {
        return node;
      }
    },

    /**
     * This is a slight variation of the cloneContents method of a rangyRange.
     * It will return a fragment with the cloned contents of the range
     * without the commonAncestorElement.
     *
     * @param {rangyRange}
     * @return {DocumentFragment}
     */
    cloneRangeContents: function(range) {
      var rangeFragment = range.cloneContents();
      var parent = rangeFragment.childNodes[0];
      var fragment = document.createDocumentFragment();
      while (parent.childNodes.length) {
        fragment.appendChild(parent.childNodes[0]);
      }
      return fragment;
    },

    /**
     * Remove elements that were inserted for internal or user interface purposes
     *
     * @param {DOM node}
     * @param {Boolean} whether to keep ui elements like spellchecking highlights
     * Currently:
     * - Saved ranges
     */
    unwrapInternalNodes: function(sibling, keepUiElements) {
      while (sibling) {
        var nextSibling = sibling.nextSibling;

        if (sibling.nodeType === nodeType.elementNode) {
          var attr = sibling.getAttribute('data-editable');

          if (sibling.firstChild) {
            this.unwrapInternalNodes(sibling.firstChild, keepUiElements);
          }

          if (attr === 'remove') {
            $(sibling).remove();
          } else if (attr === 'unwrap') {
            this.unwrap(sibling);
          } else if (attr === 'ui-remove' && !keepUiElements) {
            $(sibling).remove();
          } else if (attr === 'ui-unwrap' && !keepUiElements) {
            this.unwrap(sibling);
          }
        }
        sibling = nextSibling;
      }
    },

    /**
     * Get all tags that start or end inside the range
     */
    getTags: function(host, range, filterFunc) {
      var tags = this.getInnerTags(range, filterFunc);

      // get all tags that surround the range
      var node = range.commonAncestorContainer;
      while (node !== host) {
        if (!filterFunc || filterFunc(node)) {
          tags.push(node);
        }
        node = node.parentNode;
      }
      return tags;
    },

    getTagsByName: function(host, range, tagName) {
      return this.getTags(host, range, function(node) {
        return node.nodeName === tagName.toUpperCase();
      });
    },

    /**
     * Get all tags that start or end inside the range
     */
    getInnerTags: function(range, filterFunc) {
      return range.getNodes([nodeType.elementNode], filterFunc);
    },

    /**
     * Transform an array of elements into a an array
     * of tagnames in uppercase
     *
     * @return example: ['STRONG', 'B']
     */
    getTagNames: function(elements) {
      var names = [];
      if (!elements) return names;

      for (var i = 0; i < elements.length; i++) {
        names.push(elements[i].nodeName);
      }
      return names;
    },

    isAffectedBy: function(host, range, tagName) {
      var elem;
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        elem = tags[i];
        if (elem.nodeName === tagName.toUpperCase()) {
          return true;
        }
      }

      return false;
    },

    /**
     * Check if the range selects all of the elements contents,
     * not less or more.
     *
     * @param visible: Only compare visible text. That way it does not
     *   matter if the user selects an additional whitespace or not.
     */
    isExactSelection: function(range, elem, visible) {
      var elemRange = rangy.createRange();
      elemRange.selectNodeContents(elem);
      if (range.intersectsRange(elemRange)) {
        var rangeText = range.toString();
        var elemText = $(elem).text();

        if (visible) {
          rangeText = string.trim(rangeText);
          elemText = string.trim(elemText);
        }

        return rangeText !== '' && rangeText === elemText;
      } else {
        return false;
      }
    },

    expandTo: function(host, range, elem) {
      range.selectNodeContents(elem);
      return range;
    },

    toggleTag: function(host, range, elem) {
      var elems = this.getTagsByName(host, range, elem.nodeName);

      if (elems.length === 1 &&
          this.isExactSelection(range, elems[0], 'visible')) {
        return this.removeFormatting(host, range, elem.nodeName);
      }

      return this.forceWrap(host, range, elem);
    },

    isWrappable: function(range) {
      return range.canSurroundContents();
    },

    forceWrap: function(host, range, elem) {
      range = restoreRange(host, range, function(){
        this.nuke(host, range, elem.nodeName);
      });

      // remove all tags if the range is not wrappable
      if (!this.isWrappable(range)) {
        range = restoreRange(host, range, function(){
          this.nuke(host, range);
        });
      }

      this.wrap(range, elem);
      return range;
    },

    wrap: function(range, elem) {
      elem = string.isString(elem) ?
        $(elem)[0] :
        elem;

      if (this.isWrappable(range)) {
        var a = range.surroundContents(elem);
      } else {
        console.log('content.wrap(): can not surround range');
      }
    },

    unwrap: function(elem) {
      var $elem = $(elem);
      var contents = $elem.contents();
      if (contents.length) {
        contents.unwrap();
      } else {
        $elem.remove();
      }
    },

    removeFormatting: function(host, range, tagName) {
      return restoreRange(host, range, function(){
        this.nuke(host, range, tagName);
      });
    },

    /**
     * Unwrap all tags this range is affected by.
     * Can also affect content outside of the range.
     */
    nuke: function(host, range, tagName) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        if ( elem.nodeName !== 'BR' && (!tagName || elem.nodeName === tagName.toUpperCase()) ) {
          this.unwrap(elem);
        }
      }
    },

    /**
     * Insert a single character (or string) before or after the
     * the range.
     */
    insertCharacter: function(range, character, atStart) {
      var insertEl = document.createTextNode(character);

      var boundaryRange = range.cloneRange();
      boundaryRange.collapse(atStart);
      boundaryRange.insertNode(insertEl);

      if (atStart) {
        range.setStartBefore(insertEl);
      } else {
        range.setEndAfter(insertEl);
      }
      range.normalizeBoundaries();
    },

    /**
     * Surround the range with characters like start and end quotes.
     *
     * @method surround
     */
    surround: function(host, range, startCharacter, endCharacter) {
      if (!endCharacter) endCharacter = startCharacter;
      this.insertCharacter(range, endCharacter, false);
      this.insertCharacter(range, startCharacter, true);
      return range;
    },

    /**
     * Removes a character from the text within a range.
     *
     * @method deleteCharacter
     */
    deleteCharacter: function(host, range, character) {
      if (this.containsString(range, character)) {
        range.splitBoundaries();
        range = restoreRange(host, range, function() {
          var charRegexp = string.regexp(character);

          var textNodes = range.getNodes([nodeType.textNode], function(node) {
            return node.nodeValue.search(charRegexp) >= 0;
          });

          for (var i = 0; i < textNodes.length; i++) {
            var node = textNodes[i];
            node.nodeValue = node.nodeValue.replace(charRegexp, '');
          }
        });
        range.normalizeBoundaries();
      }

      return range;
    },

    containsString: function(range, str) {
      var text = range.toString();
      return text.indexOf(str) >= 0;
    },

    /**
     * Unwrap all tags this range is affected by.
     * Can also affect content outside of the range.
     */
    nukeTag: function(host, range, tagName) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        if (elem.nodeName === tagName)
          this.unwrap(elem);
      }
    }
  };
})();

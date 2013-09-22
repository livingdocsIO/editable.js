var content = (function() {

  var restoreRange = function(host, range, func) {
    range = rangeSaveRestore.save(range);
    func.call(content);
    return rangeSaveRestore.restore(host, range);
  };

  return {
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
        if(!node) continue;

        // skip empty tags, so they'll get removed
        if(node.nodeName !== 'BR' && !node.textContent) continue;

        if(node.nodeType === 1 && node.nodeName !== 'BR') {
          sibling = node;
          while((sibling = sibling.nextSibling) !== null) {
            if(!parser.isSameNode(sibling, node))
              break;

            for(j = 0; j < sibling.childNodes.length; j++) {
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

    /**
     * Clean the element from character, tags, etc... added by the plugin logic.
     *
     * @method cleanInternals
     * @param  {HTMLElement} element The element to process.
     */
    cleanInternals: function(element) {
      element.innerHTML = element.innerHTML.replace(/\u200B/g, '<br />');
    },

    /**
     * Convert the first and last space to a non breaking space charcter to
     * prevent visual collapse by some browser.
     *
     * @method normalizeSpaces
     * @param  {HTMLElement} element The element to process.
     */
    normalizeSpaces: function(element) {
      var nonBreakingSpace = '\u00A0';

      if(!element) return;

      if(element.nodeType === 3) {
        element.nodeValue = element.nodeValue.replace(/^(\s)/, nonBreakingSpace).replace(/(\s)$/, nonBreakingSpace);
      }
      else {
        this.normalizeSpaces(element.firstChild);
        this.normalizeSpaces(element.lastChild);
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
      return range.getNodes([1], filterFunc);
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

    toggleTag: function(host, range, elem) {
      if (this.isAffectedBy(host, range, elem.nodeName)) {
        return this.removeFormatting(host, range, elem.nodeName);
      } else {
        return this.forceWrap(host, range, elem);
      }
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

      if(this.isWrappable(range)) {
        var a = range.surroundContents(elem);
      } else {
        console.log('content.wrap(): can not surround range');
      }
    },

    unwrap: function(elem) {
      $(elem).contents().unwrap();
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
        if ( !tagName || elem.nodeName === tagName.toUpperCase() ) {
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
      boundaryRange.detach();

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

          var textNodes = range.getNodes([3], function(node) {
            return node.nodeValue.search(charRegexp) >= 0;
          });

          for(var i = 0; i < textNodes.length; i++) {
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

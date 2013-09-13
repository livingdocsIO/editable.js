var content = (function() {

  var restoreRange = function(host, range, func) {
    range = rangeSaveRestore.save(range);
    func.call(content);
    return rangeSaveRestore.restore(host, range);
  };

  return {
    normalizeTags: function(element) {
      var i, j, node, sibling;

      var fragment = document.createDocumentFragment();

      for (i = 0; i < element.childNodes.length; i++) {
        node = element.childNodes[i];
        if(!node) continue;

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

    cleanInternals: function(element) {
      element.innerHTML = element.innerHTML.replace(/\u200B/g, '<br />');
    },

    normalizeSpaces: function(element) {
      var firstChild = element.firstChild;

      if(!firstChild) return;

      if(firstChild.nodeType === 3) {
        firstChild.nodeValue = firstChild.nodeValue.replace(/^(\s)/, '\u00A0');
      }
      else {
        this.normalizeSpaces(firstChild);
      }
    },

    removeEmptyTags: function(element) {
      var i, len, node;

      for (i = 0, len = element.childNodes.length; i < len; i++) {
        node = element.childNodes[i];
        if(node && node.nodeName !== 'BR' && !node.textContent) {
          node.parentNode.removeChild(node);
        }
      }
    },

    /**
     * Get all tags that start or end inside the range
     */
    getTags: function(host, range) {
      var tags = this.getInnerTags(range);

      // get all tags that surround the range
      var node = range.commonAncestorContainer;
      while (node !== host) {
        tags.push(node);
        node = node.parentNode;
      }
      return tags;
    },

    /**
     * Get all tags that start or end inside the range
     */
    getInnerTags: function(range) {
      var tags = [], node;

      var iterator = range.createNodeIterator();
      while( (node = iterator.next()) ) {
        if (node.nodeType === 1)
          tags.push(node);
      }
      return tags;
    },

    /**
     * Transform an array of elements into a an array
     * of tagnames in uppercase
     *
     * @return example: ['STRONG', 'B']
     */
    getTagNames: function(elements) {
      var names = [];
      for (var i=0; i < elements.length; i++) {
        names.push(elements[i].nodeName);
      }
      return names;
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

    isWrappable: function(range) {
      return range.canSurroundContents();
    },

    forceWrap: function(host, range, elem) {
      range = restoreRange(host, range, function(){
        this.nuke(host, range, elem.tagName);
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

    link: function(host, range, attrs) {
      var $elem = $('<a>');
      for (var name in attrs) {
        $elem.attr(name, attrs[name]);
      }
      return this.forceWrap(host, range, $elem[0]);
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
        if ( !tagName || elem.tagName === tagName.toUpperCase() ) {
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
     */
    surround: function(host, range, startCharacter, endCharacter) {
      if (!endCharacter) endCharacter = startCharacter;
      this.insertCharacter(range, endCharacter, false);
      this.insertCharacter(range, startCharacter, true);
    },

    /**
     * Unwrap all tags this range is affected by.
     * Can also affect content outside of the range.
     */
    nukeTag: function(host, range, tagName) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        if (elem.tagName === tagName)
          this.unwrap(elem);
      }
    }
  };
})();

var content = (function() {
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
     * Get all tags that start or end inside the selection
     */
    getTags: function(host, range) {
      var tags = this.getInnerTags(range);

      // get all tags that surround the selection
      var node = range.commonAncestorContainer;
      while (node !== host) {
        tags.push(node);
        node = node.parentNode;
      }
      return tags;
    },

    /**
     * Get all tags that start or end inside the selection
     */
    getInnerTags: function(range) {
      var tags = [], node;

      var iterator = range.createNodeIterator();
      while(node = iterator.next()) {
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

      if(range.canSurroundContents()) {
        var a = range.surroundContents(elem);
      } else {
        console.log('content.surround(): can not surround range');
      }
    },

    /**
     * Unwrap all tags this range is affected by
     */
    nuke: function(host, range) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        this.unwrap(elem);
      }
    },

    unwrap: function(elem) {
      $(elem).contents().unwrap();
    }
  };
})();

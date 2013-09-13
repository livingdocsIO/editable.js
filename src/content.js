var content = (function() {
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
      if(!element) return;

      if(element.nodeType === 3) {
        element.nodeValue = element.nodeValue.replace(/^(\s)/, '\u00A0').replace(/(\s)$/, '\u00A0');
      }
      else {
        this.normalizeSpaces(element.firstChild);
        this.normalizeSpaces(element.lastChild);
      }
    }
  };
})();

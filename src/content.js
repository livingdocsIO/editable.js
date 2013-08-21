var content = (function() {
  return {
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
        if(node && !node.textContent) {
          node.parentNode.removeChild(node);
        }
      }
    }
  };
})();

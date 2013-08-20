var content = (function() {
  return {
    cleanInternals: function(element) {
      element.innerHTML = element.innerHTML.replace(/\u200B/g, '<br />');
    },

    removeEmptyTags: function(element) {
      var i, len, node;

      for (i = 0, len = element.childNodes.length; i < len; i++) {
        node = element.childNodes[i];
        if(node && (!node.textContent || string.trim(node.textContent) === '')) node.parentNode.removeChild(node);
      }
    }
  };

})();

var content = (function() {
  return {
    cleanInternals: function(htmlString) {
      return htmlString.replace(/\u200B/g, '<br />');
    }
  }
})();
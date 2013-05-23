var string = (function() {
  return {
    trimRight: function(text) {
      return text.replace(/\s+$/, "");
    },

    trimLeft: function(text) {
      return text.replace(/^\s+/, "");
    }
  };
})();

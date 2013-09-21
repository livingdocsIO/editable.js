var string = (function() {
  return {
    trimRight: function(text) {
      return text.replace(/\s+$/, '');
    },

    trimLeft: function(text) {
      return text.replace(/^\s+/, '');
    },

    trim: function(text) {
      return text.replace(/^\s+|\s+$/g, '');
    },

    isString: function(obj) {
      return toString.call(obj) === '[object String]';
    },

    /**
     * Turn any string into a regular expression.
     * This can be used to search or replace a string conveniently.
     */
    regexp: function(str, flags) {
      if (!flags) flags = 'g';
      var escapedStr = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      return new RegExp(escapedStr, flags);
    }
  };
})();

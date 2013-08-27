var block = (function() {
  return {
    next: function(element) {
      var next = element.nextElementSibling;
      if(next && next.getAttribute('contenteditable')) return next;
      return null;
    },

    previous: function(element) {
      var previous = element.previousElementSibling;
      if(previous && previous.getAttribute('contenteditable')) return previous;
      return null;
    }
  };
})();

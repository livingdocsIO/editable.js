module.exports = (function() {

  var getSibling = function(type) {
    return function(element) {
      var sibling = element[type];
      if (sibling && sibling.getAttribute('contenteditable')) return sibling;
      return null;
    };
  };

  return {
    next: getSibling('nextElementSibling'),
    previous: getSibling('previousElementSibling'),
  };
})();

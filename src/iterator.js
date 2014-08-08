var Iterator = (function() {

  var Iterator = function(root) {
    this.root = root;
    this.current = this.next = this.root;
  };

  Iterator.prototype.getNextTextNode = function() {
    var next;
    while (next = this.getNext()) {
      if (next.nodeType === 3 && next.data !== '') {
        return next;
      }
    }
  },

  Iterator.prototype.getNext = function() {
    var child, n;
    n = this.current = this.next;
    child = this.next = undefined;
    if (this.current) {
      if (child = n.firstChild) {
        this.next = child;
      } else {
        while ((n !== this.root) && !(this.next = n.nextSibling)) {
          n = n.parentNode;
        }
      }
    }
    return this.current;
  };

  Iterator.prototype.replaceCurrent = function(replacement) {
    this.current = replacement;
    this.next = undefined;
    var n = this.current;
    while ((n !== this.root) && !(this.next = n.nextSibling)) {
      n = n.parentNode;
    }
  };

  return Iterator;
})();

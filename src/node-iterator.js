// A DOM node iterator.
//
// Has the ability to replace nodes on the fly and continue
// the iteration.
var NodeIterator = (function() {

  var NodeIterator = function(root) {
    this.root = root;
    this.current = this.next = this.root;
  };

  NodeIterator.prototype.getNextTextNode = function() {
    var next;
    while ( (next = this.getNext()) ) {
      if (next.nodeType === 3 && next.data !== '') {
        return next;
      }
    }
  },

  NodeIterator.prototype.getNext = function() {
    var child, n;
    n = this.current = this.next;
    child = this.next = undefined;
    if (this.current) {
      child = n.firstChild;
      if (child) {
        this.next = child;
      } else {
        while ((n !== this.root) && !(this.next = n.nextSibling)) {
          n = n.parentNode;
        }
      }
    }
    return this.current;
  };

  NodeIterator.prototype.replaceCurrent = function(replacement) {
    this.current = replacement;
    this.next = undefined;
    var n = this.current;
    while ((n !== this.root) && !(this.next = n.nextSibling)) {
      n = n.parentNode;
    }
  };

  return NodeIterator;
})();

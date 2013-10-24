var TextRange = (function() {

  var TextRange = function(host, range) {
    this.host = host;
    this.range = range;
  };

  TextRange.prototype = (function() {
    return {
      nextCharacter: function() {},
      previousCharacter: function() {},
      expandLeft: function(count) {

      },

      expandRight: function(count) {
        var node = this.range.endContainer;
        var offset = this.range.endOffset;
        if (this.isTextNode(node) && !this.isAtEndOfTextNode(node)) {
          this.range.setEnd(node, offset + 1);
        } else {
          var next = this.findNextTextNode(node, offset);
          if (next) {
            this.range.setEnd(next, 1);
          }
        }
      },

      /**
       * Find the next TextNode with a length bigger than 0
      **/
      findNextTextNode: function(container, offset) {
        // create range from here to end of container
        // traverse nodes
        var range = rangy.createRange();
        range.selectNodeContents(this.host);
        range.setStart(container, offset);
        var textNodes = range.getNodes([3]);
        for (var i = 0; i < textNodes.length; i++) {
          if (!parser.isVoidTextNode(textNodes[i])) {
            return textNodes[i];
          }
        }
      },

      findPreviousTextNode: function() {},

      isTextNode: function(node) {
        return node.nodeType === 3;
      },

      isAtEndOfTextNode: function() {
        // todo
        return false;
      },

      isAtBeginningOfTextNode: function() {}
    }
  })();

  return TextRange;
})();

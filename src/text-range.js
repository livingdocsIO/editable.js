var TextRange = (function() {

  var TextRange = function(host, range) {
    this.host = host;
    this.range = range;
  };

  TextRange.prototype = (function() {
    return {
      nextCharacter: function() {},
      previousCharacter: function() {},

      expandRight: function() {
        var node = this.range.endContainer;
        var offset = this.range.endOffset;
        if (this.isTextNode(node) && !this.isAtEndOfTextNode(node, offset)) {
          this.range.setEnd(node, offset + 1);
        } else {
          if (this.isTextNode(node)) {
            // position after textNode
            offset = parser.getNodeIndex(node) + 1;
            node = this.range.endContainer.parentNode;
          }
          var next = this.findNextTextNode(node, offset);
          if (next) {
            this.range.setEnd(next, 1);
          }
        }
      },

      expandLeft: function() {
        var node = this.range.startContainer;
        var offset = this.range.startOffset;
        if (this.isTextNode(node) && !this.isAtBeginningOfTextNode(node, offset)) {
          this.range.setStart(node, offset - 1);
        } else {
          if (this.isTextNode(node)) {
            // position before textNode
            offset = parser.getNodeIndex(node);
            node = this.range.endContainer.parentNode;
          }
          var prev = this.findPreviousTextNode(node, offset);
          if (prev) {
            var secondLastIndex = prev.nodeValue.length - 1;
            this.range.setStart(prev, secondLastIndex);
          }
        }
      },

      /**
       * Find the next TextNode with a length bigger than 0
       *
       * Attention: if the container is a textNode
       * it will be included in the resutls
      **/
      findNextTextNode: function(container, offset) {
        var textNodes = this.getTextNodes(container, offset, 'after');
        for (var i = 0; i < textNodes.length; i++) {
          if (!parser.isVoidTextNode(textNodes[i])) {
            return textNodes[i];
          }
        }
      },

      /**
       * Find the previous TextNode with a length bigger than 0
       *
       * Attention: if the container is a textNode
       * it will be included in the resutls
      **/
      findPreviousTextNode: function(container, offset) {
        var textNodes = this.getTextNodes(container, offset, 'before');
        for (var i = textNodes.length - 1; i >= 0; i--) {
          if (!parser.isVoidTextNode(textNodes[i])) {
            return textNodes[i];
          }
        }
      },

      getTextNodes: function(container, offset, beforeOrAfter) {
        var range = rangy.createRange();
        range.selectNodeContents(this.host);
        var rangeMethod = beforeOrAfter === 'before' ? 'setEnd' : 'setStart';
        range[rangeMethod](container, offset);
        return range.getNodes([3]);
      },

      isTextNode: function(node) {
        return node.nodeType === 3;
      },

      isAtEndOfTextNode: function(textNode, offset) {
        return offset === textNode.nodeValue.length;
      },

      isAtBeginningOfTextNode: function(textNode, offset) {
        return offset === 0;
      }
    };
  })();

  return TextRange;
})();

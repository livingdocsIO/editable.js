// Consider:
// alternative approach:
// use the iterator to find the next text node from a given node
// then look up this text node to find the text index.
//
// TextContent
// -----------
//
// Collects all text nodes in a host and maps
// the range start and end to text offsets.
var TextContent = (function() {

  var TextContent = function(host, range) {
    this.host = host;
    this.range = range;
    this.textNodes = [];
    this.fullText = '';
    this.length = 0;
    this.startIndex = undefined;
    this.endIndex = undefined;
    this.parseHost(host, range);
  };

  TextContent.prototype = (function() {
    return {

      getTextBefore: function() {
        return this.fullText.slice(0, this.startIndex);
      },

      getInnerText: function() {
        return this.fullText.slice(this.startIndex, this.endIndex);
      },

      getTextAfter: function() {
        return this.fullText.slice(this.endIndex, this.length);
      },

      indexTextNode: function(node) {
        var text = node.nodeValue;
        var len = text.length;
        if (len) {
          this.fullText += text;
          this.textNodes.push({
            node: node,
            start: this.length,
            end: this.length += len
          });
        }
      },

      getBeacon: function(node, offset, iterator) {
        var beacon;
        if (node.nodeType === nodeType.textNode || offset === 0) {
          beacon = node;
        } else if (offset < node.childNodes.length) {
          beacon = node.childNodes[offset];
        } else {
          beacon = iterator.outerLookahead(node);
        }
        return beacon;
      },

      parseHost: function(host, range) {
        var iterator = new NodeIterator(host)
        var next, offset, lengthBefore, startBeacon, endBeacon;

        startBeacon = this.getBeacon(range.startContainer, range.startOffset, iterator);
        endBeacon = this.getBeacon(range.endContainer, range.endOffset, iterator);

        while ( (next = iterator.getNext()) ) {
          lengthBefore = this.length;

          if (next.nodeType === nodeType.textNode) {
            this.indexTextNode(next);
          }

          // find start text offset
          if (next === startBeacon) {
            this.startIndex = lengthBefore;
            if (range.startContainer.nodeType === nodeType.textNode) {
              this.startIndex += range.startOffset;
            }
          }

          // find end text offset
          if (next === endBeacon) {
            this.endIndex = lengthBefore;
            if (range.endContainer.nodeType === nodeType.textNode) {
              this.endIndex += range.endOffset;
            }
          }
        }

        if (this.startIndex === undefined) { this.startIndex = this.length;}
        if (this.endIndex === undefined) { this.endIndex = this.length;}
      }

    };
  })();

  return TextContent;
})();

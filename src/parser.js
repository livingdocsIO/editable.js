/**
 * The parser module provides helper methods to parse html-chunks
 * manipulations and helpers for common tasks.
 *
 * @module core
 * @submodule parser
 */


/** DOM NODE TYPES:
  *
  * 'ELEMENT_NODE': 1
  * 'ATTRIBUTE_NODE': 2
  * 'TEXT_NODE': 3
  * 'CDATA_SECTION_NODE': 4
  * 'ENTITY_REFERENCE_NODE': 5
  * 'ENTITY_NODE': 6
  * 'PROCESSING_INSTRUCTION_NODE': 7
  * 'COMMENT_NODE': 8
  * 'DOCUMENT_NODE': 9
  * 'DOCUMENT_TYPE_NODE': 10
  * 'DOCUMENT_FRAGMENT_NODE': 11
  * 'NOTATION_NODE': 12
  */

var parser = (function() {
  /**
   * @class DOM
   * @static
   */
  return {

    /**
     * Get the index of a node.
     * So that parent.childNodes[ getIndex(node) ] would return the node again
     *
     * @method getNodeIndex
     * @param {HTMLElement}
     */
    getNodeIndex: function(node) {
      var index = 0;
      while ((node = node.previousSibling) !== null) {
        index += 1;
      }
      return index;
    },

    /**
     * check if node contains text or element nodes
     * whitespace counts too!
     *
     * @method isEmpty
     * @param {HTMLElement}
     */
    isEmpty: function(node) {
      var child, i, len;
      var childNodes = node.childNodes;

      for (i = 0, len = childNodes.length; i < len; i++) {
        child = childNodes[i];

        if (child.nodeType === 3 && !this.isEmptyTextNode(child)) {
          return false;
        } else if (child.nodeType === 1) {
          return false;
        }
      }
      return true;
    },

    /**
     * check if node is a text node and completely empty without any whitespace
     *
     * @method isEmptyTextNode
     * @param {HTMLElement}
     */
    isEmptyTextNode: function(node) {
      return node.nodeType === 3 && !node.nodeValue;
    },

    isEndOfHost: function(editable, endContainer, endOffset) {
      if (endContainer === editable) {
        return this.isEndOffset(endContainer, endOffset);
      }

      if (this.isEndOffset(endContainer, endOffset)) {
        var parentContainer = endContainer.parentNode;
        var offsetInParent = this.getNodeIndex(endContainer);
        return this.isEndOfHost(editable, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isEndOffset: function (container, offset) {
      if (container.nodeType === 3) {
        // ignore whitespace at the end
        var text = container.nodeValue;
        return offset >= string.trimRight(text).length;

        // return offset === container.length;
      } else {
        return container.childNodes[offset] === container.lastChild;
      }
    }

  };
})();

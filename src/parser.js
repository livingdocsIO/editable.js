/**
 * The parser module provides helper methods to parse html-chunks
 * manipulations and helpers for common tasks.
 *
 * @module core
 * @submodule parser
 */

var parser = (function() {
  /**
   * Singleton that provides DOM lookup helpers.
   * @static
   */
  return {

    /**
     * Get the editableJS host block of a node.
     *
     * @method getHost
     * @param {DOM Node}
     * @return {DOM Node}
     */
    getHost: function(node) {
      var editableSelector = '.' + config.editableClass;
      var hostNode = $(node).closest(editableSelector);
      return hostNode.length ? hostNode[0] : undefined;
    },

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
     * Check if node contains text or element nodes
     * whitespace counts too!
     *
     * @method isVoid
     * @param {HTMLElement}
     */
    isVoid: function(node) {
      var child, i, len;
      var childNodes = node.childNodes;

      for (i = 0, len = childNodes.length; i < len; i++) {
        child = childNodes[i];

        if (child.nodeType === nodeType.textNode && !this.isVoidTextNode(child)) {
          return false;
        } else if (child.nodeType === nodeType.elementNode) {
          return false;
        }
      }
      return true;
    },

    /**
     * Check if node is a text node and completely empty without any whitespace
     *
     * @method isVoidTextNode
     * @param {HTMLElement}
     */
    isVoidTextNode: function(node) {
      return node.nodeType === nodeType.textNode && !node.nodeValue;
    },

    /**
     * Check if node is a text node and contains nothing but whitespace
     *
     * @method isWhitespaceOnly
     * @param {HTMLElement}
     */
    isWhitespaceOnly: function(node) {
      return node.nodeType === nodeType.textNode && this.lastOffsetWithContent(node) === 0;
    },

    isLinebreak: function(node) {
      return node.nodeType === nodeType.elementNode && node.tagName === 'BR';
    },

    /**
     * Returns the last offset where the cursor can be positioned to
     * be at the visible end of its container.
     * Currently works only for empty text nodes (not empty tags)
     *
     * @method isWhitespaceOnly
     * @param {HTMLElement}
     */
    lastOffsetWithContent: function(node) {
      if (node.nodeType === nodeType.textNode) {
        return string.trimRight(node.nodeValue).length;
      } else {
        var i,
            childNodes = node.childNodes;

        for (i = childNodes.length - 1; i >= 0; i--) {
          node = childNodes[i];
          if (this.isWhitespaceOnly(node) || this.isLinebreak(node)) {
            continue;
          } else {
            // The offset starts at 0 before the first element
            // and ends with the length after the last element.
            return i + 1;
          }
        }
        return 0;
      }
    },

    isBeginningOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isStartOffset(container, offset);
      }

      if (this.isStartOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element simulates a range offset
        // right before the element.
        var offsetInParent = this.getNodeIndex(container);
        return this.isBeginningOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isEndOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isEndOffset(container, offset);
      }

      if (this.isEndOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element plus one simulates a range offset
        // right after the element.
        var offsetInParent = this.getNodeIndex(container) + 1;
        return this.isEndOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isStartOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        return offset === 0;
      } else {
        if (container.childNodes.length === 0)
          return true;
        else
          return container.childNodes[offset] === container.firstChild;
      }
    },

    isEndOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        return offset === container.length;
      } else {
        if (container.childNodes.length === 0)
          return true;
        else if (offset > 0)
          return container.childNodes[offset - 1] === container.lastChild;
        else
          return false;
      }
    },

    isTextEndOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isTextEndOffset(container, offset);
      }

      if (this.isTextEndOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element plus one simulates a range offset
        // right after the element.
        var offsetInParent = this.getNodeIndex(container) + 1;
        return this.isTextEndOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isTextEndOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        var text = string.trimRight(container.nodeValue);
        return offset >= text.length;
      } else if (container.childNodes.length === 0) {
        return true;
      } else {
        var lastOffset = this.lastOffsetWithContent(container);
        return offset >= lastOffset;
      }
    },

    isSameNode: function(target, source) {
      var i, len, attr;

      if (target.nodeType !== source.nodeType)
        return false;

      if (target.nodeName !== source.nodeName)
        return false;

      for (i = 0, len = target.attributes.length; i < len; i++) {
        attr = target.attributes[i];
        if (source.getAttribute(attr.name) !== attr.value)
          return false;
      }

      return true;
    },

    /**
     * Return the deepest last child of a node.
     *
     * @method  latestChild
     * @param  {HTMLElement} container The container to iterate on.
     * @return {HTMLElement}           THe deepest last child in the container.
     */
    latestChild: function(container) {
      if (container.lastChild)
        return this.latestChild(container.lastChild);
      else
        return container;
    },

    /**
     * Checks if a documentFragment has no children.
     * Fragments without children can cause errors if inserted into ranges.
     *
     * @method  isDocumentFragmentWithoutChildren
     * @param  {HTMLElement} DOM node.
     * @return {Boolean}
     */
    isDocumentFragmentWithoutChildren: function(fragment) {
      if (fragment &&
          fragment.nodeType === nodeType.documentFragmentNode &&
          fragment.childNodes.length === 0) {
        return true;
      }
      return false;
    },

    /**
     * Determine if an element behaves like an inline element.
     */
    isInlineElement: function(window, element) {
      var styles = element.currentStyle || window.getComputedStyle(element, '');
      var display = styles.display;
      switch (display) {
      case 'inline':
      case 'inline-block':
        return true;
      default:
        return false;
      }
    }
  };
})();

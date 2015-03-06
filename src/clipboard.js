var clipboard = (function() {
  var allowedElements, requiredAttributes, transformElements;
  var blockLevelElements, splitIntoBlocks;
  var whitespaceOnly = /^\s*$/;
  var blockPlaceholder = '<!-- BLOCK -->';

  var updateConfig = function (config) {
    var i, name, rules = config.pastedHtmlRules;
    allowedElements = rules.allowedElements || {};
    requiredAttributes = rules.requiredAttributes || {};
    transformElements = rules.transformElements || {};

    blockLevelElements = {};
    for (i = 0; i < rules.blockLevelElements.length; i++) {
      name = rules.blockLevelElements[i];
      blockLevelElements[name] = true;
    }
    splitIntoBlocks = {};
    for (i = 0; i < rules.splitIntoBlocks.length; i++) {
      name = rules.splitIntoBlocks[i];
      splitIntoBlocks[name] = true;
    }
  };

  updateConfig(config);

  return {

    updateConfig: updateConfig,

    paste: function(element, cursor, callback) {
      var document = element.ownerDocument;
      element.setAttribute(config.pastingAttribute, true);

      if (cursor.isSelection) {
        cursor = cursor.deleteContent();
      }

      // Create a placeholder and set the focus to the pasteholder
      // to redirect the browser pasting into the pasteholder.
      cursor.save();
      var pasteHolder = this.injectPasteholder(document);
      pasteHolder.focus();

      // Use a timeout to give the browser some time to paste the content.
      // After that grab the pasted content, filter it and restore the focus.
      var _this = this;
      setTimeout(function() {
        var blocks;

        blocks = _this.parseContent(pasteHolder);
        $(pasteHolder).remove();
        element.removeAttribute(config.pastingAttribute);

        cursor.restore();
        callback(blocks, cursor);

      }, 0);
    },

    injectPasteholder: function(document) {
      var pasteHolder = $(document.createElement('div'))
        .attr('contenteditable', true)
        .css({
          position: 'fixed',
          right: '5px',
          top: '50%',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          outline: 'none'
        })[0];

      $(document.body).append(pasteHolder);
      return pasteHolder;
    },

    /**
     * - Parse pasted content
     * - Split it up into blocks
     * - clean and normalize every block
     *
     * @param {DOM node} A container where the pasted content is located.
     * @returns {Array of Strings} An array of cleaned innerHTML like strings.
     */
    parseContent: function(element) {

      // Filter pasted content
      var pastedString = this.filterHtmlElements(element);

      // Handle Blocks
      var blocks = pastedString.split(blockPlaceholder);
      for (var i = 0; i < blocks.length; i++) {
        var entry = blocks[i];

        // Clean Whitesapce
        entry = this.cleanWhitespace(entry);

        // Trim pasted Text
        entry = string.trim(entry);

        blocks[i] = entry;
      }

      blocks = blocks.filter(function(entry) {
        return !whitespaceOnly.test(entry);
      });

      return blocks;
    },

    filterHtmlElements: function(elem, parents) {
      if (!parents) parents = [];

      var child, content = '';
      for (var i = 0; i < elem.childNodes.length; i++) {
        child = elem.childNodes[i];
        if (child.nodeType === nodeType.elementNode) {
          var childContent = this.filterHtmlElements(child, parents);
          content += this.conditionalNodeWrap(child, childContent);
        } else if (child.nodeType === nodeType.textNode) {
          // Escape HTML characters <, > and &
          content += string.escapeHtml(child.nodeValue);
        }
      }

      return content;
    },

    conditionalNodeWrap: function(child, content) {
      var nodeName = child.nodeName.toLowerCase();
      nodeName = this.transformNodeName(nodeName);

      if ( this.shouldKeepNode(nodeName, child) ) {
        var attributes = this.filterAttributes(nodeName, child);
        if (nodeName === 'br') {
          return '<'+ nodeName + attributes +'>';
        } else if ( !whitespaceOnly.test(content) ) {
          return '<'+ nodeName + attributes +'>'+ content +'</'+ nodeName +'>';
        } else {
          return content;
        }
      } else {
        if (splitIntoBlocks[nodeName]) {
          return blockPlaceholder + content + blockPlaceholder;
        } else if (blockLevelElements[nodeName]) {
          // prevent missing whitespace between text when block-level
          // elements are removed.
          return content + ' ';
        } else {
          return content;
        }
      }
    },

    filterAttributes: function(nodeName, node) {
      var attributes = '';

      for (var i=0, len=(node.attributes || []).length; i<len; i++) {
        var name  = node.attributes[i].name;
        var value = node.attributes[i].value;
        if ((allowedElements[nodeName][name]) && value) {
          attributes += ' ' + name + '="' + value + '"';
        }
      }
      return attributes;
    },

    transformNodeName: function(nodeName) {
      if (transformElements[nodeName]) {
        return transformElements[nodeName];
      } else {
        return nodeName;
      }
    },

    hasRequiredAttributes: function(nodeName, node) {
      var attrName, attrValue;
      var requiredAttrs = requiredAttributes[nodeName];
      if (requiredAttrs) {
        for (var i = 0; i < requiredAttrs.length; i++) {
          attrName = requiredAttrs[i];
          attrValue = node.getAttribute(attrName);
          if (!attrValue) {
            return false;
          }
        }
      }
      return true;
    },

    shouldKeepNode: function(nodeName, node) {
      return allowedElements[nodeName] && this.hasRequiredAttributes(nodeName, node);
    },

    cleanWhitespace: function(str) {
      var cleanedStr = str.replace(/(.)(\u00A0)/g, function(match, group1, group2, offset, string) {
        if ( /[\u0020]/.test(group1) ) {
          return group1 + '\u00A0';
        } else {
          return group1 + ' ';
        }
      });
      return cleanedStr;
    }

  };

})();

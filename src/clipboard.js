var clipboard = (function() {

  var whitespaceOnly = /^\s*$/;

  return {

    // Elements and attributes to keep in pasted text
    allowed: {
      'a': {
        'href': true
      },
      'strong': {},
      'em': {}
    },

    // Elements that have required attributes.
    // If these are not present the elements are filtered out.
    required: {
      'a': ['href']
    },

    // Elements that should be transformed into other elements
    transform: {
      'b': 'strong'
    },

    // // Proposed config structure
    // allowedHtml: {
    //   '*': {
    //     not: '.control'
    //   }
    //   'a': {
    //     required: ['href']
    //   }
    //   'strong': {
    //     transform: 'b'
    //   }
    // }

    paste: function(element, action, cursor, document) {
      element.setAttribute(config.pastingAttribute, true);

      if (cursor.isSelection) {
        cursor = cursor.deleteContent();
      }

      cursor.save();
      var pasteHolder = this.getContenteditableContainer(document);
      pasteHolder.focus(); // Set the focus to the pasteHolder to redirect the browser pasting

      var that = this;
      setTimeout(function() {
        var pasteValue, fragment;

        pasteValue = that.filterContent(pasteHolder);
        fragment = content.createFragmentFromString(pasteValue);
        $(pasteHolder).remove();

        cursor.restore();
        cursor.insertBefore(fragment);
        cursor.setVisibleSelection();

        element.removeAttribute(config.pastingAttribute);
      }, 0);
    },

    getContenteditableContainer: function(document) {
      var pasteHolder = $('<div>')
        .attr('contenteditable', true)
        .addClass('filteredPaste_pasteIntoArea_xxx')
        .css({
          position: 'fixed',
          left: '5px',
          top: '5px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        })[0];

      $(document.body).append(pasteHolder);
      return pasteHolder;
    },

    /**
     * @param { DOM node } A container where the pasted content is located.
     * @returns { String } A cleaned innerHTML like string built from the pasted content.
     */
    filterContent: function(element) {

      // Filter pasted content
      var pastedString = this.filterHtmlElements(element);

      // Trim pasted Text
      if (pastedString) {
        pastedString = string.trim(pastedString);
      }

      return pastedString;
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

    // a <b>strong</b> c
    conditionalNodeWrap: function(child, content) {
      var nodeName = child.nodeName.toLowerCase();
      nodeName = this.transformNodeName(nodeName);

      if ( this.shouldKeepNode(nodeName, child) && !whitespaceOnly.test(content) ){
        var attributes = this.filterAttributes(nodeName, child);
        return '<'+ nodeName + attributes +'>'+ content +'</'+ nodeName +'>';
      } else {
        return content;
      }
    },

    filterAttributes: function(nodeName, node) {
      var attributes = '';

      for (var i=0, len=(node.attributes || []).length; i<len; i++) {
        var name  = node.attributes[i].name;
        var value = node.attributes[i].value;
        if ((this.allowed[nodeName][name]) && value) {
          attributes += ' ' + name + '="' + value + '"';
        }
      }
      return attributes;
    },

    transformNodeName: function(nodeName) {
      if (this.transform[nodeName]) {
        return this.transform[nodeName];
      } else {
        return nodeName;
      }
    },

    hasRequiredAttributes: function(nodeName, node) {
      var attrName, attrValue;
      var requiredAttrs = this.required[nodeName];
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
      return this.allowed[nodeName] && this.hasRequiredAttributes(nodeName, node);
    }

  };

})();

var clipboard = (function() {

  return {

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
          content += child.nodeValue;
        }
      }

      return content;
    },

    conditionalNodeWrap: function(child, content) {
      var nodeName = child.nodeName.toLowerCase();
      if ( this.shouldKeepNode(nodeName, child) ){
        var attributes = this.filterAttributes(child);
        return '<'+ nodeName + attributes +'>'+ content +'</'+ nodeName +'>';
      } else {
        return content;
      }
    },

    // Tags and attributes to keep in pasted text
    allowed: {
      'a': {
        'href': true
      }
    },

    required: {
      'a': {
        'href': true
      }
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

    filterAttributes: function(node) {
      var nodeName = node.nodeName.toLowerCase();
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

    shouldKeepNode: function(nodeName, node) {
      // todo: check for required attributes
      return Boolean(this.allowed[nodeName]);
    }

  };

})();

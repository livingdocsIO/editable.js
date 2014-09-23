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
        var pasteValue, pasteElement;

        pasteValue = that.extractFromContenteditableContainer(pasteHolder);

        pasteElement = document.createTextNode(pasteValue);
        content.normalizeSpaces(pasteElement);

        cursor.restore();
        cursor.insertBefore(pasteElement);
        cursor.setVisibleSelection();

        element.removeAttribute(config.pastingAttribute);
      }, 0);
    },

    getTextAreaContainer: function(document) {
      var pasteHolder = document.createElement('textarea');
      pasteHolder.setAttribute('style', 'position: absolute; left: -9999px');
      return pasteHolder;
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
        });

      $(document.body).append(pasteHolder[0]);
      return pasteHolder[0];
    },

    extractFromContenteditableContainer: function(element) {
      var value = element.innerHTML;
      $(element).remove();

      console.log('Paste Value');
      console.log(value);

      // Trim Pasted Text
      if (value) {
        value = string.trim(value);
      }
      return value;
    }

  };

})();

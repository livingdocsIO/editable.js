var highlightText = (function() {

  return {
    extractText: function(element) {
      var text = '';
      this.getText(element, function(part) {
        text += part;
      });
      return text;
    },

    // Extract the text of an element.
    // This has two notable behaviours:
    // - It uses a NodeIterator which will skip elements
    //   with data-editable="remove"
    // - It returns a space for <br> elements
    //   (The only block level element allowed inside of editables)
    getText: function(element, callback) {
      var iterator = new NodeIterator(element);
      var next;
      while ( (next = iterator.getNext()) ) {
        if (next.nodeType === nodeType.textNode && next.data !== '') {
          callback(next.data);
        } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
          callback(' ');
        }
      }
    },

    highlight: function(element, regex, stencilElement) {
      var matches = this.find(element, regex);
      this.highlightMatches(element, matches, stencilElement);
    },

    find: function(element, regex) {
      var text = this.extractText(element);
      var match;
      var matches = [];
      var matchIndex = 0;
      while ( (match = regex.exec(text)) ) {
        matches.push(this.prepareMatch(match, matchIndex));
        matchIndex += 1;
      }
      return matches;
    },

    highlightMatches: function(element, matches, stencilElement) {
      if (!matches || matches.length === 0) {
        return;
      }

      var next, textNode, length, offset, isFirstPortion, isLastPortion, wordId;
      var currentMatchIndex = 0;
      var currentMatch = matches[currentMatchIndex];
      var totalOffset = 0;
      var iterator = new NodeIterator(element);
      var portions = [];
      while ( (next = iterator.getNext()) ) {

        // Account for <br> elements
        if (next.nodeType === nodeType.textNode && next.data !== '') {
          textNode = next;
        } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
          totalOffset = totalOffset + 1;
          continue;
        } else {
          continue;
        }

        var nodeText = textNode.data;
        var nodeEndOffset = totalOffset + nodeText.length;
        if (currentMatch.startIndex < nodeEndOffset && totalOffset < currentMatch.endIndex) {

          // get portion position (fist, last or in the middle)
          isFirstPortion = isLastPortion = false;
          if (totalOffset <= currentMatch.startIndex) {
            isFirstPortion = true;
            wordId = currentMatch.startIndex;
          }
          if (nodeEndOffset >= currentMatch.endIndex) {
            isLastPortion = true;
          }

          // calculate offset and length
          if (isFirstPortion) {
            offset = currentMatch.startIndex - totalOffset;
          } else {
            offset = 0;
          }

          if (isLastPortion) {
            length = (currentMatch.endIndex - totalOffset) - offset;
          } else {
            length = nodeText.length - offset;
          }

          // create portion object
          var portion = {
            element: textNode,
            text: nodeText.substring(offset, offset + length),
            offset: offset,
            length: length,
            isLastPortion: isLastPortion,
            wordId: wordId
          };

          portions.push(portion);

          if (isLastPortion) {
            var lastNode = this.wrapWord(portions, stencilElement);
            iterator.replaceCurrent(lastNode);

            // recalculate nodeEndOffset if we have to replace the current node.
            nodeEndOffset = totalOffset + portion.length + portion.offset;

            portions = [];
            currentMatchIndex += 1;
            if (currentMatchIndex < matches.length) {
              currentMatch = matches[currentMatchIndex];
            }
          }
        }

        totalOffset = nodeEndOffset;
      }
    },

    getRange: function(element) {
      var range = rangy.createRange();
      range.selectNodeContents(element);
      return range;
    },

    // @return the last wrapped element
    wrapWord: function(portions, stencilElement) {
      var element;
      for (var i = 0; i < portions.length; i++) {
        var portion = portions[i];
        element = this.wrapPortion(portion, stencilElement);
      }

      return element;
    },

    wrapPortion: function(portion, stencilElement) {
      var range = rangy.createRange();
      range.setStart(portion.element, portion.offset);
      range.setEnd(portion.element, portion.offset + portion.length);
      var node = stencilElement.cloneNode(true);
      node.setAttribute('data-word-id', portion.wordId);
      range.surroundContents(node);

      // Fix a weird behaviour where an empty text node is inserted after the range
      if (node.nextSibling) {
        var next = node.nextSibling;
        if (next.nodeType === nodeType.textNode && next.data === '') {
          next.parentNode.removeChild(next);
        }
      }

      return node;
    },

    prepareMatch: function (match, matchIndex) {
      // Quickfix for the spellcheck regex where we need to match the second subgroup.
      if (match[2]) {
        return this.prepareMatchForSecondSubgroup(match, matchIndex);
      }

      return {
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchIndex: matchIndex,
        search: match[0]
      };
    },

    prepareMatchForSecondSubgroup: function (match, matchIndex) {
      var index = match.index;
      index += match[1].length;
      return {
        startIndex: index,
        endIndex: index + match[2].length,
        matchIndex: matchIndex,
        search: match[0]
      };
    }

  };
})();

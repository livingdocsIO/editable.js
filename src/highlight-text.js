var highlightText = (function() {

  return {
    extractText: function(range) {
      return range.toString();
    },

    getRange: function(element) {
      var range = rangy.createRange();
      range.selectNodeContents(element);
      return range;
    },

    getTextIterator: function(range) {
      return range.createNodeIterator([3], function(node) {
        // no filter needed right now.
        return true;
      });
    },

    iterate: function(range, matches) {
      var textNode, length, firstPortion, lastPortion;
      var currentMatchIndex = 0;
      var currentMatch = matches[currentMatchIndex];
      var totalOffset = 0;
      var iterator = this.getTextIterator(range);
      var portions = [];
      while ( (textNode = iterator.next()) ) {
        var nodeText = textNode.data;
        var nodeEndOffset = totalOffset + nodeText.length;
        if (nodeEndOffset > currentMatch.startIndex && totalOffset < currentMatch.endIndex) {

          // get portion position
          firstPortion = lastPortion = false;
          if (totalOffset <= currentMatch.startIndex) {
            firstPortion = true;
          }
          if (nodeEndOffset >= currentMatch.endIndex) {
            lastPortion = true;
          }

          // calculate offset and length
          var offset;
          if (firstPortion) {
            offset = currentMatch.startIndex - totalOffset;
          } else {
            offset = 0;
          }

          var length;
          if (lastPortion) {
            length = (currentMatch.endIndex - totalOffset) - offset;
          } else {
            length = textNode.data.length - offset;
          }

          // create portion object
          var portion = {
            element: textNode,
            text: textNode.data.substring(offset, offset + length),
            offset: offset,
            length: length,
            lastPortion: lastPortion
          }

          portions.push(portion);

          if (lastPortion) {
            this.wrapWord(portions);
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

    wrapWord: function(portions) {
      var element;
      for (var i = 0; i < portions.length; i++) {
        var portion = portions[i];
        element = this.wrapPortion(portion);
      }

      return element;
    },

    wrapPortion: function(portion) {
      var range = rangy.createRange();
      range.setStart(portion.element, portion.offset);
      range.setEnd(portion.element, portion.offset + portion.length);
      var node = $('<span data-awesome="crazy">')[0];
      return range.surroundContents(node);
    },

    find: function(element, regex) {
      var range = this.getRange(element);
      var text = this.extractText(range);
      var match;
      var matches = [];
      var matchIndex = 0;
      while (match = regex.exec(text)) {
        matches.push(this.prepareMatch(match, matchIndex));
        matchIndex += 1;
      }

      return matches;
    },

    prepareMatch: function (match, matchIndex) {
      return {
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchIndex: matchIndex,
        search: match[0]
      }
    }

  }
})();

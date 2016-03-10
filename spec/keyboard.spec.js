var destructureNodes,
  Keyboard = require('../src/keyboard'),
  nodeType = require('../src/node-type');


describe('Keyboard', function() {

  describe('dispatchKeyEvent()', function() {

    var keyboard, event, called;

    beforeEach(function() {
      var mockedSelectionWatcher = {
        getFreshRange: function() { return {}; }
      };
      keyboard = new Keyboard(mockedSelectionWatcher);
      event = jQuery.Event('keydown');
      called = 0;
    });


    it('notifies a left event', function() {
      keyboard.on('left', function(event) {
        called += 1;
      });

      event.keyCode = Keyboard.key.left;
      keyboard.dispatchKeyEvent(event, {});
      expect(called).toEqual(1);
    });

    describe('notify "character" event', function() {

      it('does not fire the event for a "left" key', function() {
        keyboard.on('character', function(event) {
          called += 1;
        });

        event.keyCode = Keyboard.key.left;
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(0);
      });

      it('does not fire the event for a "ctrl" key', function() {
        keyboard.on('character', function(event) {
          called += 1;
        });

        event.keyCode = Keyboard.key.ctrl;
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(0);
      });

      it('does fire the event for a "e" key', function() {
        keyboard.on('character', function(event) {
          called += 1;
        });

        event.keyCode = 'e'.charCodeAt(0);
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(1);
      });

      it('does not fire the event for a "e" key without the notifyCharacterEvent param', function() {
        keyboard.on('character', function(event) {
          called += 1;
        });

        event.keyCode = 'e'.charCodeAt(0);
        keyboard.dispatchKeyEvent(event, {}, false);
        expect(called).toEqual(0);
      });
    });
  });

  describe('getNodeToRemove()', function() {

    beforeEach(function () {
      this.$contenteditable = $('<CONTENTEDITABLE>Text1<A><B>Text2</B>Text3<C>Text4</C>Text5</A>Text6</CONTENTEDITABLE>');
      destructureNodes(this.$contenteditable[0], this);
      this.range = rangy.createRange();
    });

    it('returns undefined for a ranga within a node', function () {
      this.range.setStart(this.nodeText2, 0);
      this.range.setEnd(this.nodeText2, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined);
    });

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is outside of the parent node', function () {
      this.range.setStart(this.nodeText2, 0);
      this.range.setEnd(this.nodeText3, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB);
    });

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is within a sibling of the parent node', function () {
      this.range.setStart(this.nodeText2, 0);
      this.range.setEnd(this.nodeText4, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB);
    });

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is after a sibling of the parent node', function () {
      this.range.setStart(this.nodeText2, 0);
      this.range.setEnd(this.nodeText5, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB);
    });

    it('recursively returns the parent if needed', function () {
      this.range.setStart(this.nodeText2, 0);
      this.range.setEnd(this.nodeText6, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeA);
    });

    it('returns undefined for a range that starts with an offset of 1', function () {
      this.range.setStart(this.nodeText2, 1);
      this.range.setEnd(this.nodeText6, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined);
    });

    it('returns undefined for a range that starts with an offset of 1', function () {
      this.range.setStart(this.nodeText3, 0);
      this.range.setEnd(this.nodeText6, 2);
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined);
    });
  });
});

destructureNodes = function (node, obj) {
  [].forEach.call(node.childNodes, function(node) {
    if (node.nodeType === nodeType.elementNode) {
      obj['node' + node.tagName] = node;
      destructureNodes(node, obj);
    } else if (node.nodeType === nodeType.textNode) {
      obj['node' + node.nodeValue] = node;
    }
  });
};

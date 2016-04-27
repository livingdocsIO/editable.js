import $ from 'jquery'
import rangy from 'rangy'

import Keyboard from '../src/keyboard'
import * as nodeType from '../src/node-type'

describe('Keyboard', function () {
  describe('dispatchKeyEvent()', () => {
    let keyboard, event, called

    beforeEach(() => {
      const mockedSelectionWatcher = {
        getFreshRange: () => ({})
      }
      keyboard = new Keyboard(mockedSelectionWatcher)
      event = $.Event('keydown')
      called = 0
    })

    it('notifies a left event', () => {
      keyboard.on('left', () => called++)

      event.keyCode = Keyboard.key.left
      keyboard.dispatchKeyEvent(event, {})
      expect(called).toEqual(1)
    })

    describe('notify "character" event', () => {
      it('does not fire the event for a "left" key', () => {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.left
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).toEqual(0)
      })

      it('does not fire the event for a "ctrl" key', () => {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.ctrl
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).toEqual(0)
      })

      it('does fire the event for a "e" key', () => {
        keyboard.on('character', () => called++)

        event.keyCode = 'e'.charCodeAt(0)
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).toEqual(1)
      })

      it('does not fire the event for a "e" key without the notifyCharacterEvent param', () => {
        keyboard.on('character', (event) => called++)

        event.keyCode = 'e'.charCodeAt(0)
        keyboard.dispatchKeyEvent(event, {}, false)
        expect(called).toEqual(0)
      })
    })
  })

  describe('getNodeToRemove()', () => {
    beforeEach(() => {
      this.$contenteditable = $('<CONTENTEDITABLE>Text1<A><B>Text2</B>Text3<C>Text4</C>Text5</A>Text6</CONTENTEDITABLE>')
      destructureNodes(this.$contenteditable[0], this)
      this.range = rangy.createRange()
    })

    it('returns undefined for a ranga within a node', () => {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText2, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is outside of the parent node', () => {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText3, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is within a sibling of the parent node', () => {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText4, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is after a sibling of the parent node', () => {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText5, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeB)
    })

    it('recursively returns the parent if needed', () => {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(this.nodeA)
    })

    it('returns undefined for a range that starts with an offset of 1', () => {
      this.range.setStart(this.nodeText2, 1)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined)
    })

    it('returns undefined for a range that starts with an offset of 1', () => {
      this.range.setStart(this.nodeText3, 0)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.$contenteditable[0])).toEqual(undefined)
    })
  })
})

function destructureNodes (node, obj) {
  Array.from(node.childNodes, (node) => {
    if (node.nodeType === nodeType.elementNode) {
      obj['node' + node.tagName] = node
      destructureNodes(node, obj)
    } else if (node.nodeType === nodeType.textNode) {
      obj['node' + node.nodeValue] = node
    }
  })
}

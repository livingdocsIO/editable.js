import {expect} from 'chai'
import {createElement, createRange} from '../src/util/dom'
import Keyboard from '../src/keyboard'
import * as nodeType from '../src/node-type'

describe('Keyboard', function () {

  describe('dispatchKeyEvent()', function () {
    let keyboard, event, called

    beforeEach(function () {
      const mockedSelectionWatcher = {
        getFreshRange: () => ({})
      }
      keyboard = new Keyboard(mockedSelectionWatcher)
      event = new Event('keydown')
      called = 0
    })

    it('notifies a left event', function () {
      keyboard.on('left', () => called++)

      event.keyCode = Keyboard.key.left
      keyboard.dispatchKeyEvent(event, {})
      expect(called).to.equal(1)
    })

    describe('notify "character" event', function () {

      it('does not fire the event for a "left" key', function () {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.left
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(0)
      })

      it('does not fire the event for a "ctrl" key', function () {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.ctrl
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(0)
      })

      it('does fire the event for a "e" key', function () {
        keyboard.on('character', () => called++)

        event.keyCode = 'e'.charCodeAt(0)
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })

      it('does not fire the event for a "e" key without the notifyCharacterEvent param', function () {
        keyboard.on('character', (evt) => called++)

        event.keyCode = 'e'.charCodeAt(0)
        keyboard.dispatchKeyEvent(event, {}, false)
        expect(called).to.equal(0)
      })

      it('does fire the event for a "b" key', function () {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.b
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })

      it('does fire the event for an "i" key', function () {
        keyboard.on('character', () => called++)

        event.keyCode = Keyboard.key.i
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })
    })

    describe('notify "bold" event', function () {

      it('does not fire the event for a "b" key without "ctrl" or "meta" key', function () {
        keyboard.on('bold', () => called++)

        event.keyCode = Keyboard.key.b
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(0)
      })

      it('does fire the event for a "b" key with "ctrl" key', function () {
        keyboard.on('bold', () => called++)

        event.keyCode = Keyboard.key.b
        event.ctrlKey = true
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })

      it('does fire the event for a "b" key with "meta" key', function () {
        keyboard.on('bold', () => called++)

        event.keyCode = Keyboard.key.b
        event.metaKey = true
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })
    })

    describe('notify "italic" event', function () {

      it('does not fire the event for a "i" key without "ctrl" or "meta" key', function () {
        keyboard.on('italic', () => called++)

        event.keyCode = Keyboard.key.i
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(0)
      })

      it('does fire the event for a "i" key with "ctrl" key', function () {
        keyboard.on('italic', () => called++)

        event.keyCode = Keyboard.key.i
        event.ctrlKey = true
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })

      it('does fire the event for a "i" key with "meta" key', function () {
        keyboard.on('italic', () => called++)

        event.keyCode = Keyboard.key.i
        event.metaKey = true
        keyboard.dispatchKeyEvent(event, {}, true)
        expect(called).to.equal(1)
      })
    })
  })

  describe('getNodeToRemove()', function () {

    beforeEach(function () {
      this.contenteditable = createElement('<CONTENTEDITABLE>Text1<A><B>Text2</B>Text3<C>Text4</C>Text5</A>Text6</CONTENTEDITABLE>')
      destructureNodes(this.contenteditable, this)
      this.range = createRange()
    })

    it('returns undefined for a ranga within a node', function () {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText2, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(undefined)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is outside of the parent node', function () {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText3, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(this.nodeB)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is within a sibling of the parent node', function () {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText4, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(this.nodeB)
    })

    it('returns the parent node of the start node when the start node is a text node with offset is 0 and end node is after a sibling of the parent node', function () {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText5, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(this.nodeB)
    })

    it('recursively returns the parent if needed', function () {
      this.range.setStart(this.nodeText2, 0)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(this.nodeA)
    })

    it('returns undefined for a range that starts with an offset of 1', function () {
      this.range.setStart(this.nodeText2, 1)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(undefined)
    })

    it('returns undefined for a range that starts with an offset of 1', function () {
      this.range.setStart(this.nodeText3, 0)
      this.range.setEnd(this.nodeText6, 2)
      expect(Keyboard.getNodeToRemove(this.range, this.contenteditable)).to.equal(undefined)
    })
  })
})

function destructureNodes (elem, obj) {
  Array.from(elem.childNodes, (node) => {
    if (node.nodeType === nodeType.elementNode) {
      obj[`node${node.tagName}`] = node
      destructureNodes(node, obj)
    } else if (node.nodeType === nodeType.textNode) {
      obj[`node${node.nodeValue}`] = node
    }
  })
}

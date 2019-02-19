import $ from 'jquery'
import rangy from 'rangy'

import Cursor from '../src/cursor'
import Editable from '../src/core'

describe('Default Events', () => {
  let $elem, editable, focus, blur

  // create a Cursor object and set the selection to it
  function createCursor (range) {
    const cursor = new Cursor($elem[0], range)
    cursor.setSelection()
    return cursor
  }

  function createRangeAtEnd (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    return range
  }

  let onListener
  // register one listener per test
  function on (eventName, func) {
    // off() // make sure the last listener is unregistered
    const obj = { calls: 0 }
    function proxy () {
      obj.calls += 1
      func.apply(this, arguments)
    }
    onListener = { event: eventName, listener: proxy }
    editable.on(eventName, proxy)
    return obj
  }

  // unregister the event listener registered with 'on'
  function off () {
    if (onListener) {
      editable.unload()
      onListener = undefined
    }
  }

  describe('for editable', () => {
    beforeEach(() => {
      $elem = $('<div contenteditable="true"></div>')
      $(document.body).append($elem)
      editable = new Editable()
      editable.add($elem)
      $elem.focus()
    })

    afterEach(() => {
      off()
      editable.dispatcher.off()
      $elem.remove()
    })

    describe('on focus', () => {
      beforeEach(() => {
        focus = $.Event('focus')
        blur = $.Event('blur')
      })

      it('always dispatches with virtual and native ranges in sync.', () => {
        // <div>foo\</div>
        $elem.html('foo')
        createCursor(createRangeAtEnd($elem[0]))

        const onFocus = on('focus', (element, selection) => {
          if (!selection) return
          expect(element).toEqual($elem[0])
          const range = selection.range
          const nativeRange = range.nativeRange
          expect(range.startContainer).toEqual(nativeRange.startContainer)
          expect(range.endContainer).toEqual(nativeRange.endContainer)
          expect(range.startOffset).toEqual(nativeRange.startOffset)
          expect(range.endOffset).toEqual(nativeRange.endOffset)
        })

        $elem.trigger(focus)
        $elem.trigger(blur)
        $elem.trigger(focus)
        expect(onFocus.calls).toEqual(2)
      })
    })
  })
})

import $ from 'jquery'
import rangy from 'rangy'

import Cursor from '../src/cursor'
import Editable from '../src/core'

describe('Default Events', function () {

  // create a Cursor object and set the selection to it
  function createCursor ($elem, range) {
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
  function on (editable, eventName, func) {
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
  function off (editable) {
    if (onListener) {
      editable.unload()
      onListener = undefined
    }
  }

  describe('for editable', function () {

    describe('on focus', function () {

      beforeEach(function () {
        this.focus = $.Event('focus')
        this.blur = $.Event('blur')
        this.$elem = $('<div />')
        $(document.body).append(this.$elem)
        this.editable = new Editable()
        this.editable.add(this.$elem)
        this.$elem.focus()
      })
      afterEach(function () {
        off(this.editable)
        this.editable.dispatcher.off()
        this.$elem.remove()
      })

      it('always dispatches with virtual and native ranges in sync.', function () {
        // <div>foo\</div>
        this.$elem.html('foo')
        createCursor(this.$elem, createRangeAtEnd(this.$elem[0]))

        const onFocus = on(this.editable, 'focus', (element, selection) => {
          if (!selection) return
          expect(element).toEqual(this.$elem[0])
          const range = selection.range
          const nativeRange = range.nativeRange
          expect(range.startContainer).toEqual(nativeRange.startContainer)
          expect(range.endContainer).toEqual(nativeRange.endContainer)
          expect(range.startOffset).toEqual(nativeRange.startOffset)
          expect(range.endOffset).toEqual(nativeRange.endOffset)
        })

        this.$elem.trigger(this.focus)
        this.$elem.trigger(this.blur)
        this.$elem.trigger(this.focus)
        expect(onFocus.calls).toEqual(2)
      })
    })
  })
})

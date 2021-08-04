import {expect} from 'chai'
import {createRange} from 'rangy'

import Cursor from '../src/cursor'
import {Editable} from '../src/core'

describe('Default Events', function () {

  // create a Cursor object and set the selection to it
  function createCursor (elem, range) {
    const cursor = new Cursor(elem, range)
    cursor.setVisibleSelection()
    return cursor
  }

  function createRangeAtEnd (node) {
    const range = createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    return range
  }

  // register one listener per test
  function on (editable, eventName, func) {
    // off() // make sure the last listener is unregistered
    const obj = {calls: 0}
    function proxy () {
      obj.calls += 1
      func.apply(this, arguments)
    }
    editable.on(eventName, proxy)
    return obj
  }

  describe('for editable', function () {

    describe('on focus', function () {

      beforeEach(function () {
        this.focus = new Event('focus')
        this.blur = new Event('blur')
        this.elem = document.createElement('div')
        document.body.appendChild(this.elem)
        this.editable = new Editable()
        this.editable.add(this.elem)
        this.elem.focus()
      })

      afterEach(function () {
        this.editable.unload()
        this.elem.remove()
      })

      it('always dispatches with virtual and native ranges in sync.', function () {
        // <div>foo\</div>
        this.elem.innerHTML = 'foo'
        createCursor(this.elem, createRangeAtEnd(this.elem))

        const onFocus = on(this.editable, 'focus', (element, selection) => {
          if (!selection) return
          expect(element).to.equal(this.elem)
          const range = selection.range
          const nativeRange = range.nativeRange
          expect(range.startContainer).to.equal(nativeRange.startContainer)
          expect(range.endContainer).to.equal(nativeRange.endContainer)
          expect(range.startOffset).to.equal(nativeRange.startOffset)
          expect(range.endOffset).to.equal(nativeRange.endOffset)
        })

        this.elem.dispatchEvent(this.focus)
        this.elem.dispatchEvent(this.blur)
        this.elem.dispatchEvent(this.focus)
        expect(onFocus.calls).to.equal(2)
      })
    })
  })
})

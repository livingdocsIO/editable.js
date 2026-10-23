import {expect} from 'chai'
import {createRange} from '../src/util/dom.js'

import Cursor from '../src/cursor.js'
import Selection from '../src/selection.js'
import {Editable} from '../src/core.js'

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
          expect(selection.range).to.be.an.instanceOf(Range)
        })

        this.elem.dispatchEvent(this.focus)
        this.elem.dispatchEvent(this.blur)
        this.elem.dispatchEvent(this.focus)
        expect(onFocus.calls).to.equal(2)
      })
    })

    describe('on blur', function () {

      beforeEach(function () {
        this.elem = document.createElement('div')
        document.body.appendChild(this.elem)
        this.editable = new Editable()
        this.editable.add(this.elem)
      })

      afterEach(function () {
        this.editable.unload()
        this.elem.remove()
      })

      // e.g. while the focus is in the url input of a link popover
      it('keeps a saved selection on the same text', function () {
        // the zero width no-break space of a Shift+Enter is removed on blur
        this.elem.innerHTML = 'First<br>﻿Some <em>lead</em> text'
        const range = createRange()
        range.selectNodeContents(this.elem.querySelector('em'))
        const selection = new Selection(this.elem, range)
        const coordinates = selection.getCoordinates()
        selection.save()

        this.elem.dispatchEvent(new Event('blur'))

        expect(this.elem.innerHTML).to.equal('First<br>Some <em>lead</em> text')
        expect(selection.text()).to.equal('lead')
        expect(selection.getCoordinates()).to.deep.equal(coordinates)
      })
    })
  })
})

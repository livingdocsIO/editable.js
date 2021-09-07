import {expect} from 'chai'
import rangy from 'rangy'

import * as content from '../src/content'
import Cursor from '../src/cursor'
import Keyboard from '../src/keyboard'
import {Editable} from '../src/core'
import Selection from '../src/selection'
const {key} = Keyboard

describe('Dispatcher', function () {
  let editable, elem

  // create a Cursor object and set the selection to it
  function createCursor (range) {
    const cursor = new Cursor(elem, range)
    cursor.setSelection()
    return cursor
  }

  function createRangeAtEnd (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    return range
  }

  function createRangeAtBeginning (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    range.collapse(true)
    return range
  }

  function createSelection (range) {
    const selection = new Selection(elem, range)
    selection.setSelection()
    return selection
  }

  function createFullRange (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    return range
  }

  // register one listener per test
  function on (eventName, func) {
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

    beforeEach(function () {
      elem = document.createElement('div')
      elem.setAttribute('contenteditable', true)
      document.body.appendChild(elem)
      editable = new Editable()
      editable.add(elem)
      elem.focus()
    })

    afterEach(function () {
      elem.remove()
      editable.unload()
    })

    describe('on focus', function () {
      it('should trigger the focus event', function () {
        elem.blur()
        const focus = on('focus', function (element) {
          expect(element).to.equal(elem)
        })
        elem.focus()
        expect(focus.calls).to.equal(1)
      })

      it('should contain an empty textnode', function () {
        elem.blur()
        expect(elem.textContent).to.equal('')
        elem.focus()
        expect(elem.textContent).to.equal('\uFEFF')
      })

      it('should not add an empty text node if there is content', function () {
        elem.blur()
        elem.appendChild(document.createTextNode('Hello'))
        elem.focus()
        expect(elem.textContent).to.equal('Hello')
      })

      it('removes the empty text node again on blur', function () {
        elem.focus()
        expect(elem.textContent).to.equal('\uFEFF')
        elem.blur()
        expect(elem.textContent).to.equal('')
      })
    })

    describe('on enter', function () {

      it('fires insert "after" if cursor is at the end', function () {
        // <div>foo\</div>
        elem.innerHTML = 'foo'
        createCursor(createRangeAtEnd(elem))

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).to.equal(elem)
          expect(direction).to.equal('after')
          expect(cursor.isCursor).to.equal(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).to.equal(1)
      })

      it('fires insert "before" if cursor is at the beginning', function () {
        // <div>|foo</div>
        elem.innerHTML = 'foo'
        const range = rangy.createRange()
        range.selectNodeContents(elem)
        range.collapse(true)
        createCursor(range)

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).to.equal(elem)
          expect(direction).to.equal('before')
          expect(cursor.isCursor).to.equal(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).to.equal(1)
      })

      it('fires "split" if cursor is in the middle', function () {
        // <div>ba|r</div>
        elem.innerHTML = 'bar'
        const range = rangy.createRange()
        range.setStart(elem.firstChild, 2)
        range.setEnd(elem.firstChild, 2)
        range.collapse()
        createCursor(range)

        const insert = on('split', (element, before, after, cursor) => {
          expect(element).to.equal(elem)
          expect(content.getInnerHtmlOfFragment(before)).to.equal('ba')
          expect(content.getInnerHtmlOfFragment(after)).to.equal('r')
          expect(cursor.isCursor).to.equal(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).to.equal(1)
      })
    })

    describe('on backspace', function () {

      it('fires "merge" if cursor is at the beginning', function (done) {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtBeginning(elem))

        on('merge', (element) => {
          expect(element).to.equal(elem)
          done()
        })

        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.backspace}))
      })

      it('fires "change" if cursor is not at the beginning', (done) => {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtEnd(elem))

        on('change', (element) => {
          expect(element).to.equal(elem)
          done()
        })

        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.backspace}))
      })
    })

    describe('on delete', function () {

      it('fires "merge" if cursor is at the end', (done) => {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtEnd(elem))

        on('merge', (element) => {
          expect(element).to.equal(elem)
          done()
        })

        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.delete}))
      })

      it('fires "change" if cursor is at the beginning', (done) => {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtBeginning(elem))
        on('change', () => done())
        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.delete}))
      })
    })

    describe('on keydown', function () {

      it('fires change when a character is pressed', (done) => {
        const evt = new KeyboardEvent('keydown', {keyCode: 'e'.charCodeAt(0)})
        on('change', () => done())
        elem.dispatchEvent(evt)
      })
    })

    describe('on newline', function () {

      function typeKeys (element, chars) {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        range.selectNodeContents(element)
        range.collapse(false)
        range.insertNode(document.createTextNode(chars))
        range.selectNodeContents(element)
        range.collapse(false)
      }

      function shiftReturn (element) {
        element.dispatchEvent(new KeyboardEvent('keydown', {
          shiftKey: true,
          keyCode: 13
        }))
      }

      it('fires newline when shift + enter is pressed', (done) => {
        on('newline', () => done())
        shiftReturn(elem)
        expect(elem.innerHTML).to.equal('<br>\uFEFF')
      })

      it('appends a zero-width space after the br tag to force a line break', () => {
        typeKeys(elem, 'foobar')
        shiftReturn(elem)
        expect(elem.innerHTML).to.equal(
          `\uFEFFfoobar<br>\uFEFF`
        )
      })

      it('does not append another zero-width space when one is present already', () => {
        typeKeys(elem, 'foobar')
        shiftReturn(elem)
        shiftReturn(elem)
        expect(elem.innerHTML).to.equal(
          `\uFEFFfoobar<br><br>\uFEFF`
        )
      })
    })

    describe('on bold', function () {

      it('fires toggleBold when ctrl + b is pressed', (done) => {
        elem.innerHTML = 'foo'
        const range = createFullRange(elem)
        createSelection(range)

        on('toggleBold', (selection) => {
          expect(selection.range.equals(range)).to.equal(true)
          done()
        })

        const evt = new KeyboardEvent('keydown', {ctrlKey: true, keyCode: key.b})
        elem.dispatchEvent(evt)
      })
    })

    describe('on italic', function () {

      it('fires toggleEmphasis when ctrl + i is pressed', (done) => {
        elem.innerHTML = 'foo'
        const range = createFullRange(elem)
        createSelection(range)

        on('toggleEmphasis', (selection) => {
          expect(selection.range.equals(range)).to.equal(true)
          done()
        })

        const evt = new KeyboardEvent('keydown', {ctrlKey: true, keyCode: key.i})
        elem.dispatchEvent(evt)
      })
    })

    describe('selectToBoundary event:', function () {

      it('fires "both" if all is selected', function () {
        elem.innerHTML = 'People Make The World Go Round'
        // select all
        const range = rangy.createRange()
        range.selectNodeContents(elem)
        createCursor(range)
        // listen for event
        let position
        editable.selectToBoundary(function (element, evt, pos) {
          position = pos
        })
        // trigger selectionchange event
        const selectionEvent = new Event('selectionchange', {bubbles: true})
        elem.dispatchEvent(selectionEvent)
        expect(position).to.equal('both')
      })

      it('fires "start" if selection is at beginning but not end', function () {
        elem.innerHTML = 'People Make The World Go Round'
        // select "People"
        const range = rangy.createRange()
        range.setStart(elem.firstChild, 0)
        range.setEnd(elem.firstChild, 5)
        createCursor(range)
        // listen for event
        let position
        editable.selectToBoundary(function (element, evt, pos) {
          position = pos
        })
        // trigger selectionchange event
        const selectionEvent = new Event('selectionchange', {bubbles: true})
        elem.dispatchEvent(selectionEvent)
        expect(position).to.equal('start')
      })

      it('fires "end" if selection is at end but not beginning', function () {
        elem.innerHTML = 'People Make The World Go Round'
        // select "Round"
        const range = rangy.createRange()
        range.setStart(elem.firstChild, 25)
        range.setEnd(elem.firstChild, 30)
        createCursor(range)
        // listen for event
        let position
        editable.selectToBoundary(function (element, evt, pos) {
          position = pos
        })
        // trigger selectionchange event
        const selectionEvent = new Event('selectionchange', {bubbles: true})
        elem.dispatchEvent(selectionEvent)
        expect(position).to.equal('end')
      })
    })
  })
})

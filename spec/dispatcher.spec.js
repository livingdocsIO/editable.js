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
          expect(element).toEqual(elem)
        })
        elem.focus()
        expect(focus.calls).toBe(1)
      })

      it('should contain an empty textnode', function () {
        elem.blur()
        expect(elem.textContent).toEqual('')
        elem.focus()
        expect(elem.textContent).toEqual('\u0000')
      })

      it('should not add an empty text node if there is content', function () {
        elem.blur()
        elem.appendChild(document.createTextNode('Hello'))
        elem.focus()
        expect(elem.textContent).toEqual('Hello')
      })

      it('removes the empty text node again on blur', function () {
        elem.focus()
        expect(elem.textContent).toEqual('\u0000')
        elem.blur()
        expect(elem.textContent).toEqual('')
      })
    })

    describe('on enter', function () {

      it('fires insert "after" if cursor is at the end', function () {
        // <div>foo\</div>
        elem.innerHTML = 'foo'
        createCursor(createRangeAtEnd(elem))

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).toEqual(elem)
          expect(direction).toEqual('after')
          expect(cursor.isCursor).toEqual(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).toEqual(1)
      })

      it('fires insert "before" if cursor is at the beginning', function () {
        // <div>|foo</div>
        elem.innerHTML = 'foo'
        const range = rangy.createRange()
        range.selectNodeContents(elem)
        range.collapse(true)
        createCursor(range)

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).toEqual(elem)
          expect(direction).toEqual('before')
          expect(cursor.isCursor).toEqual(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).toEqual(1)
      })

      it('fires merge if cursor is in the middle', function () {
        // <div>fo|o</div>
        elem.innerHTML = 'foo'
        const range = rangy.createRange()
        range.setStart(elem.firstChild, 2)
        range.setEnd(elem.firstChild, 2)
        createCursor(range)

        const insert = on('split', (element, before, after, cursor) => {
          expect(element).toEqual(elem)
          expect(content.getInnerHtmlOfFragment(before)).toEqual('fo')
          expect(content.getInnerHtmlOfFragment(after)).toEqual('o')
          expect(cursor.isCursor).toEqual(true)
        })

        const evt = new KeyboardEvent('keydown', {keyCode: key.enter})
        elem.dispatchEvent(evt)
        expect(insert.calls).toEqual(1)
      })
    })

    describe('on backspace', function () {

      it('fires "merge" if cursor is at the beginning', function (done) {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtBeginning(elem))

        on('merge', (element) => {
          expect(element).toEqual(elem)
          done()
        })

        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.backspace}))
      })

      it('fires "change" if cursor is not at the beginning', (done) => {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtEnd(elem))

        on('change', (element) => {
          expect(element).toEqual(elem)
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
          expect(element).toEqual(elem)
          done()
        })

        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.delete}))
      })

      it('fires "change" if cursor is at the beginning', (done) => {
        elem.innerHTML = 'foo'
        createCursor(createRangeAtBeginning(elem))
        on('change', done)
        elem.dispatchEvent(new KeyboardEvent('keydown', {keyCode: key.delete}))
      })
    })

    describe('on keydown', function () {

      it('fires change when a character is pressed', (done) => {
        const evt = new KeyboardEvent('keydown', {keyCode: 'e'.charCodeAt(0)})
        on('change', done)
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
        on('newline', done)
        shiftReturn(elem)
        expect(elem.innerHTML).toEqual('<br>\u0000')
      })

      it('creates a nested br element with a data-editable="unwrap" attribute', () => {
        typeKeys(elem, 'foobar')
        shiftReturn(elem)
        expect(elem.innerHTML).toEqual(
          `\u0000` +
          `foobar` +
          `<span data-editable="unwrap">` +
            `<br><span data-editable="remove" contenteditable="false">\u0000</span>` +
          `</span>`
        )
      })

      it('removes the nested br element when adding a newline afterwards', () => {
        typeKeys(elem, 'foobar')
        shiftReturn(elem)
        shiftReturn(elem)
        expect(elem.innerHTML).toEqual(
          `\u0000` +
          `foobar` +
          // this is the nested br element that got unwrapped
          `<br>` +
          // This is the new nested newline of the second shift + return
          `<span data-editable="unwrap">` +
            `<br><span data-editable="remove" contenteditable="false">\u0000</span>` +
          `</span>`
        )
      })
    })

    describe('on bold', function () {

      it('fires toggleBold when ctrl + b is pressed', (done) => {
        elem.innerHTML = 'foo'
        const elemSelection = createSelection(createFullRange(elem))

        on('toggleBold', (selection) => {
          expect(selection).toEqual(elemSelection)
          done()
        })

        const evt = new KeyboardEvent('keydown', {ctrlKey: true, keyCode: key.b})
        elem.dispatchEvent(evt)
      })
    })

    describe('on italic', function () {

      it('fires toggleEmphasis when ctrl + i is pressed', (done) => {
        elem.innerHTML = 'foo'
        const elemSelection = createSelection(createFullRange(elem))

        on('toggleEmphasis', (selection) => {
          expect(selection).toEqual(elemSelection)
          done()
        })

        const evt = new KeyboardEvent('keydown', {ctrlKey: true, keyCode: key.i})
        elem.dispatchEvent(evt)
      })
    })
  })
})

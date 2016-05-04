import $ from 'jquery'
import rangy from 'rangy'

import * as content from '../src/content'
import Cursor from '../src/cursor'
import Keyboard from '../src/keyboard'
import Editable from '../src/core'
const { key } = Keyboard

describe('Dispatcher', () => {
  let $elem, editable, event

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

  function createRangeAtBeginning (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    range.collapse(true)
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

    describe('on Enter', () => {
      beforeEach(() => {
        event = $.Event('keydown')
        event.keyCode = key.enter
      })

      it('fires insert "after" if cursor is at the end', () => {
        // <div>foo\</div>
        $elem.html('foo')
        createCursor(createRangeAtEnd($elem[0]))

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).toEqual($elem[0])
          expect(direction).toEqual('after')
          expect(cursor.isCursor).toEqual(true)
        })

        $elem.trigger(event)
        expect(insert.calls).toEqual(1)
      })

      it('fires insert "before" if cursor is at the beginning', () => {
        // <div>|foo</div>
        $elem.html('foo')
        var range = rangy.createRange()
        range.selectNodeContents($elem[0])
        range.collapse(true)
        createCursor(range)

        const insert = on('insert', (element, direction, cursor) => {
          expect(element).toEqual($elem[0])
          expect(direction).toEqual('before')
          expect(cursor.isCursor).toEqual(true)
        })

        $elem.trigger(event)
        expect(insert.calls).toEqual(1)
      })

      it('fires merge if cursor is in the middle', () => {
        // <div>fo|o</div>
        $elem.html('foo')
        const range = rangy.createRange()
        range.setStart($elem[0].firstChild, 2)
        range.setEnd($elem[0].firstChild, 2)
        createCursor(range)

        const insert = on('split', (element, before, after, cursor) => {
          expect(element).toEqual($elem[0])
          expect(content.getInnerHtmlOfFragment(before)).toEqual('fo')
          expect(content.getInnerHtmlOfFragment(after)).toEqual('o')
          expect(cursor.isCursor).toEqual(true)
        })

        $elem.trigger(event)
        expect(insert.calls).toEqual(1)
      })
    })

    describe('on backspace', () => {
      beforeEach(() => {
        event = $.Event('keydown')
        event.keyCode = key.backspace
      })

      it('fires "merge" if cursor is at the beginning', function (done) {
        $elem.html('foo')
        createCursor(createRangeAtBeginning($elem[0]))

        on('merge', (element) => {
          expect(element).toEqual($elem[0])
          done()
        })

        $elem.trigger(event)
      })

      it('fires "change" if cursor is not at the beginning', (done) => {
        $elem.html('foo')
        createCursor(createRangeAtEnd($elem[0]))

        on('change', (element) => {
          expect(element).toEqual($elem[0])
          done()
        })

        $elem.trigger(event)
      })
    })

    describe('on delete', () => {
      beforeEach(() => {
        event = $.Event('keydown')
        event.keyCode = key['delete']
      })

      it('fires "merge" if cursor is at the end', (done) => {
        $elem.html('foo')
        createCursor(createRangeAtEnd($elem[0]))

        on('merge', (element) => {
          expect(element).toEqual($elem[0])
          done()
        })

        $elem.trigger(event)
      })

      it('fires "change" if cursor is at the beginning', (done) => {
        $elem.html('foo')
        createCursor(createRangeAtBeginning($elem[0]))
        on('change', done)
        $elem.trigger(event)
      })
    })

    describe('on keydown', () => {
      beforeEach(() => {
        event = $.Event('keydown')
      })

      it('fires change when a character is pressed', (done) => {
        event.keyCode = 'e'.charCodeAt(0)
        on('change', done)
        $elem.trigger(event)
      })
    })
  })
})

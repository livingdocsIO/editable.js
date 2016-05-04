import $ from 'jquery'
import rangy from 'rangy'

import * as content from '../src/content'
import Cursor from '../src/cursor'
import * as config from '../src/config'

describe('Cursor', function () {
  it('is defined', () => {
    expect(Cursor).toBeDefined()
  })

  describe('instantiation', () => {
    beforeEach(() => {
      const range = rangy.createRange()
      this.$elem = $('<div>')
      this.cursor = new Cursor(this.$elem, range)
    })

    it('creates an instance from a jQuery element', () => {
      expect(this.cursor.host).toEqual(this.$elem[0])
    })

    it('sets a reference to window', () => {
      expect(this.cursor.win).toEqual(window)
    })
  })

  describe('with a collapsed range at the end', () => {
    beforeEach(() => {
      this.oneWord = $('<div class="' + config.editableClass + '">foobar</div>')[0]
      this.range = rangy.createRange()
      this.range.selectNodeContents(this.oneWord)
      this.range.collapse(false)
      this.cursor = new Cursor(this.oneWord, this.range)
    })

    it('sets #isCursor to true', () => {
      expect(this.cursor.isCursor).toBe(true)
    })

    it('has a valid range', () => {
      expect(this.range.collapsed).toBe(true)
      expect(this.range.startContainer).toEqual(this.oneWord)
      expect(this.range.endContainer).toEqual(this.oneWord)
      expect(this.range.startOffset).toEqual(1)
      expect(this.range.endOffset).toEqual(1)
    })

    describe('isAtEnd()', () => {
      it('is true', () => {
        expect(this.cursor.isAtEnd()).toBe(true)
      })
    })

    describe('isAtBeginning()', () => {
      it('is false', () => {
        expect(this.cursor.isAtBeginning()).toBe(false)
      })
    })

    describe('save() and restore()', () => {
      it('saves and restores the cursor', () => {
        this.cursor.save()

        // move the cursor so we can check the restore method.
        this.cursor.moveAtBeginning()
        expect(this.cursor.isAtBeginning()).toBe(true)

        this.cursor.restore()
        expect(this.cursor.isAtEnd()).toBe(true)
      })
    })

    describe('insertAfter()', () => {
      it('can deal with an empty documentFragment', () => {
        function test () {
          const frag = window.document.createDocumentFragment()
          this.cursor.insertAfter(frag)
        }

        expect($.proxy(test, this)).not.toThrow()
      })
    })

    describe('insertBefore()', () => {
      it('can deal with an empty documentFragment', () => {
        function test () {
          const frag = window.document.createDocumentFragment()
          this.cursor.insertBefore(frag)
        }
        expect($.proxy(test, this)).not.toThrow()
      })
    })

    describe('before()', () => {
      it('gets the content before', () => {
        const fragment = this.cursor.before()
        expect(content.getInnerHtmlOfFragment(fragment)).toEqual('foobar')
      })
    })

    describe('beforeHtml()', () => {
      it('gets the content before', () => {
        expect(this.cursor.beforeHtml()).toEqual('foobar')
      })
    })

    describe('after()', () => {
      it('gets the content after', () => {
        var fragment = this.cursor.after()
        expect(content.getInnerHtmlOfFragment(fragment)).toEqual('')
      })
    })

    describe('afterHtml()', () => {
      it('gets the content before', () => {
        expect(this.cursor.afterHtml()).toEqual('')
      })
    })
  })
})

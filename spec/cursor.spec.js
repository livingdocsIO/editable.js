import {expect} from 'chai'
import {createRange, createElement} from '../src/util/dom.js'

import * as content from '../src/content.js'
import Cursor from '../src/cursor.js'
import config from '../src/config.js'

describe('Cursor', function () {

  it('is defined', function () {
    expect(Cursor).not.to.equal(undefined)
  })

  describe('instantiation', function () {

    beforeEach(function () {
      const range = createRange()
      this.elem = document.createElement('div')
      this.cursor = new Cursor(this.elem, range)
    })

    it('creates an instance from a jQuery element', function () {
      expect(this.cursor.host).to.equal(this.elem)
    })

    it('sets a reference to window', function () {
      expect(this.cursor.win).to.equal(window)
    })
  })

  describe('with a collapsed range at the end', function () {

    beforeEach(function () {
      this.oneWord = createElement(`<div class="${config.editableClass}">foobar</div>`)
      this.range = createRange()
      this.range.selectNodeContents(this.oneWord)
      this.range.collapse(false)
      this.cursor = new Cursor(this.oneWord, this.range)
    })

    it('sets #isCursor to true', function () {
      expect(this.cursor.isCursor).to.equal(true)
    })

    it('has a valid range', function () {
      expect(this.range.collapsed).to.equal(true)
      expect(this.range.startContainer).to.equal(this.oneWord)
      expect(this.range.endContainer).to.equal(this.oneWord)
      expect(this.range.startOffset).to.equal(1)
      expect(this.range.endOffset).to.equal(1)
    })

    describe('isAtTextEnd()', function () {

      it('returns true when at text end', function () {
        expect(this.cursor.isAtTextEnd()).to.equal(true)
      })
    })

    describe('isAtEnd()', function () {

      it('is true', function () {
        expect(this.cursor.isAtEnd()).to.equal(true)
      })
    })

    describe('isAtBeginning()', function () {

      it('is false', function () {
        expect(this.cursor.isAtBeginning()).to.equal(false)
      })
    })

    describe('save() and restore()', function () {

      it('saves and restores the cursor', function () {
        this.cursor.save()

        // move the cursor so we can check the restore method.
        this.cursor.moveAtBeginning()
        expect(this.cursor.isAtBeginning()).to.equal(true)
        expect(this.cursor.isAtTextEnd()).to.equal(false)

        this.cursor.restore()
        expect(this.cursor.isAtEnd()).to.equal(true)
      })
    })

    describe('insertAfter()', function () {

      it('can deal with an empty documentFragment', function () {
        expect(() => {
          const frag = window.document.createDocumentFragment()
          this.cursor.insertAfter(frag)
        }).not.to.throw()
      })
    })

    describe('insertBefore()', function () {

      it('can deal with an empty documentFragment', function () {
        expect(() => {
          const frag = window.document.createDocumentFragment()
          this.cursor.insertBefore(frag)
        }).not.to.throw()
      })
    })

    describe('before()', function () {

      it('gets the content before', function () {
        const fragment = this.cursor.before()
        expect(content.getInnerHtmlOfFragment(fragment)).to.equal('foobar')
      })
    })

    describe('textBefore()', function () {

      it('gets the text before', function () {
        const textBefore = this.cursor.textBefore()
        expect(textBefore).to.equal('foobar')
      })
    })

    describe('beforeHtml()', function () {

      it('gets the content before', function () {
        expect(this.cursor.beforeHtml()).to.equal('foobar')
      })
    })

    describe('after()', function () {

      it('gets the content after', function () {
        const fragment = this.cursor.after()
        expect(content.getInnerHtmlOfFragment(fragment)).to.equal('')
      })
    })

    describe('textAfter()', function () {

      it('gets the text after', function () {
        const textAfter = this.cursor.textAfter()
        expect(textAfter).to.equal('')
      })
    })

    describe('afterHtml()', function () {

      it('gets the content before', function () {
        expect(this.cursor.afterHtml()).to.equal('')
      })
    })

    describe('getInnerTags', function () {

      it('gets the inner tags covered by the cursor', function () {
        expect(this.cursor.getInnerTags()).to.deep.equal([])
      })
    })

    describe('getAncestorTags', function () {

      it('gets all ancestor tags of the cursor', function () {
        expect(this.cursor.getAncestorTags()).to.deep.equal([])
      })
    })
  })
})

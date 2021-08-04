import {expect} from 'chai'
import rangy from 'rangy'

import Selection from '../src/selection'
import Cursor from '../src/cursor'
import config from '../src/config'
import {createElement} from '../src/util/dom'

describe('Selection', function () {

  it('should be defined', function () {
    expect(Selection).to.be.a('function')
  })

  describe('insertCharacter()', function () {

    beforeEach(function () {
      this.div = createElement('<div>f</div>')
      const range = rangy.createRange()
      range.selectNodeContents(this.div)
      this.selection = new Selection(this.div, range)
    })

    it('returns a cursor', function () {
      const cursor = this.selection.insertCharacter('x')
      expect(cursor.isCursor).to.equal(true)
    })

    it('replaces the selection with the character', function () {
      this.selection.insertCharacter('x')
      expect(this.div.innerHTML).to.equal('x')
    })

    it('inserts the text before the cursor', function () {
      const cursor = this.selection.insertCharacter('x')
      expect(cursor.beforeHtml()).to.equal('x')
    })

    it('inserts an emoji', function () {
      this.selection.insertCharacter('😘')
      expect(this.div.innerHTML).to.equal('😘')
    })
  })

  describe('removeChars()', function () {

    it('removes multiple characters', function () {
      this.div = createElement('<div>«Foo "bar" foo»</div>')
      const range = rangy.createRange()
      range.selectNodeContents(this.div)
      this.selection = new Selection(this.div, range)

      this.selection.removeChars(['«', '»', '"'])
      expect(this.div.innerHTML).to.equal('Foo bar foo')
    })
  })

  describe('textBefore() / textAfter()', function () {

    beforeEach(function () {
      // <div>a|b|c</div>
      const host = createElement('<div>abc</div>')
      const range = rangy.createRange()
      range.setStart(host.firstChild, 1)
      range.setEnd(host.firstChild, 2)

      this.selection = new Selection(host, range)
    })

    it('returns the text before', function () {
      const textBefore = this.selection.textBefore()
      expect(textBefore).to.equal('a')
    })

    it('returns the text after', function () {
      const textAfter = this.selection.textAfter()
      expect(textAfter).to.equal('c')
    })
  })

  describe('with a range', function () {

    beforeEach(function () {
      this.oneWord = createElement('<div>foobar</div>')
      const range = rangy.createRange()
      range.selectNodeContents(this.oneWord)
      this.selection = new Selection(this.oneWord, range)
    })

    it('sets a reference to window', function () {
      expect(this.selection.win).to.equal(window)
    })

    it('sets #isSelection to true', function () {
      expect(this.selection.isSelection).to.equal(true)
    })

    describe('isAllSelected()', function () {

      it('returns true if all is selected', function () {
        expect(this.selection.isAllSelected()).to.equal(true)
      })

      it('returns true if all is selected', function () {
        const textNode = this.oneWord.firstChild
        let range = rangy.createRange()
        range.setStartBefore(textNode)
        range.setEnd(textNode, 6)
        let selection = new Selection(this.oneWord, range)
        expect(selection.isAllSelected()).to.equal(true)

        range = rangy.createRange()
        range.setStartBefore(textNode)
        range.setEnd(textNode, 5)
        selection = new Selection(this.oneWord, range)
        expect(selection.isAllSelected()).to.equal(false)
      })
    })

    describe('custom:', function () {

      beforeEach(function () {
        this.customElement = {tagName: 'span', attributes: {class: 'foo'}}
      })

      it('makes the selection custom tag with the configured attributes', function () {
        this.selection.makeCustom(this.customElement)
        const customTags = this.selection.getTagsByName(this.customElement.tagName)
        const html = getHtml(customTags[0])
        expect(html).to.equal('<span class="foo">foobar</span>')
      })

      it('toggles the custom selection', function () {
        this.selection.makeCustom(this.customElement)
        this.selection.toggleCustom(this.customElement)
        const customTags = this.selection.getTagsByName(this.customElement.tagName)
        expect(customTags.length).to.equal(0)
      })
    })

    describe('bold:', function () {

      beforeEach(function () {
        this.oldBoldMarkup = config.boldMarkup
        config.boldMarkup = {
          type: 'tag',
          name: 'strong',
          attribs: {
            'class': 'foo'
          }
        }
      })

      afterEach(function () {
        config.boldMarkup = this.oldBoldMarkup
      })

      it('makes the selection bold with the configured class', function () {
        this.selection.makeBold()
        const boldTags = this.selection.getTagsByName('strong')
        const html = getHtml(boldTags[0])
        expect(html).to.equal('<strong class="foo">foobar</strong>')
      })

      it('toggles the bold selection', function () {
        this.selection.makeBold()
        this.selection.toggleBold()
        const boldTags = this.selection.getTagsByName('strong')
        expect(boldTags.length).to.equal(0)
      })
    })

    describe('italic:', function () {
      beforeEach(function () {
        this.oldItalicMarkup = config.italicMarkup
        config.italicMarkup = {
          type: 'tag',
          name: 'em',
          attribs: {
            'class': 'bar'
          }
        }
      })

      afterEach(function () {
        config.italicMarkup = this.oldItalicMarkup
      })

      it('makes the selection italic with the configured class', function () {
        this.selection.giveEmphasis()
        const emphasisTags = this.selection.getTagsByName('em')
        const html = getHtml(emphasisTags[0])
        expect(html).to.equal('<em class="bar">foobar</em>')
      })

      it('toggles the italic selection', function () {
        this.selection.giveEmphasis()
        this.selection.toggleEmphasis()
        const emphasisTags = this.selection.getTagsByName('em')
        expect(emphasisTags.length).to.equal(0)
      })
    })

    describe('underline:', function () {

      beforeEach(function () {
        this.oldUnderlineMarkup = config.underlineMarkup
        config.underlineMarkup = {
          type: 'tag',
          name: 'u',
          attribs: {
            'class': 'bar'
          }
        }
      })

      afterEach(function () {
        config.underlineMarkup = this.oldUnderlineMarkup
      })

      it('makes the selection underline with the configured class', function () {
        this.selection.makeUnderline()
        const underlineTags = this.selection.getTagsByName('u')
        const html = getHtml(underlineTags[0])
        expect(html).to.equal('<u class="bar">foobar</u>')
      })

      it('toggles the underline selection', function () {
        this.selection.makeUnderline()
        this.selection.toggleUnderline()
        const underlineTags = this.selection.getTagsByName('u')
        expect(underlineTags.length).to.equal(0)
      })
    })

    describe('links:', function () {
      beforeEach(function () {
        this.oldLinkMarkup = config.italicMarkup
        config.linkMarkup = {
          type: 'tag',
          name: 'a',
          attribs: {
            'class': 'foo bar'
          }
        }
      })

      afterEach(function () {
        config.linkMarkup = this.oldLinkMarkup
      })

      it('sets a link with the configured class', function () {
        this.selection.link('https://livingdocs.io')
        const linkTags = this.selection.getTagsByName('a')
        const html = getHtml(linkTags[0])
        expect(html).to.equal('<a class="foo bar" href="https://livingdocs.io">foobar</a>')
      })

      it('toggles a link', function () {
        this.selection.link('https://livingdocs.io')
        this.selection.toggleLink()
        const linkTags = this.selection.getTagsByName('a')
        expect(linkTags.length).to.equal(0)
      })

      it('removes a link', function () {
        this.selection.link('https://livingdocs.io')
        this.selection.unlink()
        const linkTags = this.selection.getTagsByName('a')
        expect(linkTags.length).to.equal(0)
      })
    })

  })

  describe('inherits form Cursor', function () {

    it('has isAtEnd() method from Cursor in its protoype chain', function () {
      expect(Selection.prototype.hasOwnProperty('isAtEnd')).to.equal(false)
      expect(Cursor.prototype.hasOwnProperty('isAtEnd')).to.equal(true)
      expect('isAtEnd' in Selection.prototype).to.equal(true)
    })
  })
})

const getHtml = function (tag) {
  const testTag = window.document.createElement('div')
  testTag.appendChild(tag)
  return testTag.innerHTML
}

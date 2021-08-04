import {expect} from 'chai'
import {createRange} from 'rangy'

import * as parser from '../src/parser'
import config from '../src/config'
import {createElement} from '../src/util/dom'

describe('Parser', function () {
  // helper methods
  function createRangyCursorAfter (node) {
    const range = createRange()
    range.setStartAfter(node)
    range.setEndAfter(node)
    return range
  }

  function createRangyCursorAtEnd (node) {
    const range = createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    return range
  }

  // test elements
  const empty = createElement('<div></div>')
  const linebreak = createElement('<div><br></div>')
  const emptyWithWhitespace = createElement('<div> </div>')
  const singleCharacter = createElement('<div>a</div>')
  const oneWord = createElement('<div>foobar</div>')
  const oneWordWithWhitespace = createElement('<div> foobar </div>')
  const oneWordWithNbsp = createElement('<div>&nbsp;foobar&nbsp;</div>')
  const textNode = oneWord.firstChild
  const text = createElement('<div>foo bar.</div>')
  const textWithLink = createElement('<div>foo <a href="#">bar</a>.</div>')
  const linkWithWhitespace = createElement('<div><a href="#">bar</a> </div>')
  const link = createElement('<div><a href="#">foo bar</a></div>')
  const linkWithSpan = createElement('<div><a href="#">foo <span class="important">bar</span></a></div>')

  describe('getHost()', function () {

    beforeEach(function () {
      this.host = createElement(`<div class="${config.editableClass}""></div>`)
    })

    it('works if host is passed', function () {
      expect(parser.getHost(this.host)).to.equal(this.host)
    })

    it('works if a child of host is passed', function () {
      this.host.innerHTML = 'a<em>b</em>'
      expect(parser.getHost(this.host.querySelector('em'))).to.equal(this.host)
    })

    it('works if a text node is passed', function () {
      this.host.innerHTML = 'a<em>b</em>'
      expect(parser.getHost(this.host.firstChild)).to.equal(this.host)
    })
  })

  describe('getNodeIndex()', function () {

    it('gets element index of link in text', function () {
      const linkNode = textWithLink.querySelector('a')
      expect(parser.getNodeIndex(linkNode)).to.equal(1)
    })
  })

  describe('isVoid()', function () {

    it('detects an empty node', function () {
      expect(empty.childNodes.length).to.equal(0)
      expect(parser.isVoid(empty)).to.equal(true)
    })

    it('detects an non-empty node', function () {
      expect(emptyWithWhitespace.childNodes.length).to.equal(1)
      expect(parser.isVoid(emptyWithWhitespace)).to.equal(false)
    })
  })

  describe('isWhitespaceOnly()', function () {

    it('works with void element', function () {
      const node = document.createTextNode('')
      expect(parser.isWhitespaceOnly(node)).to.equal(true)
    })

    it('works with single whitespace', function () {
      expect(parser.isWhitespaceOnly(emptyWithWhitespace.firstChild)).to.equal(true)
    })

    it('works with a single character', function () {
      expect(parser.isWhitespaceOnly(singleCharacter.firstChild)).to.equal(false)
    })

    it('ignores whitespace after the last element', function () {
      expect(parser.isWhitespaceOnly(link.firstChild)).to.equal(false)
    })
  })

  describe('lastOffsetWithContent()', function () {

    describe('called with a text node', function () {

      it('works for single character', function () {
        // <div>a|</div>
        expect(parser.lastOffsetWithContent(singleCharacter.firstChild)).to.equal(1)
      })

      it('works with a single word text node', function () {
        // <div>foobar|</div>
        expect(parser.lastOffsetWithContent(oneWord.firstChild)).to.equal(6)
      })

      it('works with a single word text node with whitespace', function () {
        // <div> foobar| </div>
        expect(parser.lastOffsetWithContent(oneWordWithWhitespace.firstChild)).to.equal(7)
      })
    })

    describe('called with an element node', function () {
      it('works with an empty tag', function () {
        // <div></div>
        expect(parser.lastOffsetWithContent(empty)).to.equal(0)
      })

      it('works with a single character', function () {
        // <div>a</div>
        expect(parser.lastOffsetWithContent(singleCharacter)).to.equal(1)
      })

      it('works with whitespace after last tag', function () {
        // <div><a href="#">bar</a> </div>
        expect(parser.lastOffsetWithContent(linkWithWhitespace)).to.equal(1)
      })

      it('works with whitespace after last tag', function () {
        // <div>foo <a href="#">bar</a>.</div>
        expect(parser.lastOffsetWithContent(textWithLink)).to.equal(3)
      })
    })
  })

  describe('isEndOffset()', function () {

    it('works for single child node', function () {
      // <div>foobar|</div>
      const range = createRangyCursorAfter(oneWord.firstChild)
      expect(range.endOffset).to.equal(1)
      expect(parser.isEndOffset(oneWord, 1)).to.equal(true)
    })

    it('works for empty node', function () {
      // <div>|</div>
      const range = createRangyCursorAtEnd(empty)
      expect(parser.isEndOffset(empty, range.endOffset)).to.equal(true)
    })

    it('works with a text node', function () {
      // foobar|
      expect(parser.isEndOffset(textNode, 6)).to.equal(true)

      // fooba|r
      expect(parser.isEndOffset(textNode, 5)).to.equal(false)
    })

    it('works with whitespace at the end', function () {
      // <div> foobar| </div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 7)).to.equal(false)
      // <div> foobar |</div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 8)).to.equal(true)
    })

    it('works with text and element nodes', function () {
      // <div>foo <a href='#'>bar</a>.|</div>
      let range = createRangyCursorAfter(textWithLink.childNodes[2])
      expect(range.endOffset).to.equal(3)
      expect(parser.isEndOffset(textWithLink, 3)).to.equal(true)

      // <div>foo <a href='#'>bar</a>|.</div>
      range = createRangyCursorAfter(textWithLink.childNodes[1])
      expect(range.endOffset).to.equal(2)
      expect(parser.isEndOffset(textWithLink, 2)).to.equal(false)
    })
  })

  describe('isTextEndOffset()', function () {

    it('ignores whitespace at the end', function () {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 6)).to.equal(false)
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 7)).to.equal(true)
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 8)).to.equal(true)
    })

    it('ignores non-breaking-space at the end', function () {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 6)).to.equal(false)
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 7)).to.equal(true)
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 8)).to.equal(true)
    })

    it('ignores whitespace after the last element', function () {
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 2)).to.equal(false)
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 3)).to.equal(true)
    })

    it('ignores whitespace after the last element', function () {
      // <div><a href="#">bar|</a> </div>
      const range = createRangyCursorAfter(linkWithWhitespace.firstChild.firstChild)
      expect(range.endOffset).to.equal(1)
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 1)).to.equal(true)
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 0)).to.equal(false)
    })

    it('ignores whitespace after the last element', function () {
      // <div><a href="#">bar</a>| </div>
      const range = createRangyCursorAfter(linkWithWhitespace.firstChild)
      expect(range.endOffset).to.equal(1)
      expect(parser.isTextEndOffset(linkWithWhitespace, 1)).to.equal(true)
      expect(parser.isTextEndOffset(linkWithWhitespace, 0)).to.equal(false)
    })

    it('ignores a linebreak', function () {
      // <div>|<br></div>
      const range = createRange()
      range.selectNodeContents(linebreak)
      range.collapse(true)
      expect(range.endOffset).to.equal(0)
      expect(parser.isTextEndOffset(linebreak, 0)).to.equal(true)
    })
  })

  describe('isStartOffset()', function () {

    it('works for single child node', function () {
      // <div>|foobar</div>
      expect(parser.isStartOffset(oneWord, 0)).to.equal(true)
    })

    it('works for empty node', function () {
      // <div>|</div>
      expect(parser.isStartOffset(empty, 0)).to.equal(true)
    })

    it('works with a text node', function () {
      // |foobar
      expect(parser.isStartOffset(textNode, 0)).to.equal(true)

      // f|oobar
      expect(parser.isStartOffset(textNode, 1)).to.equal(false)
    })

    it('works with whitespace at the beginning', function () {
      // <div> |foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 1)).to.equal(false)
      // <div>| foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 0)).to.equal(true)
    })

    it('works with text and element nodes', function () {
      // <div>|foo <a href='#'>bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 0)).to.equal(true)

      // <div>foo <a href='#'>|bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 1)).to.equal(false)
    })
  })

  describe('isEndOfHost()', function () {

    it('works with text node in nested content', function () {
      const endContainer = linkWithSpan.querySelector('span').firstChild
      // <div><a href='#'>foo <span class='important'>bar|</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 3)).to.equal(true)

      // <div><a href='#'>foo <span class='important'>ba|r</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).to.equal(false)
    })

    it('works with link node in nested content', function () {
      // <div><a href='#'>foo <span class='important'>bar</span>|</a></div>
      const endContainer = linkWithSpan.querySelector('a')
      const range = createRangyCursorAtEnd(endContainer)
      expect(range.endOffset).to.equal(2)
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).to.equal(true)

      // <div><a href='#'>foo |<span class='important'>bar</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 1)).to.equal(false)
    })

    it('works with single text node', function () {
      // <div>foobar|</div>
      const endContainer = oneWord.firstChild
      expect(parser.isEndOfHost(oneWord, endContainer, 6)).to.equal(true)
      expect(parser.isEndOfHost(oneWord, endContainer, 5)).to.equal(false)
    })
  })

  describe('isBeginningOfHost()', function () {

    it('works with link node in nested content', function () {
      const endContainer = linkWithSpan.querySelector('a')
      // <div><a href='#'>|foo <span class='important'>bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 0)).to.equal(true)

      // <div><a href='#'>foo <span class='important'>|bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 1)).to.equal(false)
    })

    it('works with single text node', function () {
      const endContainer = oneWord.firstChild
      // <div>|foobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 0)).to.equal(true)

      // <div>f|oobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 1)).to.equal(false)
    })
  })

  describe('isSameNode()', function () {

    it('fails when tags are different', function () {
      const source = text.firstChild
      const target = link.firstChild
      expect(parser.isSameNode(target, source)).to.equal(false)
    })

    it('fails when attributes are different', function () {
      const source = link.firstChild
      const target = link.firstChild.cloneNode(true)
      target.setAttribute('key', 'value')
      expect(parser.isSameNode(target, source)).to.equal(false)
    })

    it('works when nodes have same tag and attributes', function () {
      const source = link.firstChild
      const target = link.firstChild.cloneNode(true)
      expect(parser.isSameNode(target, source)).to.equal(true)
    })
  })

  describe('lastChild()', function () {

    it('returns the deepest last child', function () {
      const source = linkWithSpan
      const target = document.createTextNode('bar')
      expect(parser.lastChild(source).isEqualNode(target)).to.equal(true)
    })
  })

  describe('isInlineElement()', function () {
    let elem

    afterEach(function () {
      if (!elem) return
      elem.remove()
      elem = undefined
    })

    it('returns false for a div', function () {
      elem = createElement('<div>')
      document.body.appendChild(elem)
      expect(parser.isInlineElement(window, elem)).to.equal(false)
    })

    it('returns true for a span', function () {
      elem = createElement('<span>')
      document.body.appendChild(elem)
      expect(parser.isInlineElement(window, elem)).to.equal(true)
    })

    it('returns true for a div with display set to "inline-block"', function () {
      elem = createElement('<div style="display:inline-block;">')
      document.body.appendChild(elem)
      expect(parser.isInlineElement(window, elem)).to.equal(true)
    })
  })
})

describe('isDocumentFragmentWithoutChildren()', function () {

  beforeEach(function () {
    this.frag = window.document.createDocumentFragment()
  })

  it('returns true for a fragment with no children', function () {
    expect(parser.isDocumentFragmentWithoutChildren(this.frag)).to.equal(true)
  })

  it('returns false for a documentFragment with an empty text node as child', function () {
    this.frag.appendChild(window.document.createTextNode(''))
    expect(parser.isDocumentFragmentWithoutChildren(this.frag)).to.equal(false)
  })

  it('returns undefined for undefined', function () {
    expect(parser.isDocumentFragmentWithoutChildren(undefined)).to.equal(undefined)
  })

  it('returns false for an element node', function () {
    const node = createElement('<div>')
    expect(parser.isDocumentFragmentWithoutChildren(node)).to.equal(false)
  })
})

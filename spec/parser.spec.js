import $ from 'jquery'
import rangy from 'rangy'

import * as parser from '../src/parser'
import * as config from '../src/config'

describe('Parser', () => {
  // helper methods
  function createRangyCursorAfter (node) {
    const range = rangy.createRange()
    range.setStartAfter(node)
    range.setEndAfter(node)
    return range
  }

  function createRangyCursorAtEnd (node) {
    const range = rangy.createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    return range
  }

  // test elements
  const empty = $('<div></div>')[0]
  const linebreak = $('<div><br></div>')[0]
  const emptyWithWhitespace = $('<div> </div>')[0]
  const singleCharacter = $('<div>a</div>')[0]
  const oneWord = $('<div>foobar</div>')[0]
  const oneWordWithWhitespace = $('<div> foobar </div>')[0]
  const oneWordWithNbsp = $('<div>&nbsp;foobar&nbsp;</div>')[0]
  const textNode = oneWord.firstChild
  const text = $('<div>foo bar.</div>')[0]
  const textWithLink = $('<div>foo <a href="#">bar</a>.</div>')[0]
  const linkWithWhitespace = $('<div><a href="#">bar</a> </div>')[0]
  const link = $('<div><a href="#">foo bar</a></div>')[0]
  const linkWithSpan = $('<div><a href="#">foo <span class="important">bar</span></a></div>')[0]

  describe('getHost()', function () {
    beforeEach(() => {
      this.$host = $('<div class="' + config.editableClass + '""></div>')
    })

    it('works if host is passed', () => {
      expect(parser.getHost(this.$host[0])).toBe(this.$host[0])
    })

    it('works if a child of host is passed', () => {
      this.$host.html('a<em>b</em>')
      expect(parser.getHost(this.$host.find('em')[0])).toBe(this.$host[0])
    })

    it('works if a text node is passed', () => {
      this.$host.html('a<em>b</em>')
      expect(parser.getHost(this.$host[0].firstChild)).toBe(this.$host[0])
    })
  })

  describe('getNodeIndex()', () => {
    it('gets element index of link in text', () => {
      const linkNode = $(textWithLink).find('a').first()[0]
      expect(parser.getNodeIndex(linkNode)).toBe(1)
    })
  })

  describe('isVoid()', () => {
    it('detects an empty node', () => {
      expect(empty.childNodes.length).toBe(0)
      expect(parser.isVoid(empty)).toBe(true)
    })

    it('detects an non-empty node', () => {
      expect(emptyWithWhitespace.childNodes.length).toBe(1)
      expect(parser.isVoid(emptyWithWhitespace)).toBe(false)
    })
  })

  describe('isWhitespaceOnly()', () => {
    it('works with void element', () => {
      const textNode = document.createTextNode('')
      expect(parser.isWhitespaceOnly(textNode)).toEqual(true)
    })

    it('works with single whitespace', () => {
      expect(parser.isWhitespaceOnly(emptyWithWhitespace.firstChild)).toEqual(true)
    })

    it('works with a single character', () => {
      expect(parser.isWhitespaceOnly(singleCharacter.firstChild)).toEqual(false)
    })

    it('ignores whitespace after the last element', () => {
      expect(parser.isWhitespaceOnly(link.firstChild)).toEqual(false)
    })
  })

  describe('lastOffsetWithContent()', () => {
    describe('called with a text node', () => {
      it('works for single character', () => {
        // <div>a|</div>
        expect(parser.lastOffsetWithContent(singleCharacter.firstChild)).toEqual(1)
      })

      it('works with a single word text node', () => {
        // <div>foobar|</div>
        expect(parser.lastOffsetWithContent(oneWord.firstChild)).toEqual(6)
      })

      it('works with a single word text node with whitespace', () => {
        // <div> foobar| </div>
        expect(parser.lastOffsetWithContent(oneWordWithWhitespace.firstChild)).toEqual(7)
      })
    })

    describe('called with an element node', () => {
      it('works with an empty tag', () => {
        // <div></div>
        expect(parser.lastOffsetWithContent(empty)).toEqual(0)
      })

      it('works with a single character', () => {
        // <div>a</div>
        expect(parser.lastOffsetWithContent(singleCharacter)).toEqual(1)
      })

      it('works with whitespace after last tag', () => {
        // <div><a href="#">bar</a> </div>
        expect(parser.lastOffsetWithContent(linkWithWhitespace)).toEqual(1)
      })

      it('works with whitespace after last tag', () => {
        // <div>foo <a href="#">bar</a>.</div>
        expect(parser.lastOffsetWithContent(textWithLink)).toEqual(3)
      })
    })
  })

  describe('isEndOffset()', () => {
    it('works for single child node', () => {
      // <div>foobar|</div>
      const range = createRangyCursorAfter(oneWord.firstChild)
      expect(range.endOffset).toEqual(1)
      expect(parser.isEndOffset(oneWord, 1)).toEqual(true)
    })

    it('works for empty node', () => {
      // <div>|</div>
      const range = createRangyCursorAtEnd(empty)
      expect(parser.isEndOffset(empty, range.endOffset)).toEqual(true)
    })

    it('works with a text node', () => {
      // foobar|
      expect(parser.isEndOffset(textNode, 6)).toEqual(true)

      // fooba|r
      expect(parser.isEndOffset(textNode, 5)).toEqual(false)
    })

    it('works with whitespace at the end', () => {
      // <div> foobar| </div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 7)).toEqual(false)
      // <div> foobar |</div>
      expect(parser.isEndOffset(oneWordWithWhitespace.firstChild, 8)).toEqual(true)
    })

    it('works with text and element nodes', () => {
      // <div>foo <a href='#'>bar</a>.|</div>
      let range = createRangyCursorAfter(textWithLink.childNodes[2])
      expect(range.endOffset).toEqual(3)
      expect(parser.isEndOffset(textWithLink, 3)).toEqual(true)

      // <div>foo <a href='#'>bar</a>|.</div>
      range = createRangyCursorAfter(textWithLink.childNodes[1])
      expect(range.endOffset).toEqual(2)
      expect(parser.isEndOffset(textWithLink, 2)).toEqual(false)
    })
  })

  describe('isTextEndOffset()', () => {
    it('ignores whitespace at the end', () => {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 6)).toEqual(false)
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 7)).toEqual(true)
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithWhitespace.firstChild, 8)).toEqual(true)
    })

    it('ignores non-breaking-space at the end', () => {
      // <div> fooba|r </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 6)).toEqual(false)
      // <div> foobar| </div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 7)).toEqual(true)
      // <div> foobar |</div>
      expect(parser.isTextEndOffset(oneWordWithNbsp.firstChild, 8)).toEqual(true)
    })

    it('ignores whitespace after the last element', () => {
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 2)).toEqual(false)
      // <div><a href="#">bar|</a> </div>
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild.firstChild, 3)).toEqual(true)
    })

    it('ignores whitespace after the last element', () => {
      // <div><a href="#">bar|</a> </div>
      const range = createRangyCursorAfter(linkWithWhitespace.firstChild.firstChild)
      expect(range.endOffset).toEqual(1)
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 1)).toEqual(true)
      expect(parser.isTextEndOffset(linkWithWhitespace.firstChild, 0)).toEqual(false)
    })

    it('ignores whitespace after the last element', () => {
      // <div><a href="#">bar</a>| </div>
      const range = createRangyCursorAfter(linkWithWhitespace.firstChild)
      expect(range.endOffset).toEqual(1)
      expect(parser.isTextEndOffset(linkWithWhitespace, 1)).toEqual(true)
      expect(parser.isTextEndOffset(linkWithWhitespace, 0)).toEqual(false)
    })

    it('ignores a linebreak', () => {
      // <div>|<br></div>
      const range = rangy.createRange()
      range.selectNodeContents(linebreak)
      range.collapse(true)
      expect(range.endOffset).toEqual(0)
      expect(parser.isTextEndOffset(linebreak, 0)).toEqual(true)
    })
  })

  describe('isStartOffset()', () => {
    it('works for single child node', () => {
      // <div>|foobar</div>
      expect(parser.isStartOffset(oneWord, 0)).toEqual(true)
    })

    it('works for empty node', () => {
      // <div>|</div>
      expect(parser.isStartOffset(empty, 0)).toEqual(true)
    })

    it('works with a text node', () => {
      // |foobar
      expect(parser.isStartOffset(textNode, 0)).toEqual(true)

      // f|oobar
      expect(parser.isStartOffset(textNode, 1)).toEqual(false)
    })

    it('works with whitespace at the beginning', () => {
      // <div> |foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 1)).toEqual(false)
      // <div>| foobar </div>
      expect(parser.isStartOffset(oneWordWithWhitespace.firstChild, 0)).toEqual(true)
    })

    it('works with text and element nodes', () => {
      // <div>|foo <a href='#'>bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 0)).toEqual(true)

      // <div>foo <a href='#'>|bar</a>.</div>
      expect(parser.isStartOffset(textWithLink, 1)).toEqual(false)
    })
  })

  describe('isEndOfHost()', () => {
    it('works with text node in nested content', () => {
      const endContainer = $(linkWithSpan).find('span')[0].firstChild
      // <div><a href='#'>foo <span class='important'>bar|</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 3)).toEqual(true)

      // <div><a href='#'>foo <span class='important'>ba|r</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).toEqual(false)
    })

    it('works with link node in nested content', () => {
      // <div><a href='#'>foo <span class='important'>bar</span>|</a></div>
      const endContainer = $(linkWithSpan).find('a')[0]
      const range = createRangyCursorAtEnd(endContainer)
      expect(range.endOffset).toEqual(2)
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 2)).toEqual(true)

      // <div><a href='#'>foo |<span class='important'>bar</span></a></div>
      expect(parser.isEndOfHost(linkWithSpan, endContainer, 1)).toEqual(false)
    })

    it('works with single text node', () => {
      // <div>foobar|</div>
      const endContainer = oneWord.firstChild
      expect(parser.isEndOfHost(oneWord, endContainer, 6)).toEqual(true)
      expect(parser.isEndOfHost(oneWord, endContainer, 5)).toEqual(false)
    })
  })

  describe('isBeginningOfHost()', () => {
    it('works with link node in nested content', () => {
      const endContainer = $(linkWithSpan).find('a')[0]
      // <div><a href='#'>|foo <span class='important'>bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 0)).toEqual(true)

      // <div><a href='#'>foo <span class='important'>|bar</span></a></div>
      expect(parser.isBeginningOfHost(linkWithSpan, endContainer, 1)).toEqual(false)
    })

    it('works with single text node', () => {
      const endContainer = oneWord.firstChild
      // <div>|foobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 0)).toEqual(true)

      // <div>f|oobar</div>
      expect(parser.isBeginningOfHost(oneWord, endContainer, 1)).toEqual(false)
    })
  })

  describe('isSameNode()', () => {
    it('fails when tags are different', () => {
      const source = text.firstChild
      const target = link.firstChild
      expect(parser.isSameNode(target, source)).toEqual(false)
    })

    it('fails when attributes are different', () => {
      const source = link.firstChild
      const target = link.firstChild.cloneNode(true)
      target.setAttribute('key', 'value')
      expect(parser.isSameNode(target, source)).toEqual(false)
    })

    it('works when nodes have same tag and attributes', () => {
      const source = link.firstChild
      const target = link.firstChild.cloneNode(true)
      expect(parser.isSameNode(target, source)).toEqual(true)
    })
  })

  describe('latestChild()', () => {
    it('returns the deepest last child', () => {
      const source = linkWithSpan
      const target = document.createTextNode('bar')
      expect(parser.latestChild(source).isEqualNode(target)).toEqual(true)
    })
  })

  describe('isInlineElement()', () => {
    let $elem

    afterEach(() => {
      if ($elem) {
        $elem.remove()
        $elem = undefined
      }
    })

    it('returns false for a div', () => {
      $elem = $('<div>')
      $(document.body).append($elem)
      expect(parser.isInlineElement(window, $elem[0])).toEqual(false)
    })

    it('returns true for a span', () => {
      $elem = $('<span>')
      $(document.body).append($elem)
      expect(parser.isInlineElement(window, $elem[0])).toEqual(true)
    })

    it('returns true for a div with display set to "inline-block"', () => {
      $elem = $('<div style="display:inline-block;">')
      $(document.body).append($elem)
      expect(parser.isInlineElement(window, $elem[0])).toEqual(true)
    })
  })
})

describe('isDocumentFragmentWithoutChildren()', () => {
  let frag
  beforeEach(() => {
    frag = window.document.createDocumentFragment()
  })

  it('returns truthy for a fragment with no children', () => {
    expect(parser.isDocumentFragmentWithoutChildren(frag)).toBeTruthy()
  })

  it('returns falsy for a documentFragment with an empty text node as child', () => {
    frag.appendChild(window.document.createTextNode(''))
    expect(parser.isDocumentFragmentWithoutChildren(frag)).toBeFalsy()
  })

  it('returns falsy for undefined', () => {
    expect(parser.isDocumentFragmentWithoutChildren(undefined)).toBeFalsy()
  })

  it('returns falsy for an element node', () => {
    const node = $('<div>')[0]
    expect(parser.isDocumentFragmentWithoutChildren(node)).toBeFalsy()
  })
})

import {expect} from 'chai'

import highlightSupport from '../src/highlight-support.js'
import Selection from '../src/selection.js'
import {createElement} from '../src/util/dom.js'
import {
  createCssHighlightRange,
  deleteCssHighlight,
  getCssHighlightTextOffset,
  getCssHighlightRects,
  getCssHighlightText,
  refreshCssHighlights,
  setCssHighlight
} from '../src/plugins/highlighting/css-highlights.js'

const name = 'spellcheck'

describe('css highlights', function () {
  let hosts = []

  function addEditable (html) {
    const host = createElement(`<div>${html}</div>`)
    document.body.appendChild(host)
    hosts.push(host)
    return host
  }

  // The text of every range the browser is painting under our name.
  function highlightedText () {
    const highlight = CSS.highlights.get(name)
    if (!highlight) return undefined
    return Array.from(highlight, (range) => range.toString())
  }

  afterEach(function () {
    deleteCssHighlight({name})
    for (const host of hosts) host.remove()
    hosts = []
  })

  // Select characters the way a user would, so the formatting runs on a real range.
  function selectChars (host, start, end) {
    const range = createCssHighlightRange({editableHost: host, start, end})
    return new Selection(host, range)
  }


  describe('getCssHighlightText()', function () {
    it('reads the text of an editable without its markup', function () {
      const host = addEditable('Hello <b>world</b>')
      expect(getCssHighlightText({editableHost: host})).to.equal('Hello world')
    })

    it('returns a <br> as a newline', function () {
      const host = addEditable('Hello<br>world')
      expect(getCssHighlightText({editableHost: host})).to.equal('Hello\nworld')
    })

    it('leaves out text marked data-editable="remove"', function () {
      const host = addEditable('Hello <span data-editable="remove">nope</span>world')
      expect(getCssHighlightText({editableHost: host})).to.equal('Hello world')
    })
  })

  describe('setCssHighlight()', function () {
    it('highlights a range', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})
      expect(highlightedText()).to.deep.equal(['world'])
    })

    it('highlights ranges in more than one editable', function () {
      const first = addEditable('Hello world')
      const second = addEditable('Hello moon')
      setCssHighlight({
        name,
        ranges: [
          {editableHost: first, start: 6, end: 11},
          {editableHost: second, start: 6, end: 10}
        ]
      })
      expect(highlightedText()).to.deep.equal(['world', 'moon'])
    })

    it('replaces everything set under the same name', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})
      setCssHighlight({name, ranges: [{editableHost: host, start: 0, end: 5}]})
      expect(highlightedText()).to.deep.equal(['Hello'])
    })

    it('removes the highlight when no ranges are given', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})
      setCssHighlight({name, ranges: []})
      expect(highlightedText()).to.equal(undefined)
    })
  })

  describe('refreshCssHighlights()', function () {
    it('keeps the highlight on the same words when a comment is added and removed', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      highlightSupport.highlightRange(host, undefined, 'before', 0, 5)
      expect(highlightedText()).to.deep.equal(['world'])

      highlightSupport.highlightRange(host, undefined, 'around', 6, 11)
      expect(highlightedText()).to.deep.equal(['world'])

      highlightSupport.removeHighlight(host, 'before')
      highlightSupport.removeHighlight(host, 'around')
      expect(highlightedText()).to.deep.equal(['world'])
    })

    it('keeps the offsets while an editable is empty', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      host.textContent = ''
      refreshCssHighlights({editableHost: host})
      expect(highlightedText()).to.equal(undefined)

      host.textContent = 'Hello world'
      refreshCssHighlights({editableHost: host})
      expect(highlightedText()).to.deep.equal(['world'])
    })

    it('keeps the highlight on the same words when a format overlaps its start', function () {
      const host = addEditable('Hello wrold there')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      selectChars(host, 0, 8).toggleBold()

      expect(host.innerHTML).to.equal('<strong>Hello wr</strong>old there')
      expect(highlightedText()).to.deep.equal(['wrold'])
    })

    it('keeps the highlight on the same words when a format is applied to it and removed again', function () {
      const host = addEditable('Hello wrold there')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      selectChars(host, 6, 11).toggleBold()
      expect(highlightedText()).to.deep.equal(['wrold'])

      selectChars(host, 6, 11).toggleBold()
      expect(host.innerHTML).to.equal('Hello wrold there')
      expect(highlightedText()).to.deep.equal(['wrold'])
    })

    it('keeps the highlight on the same words when a link is added and removed', function () {
      const host = addEditable('Hello wrold there')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      selectChars(host, 0, 8).link('https://example.com')
      expect(highlightedText()).to.deep.equal(['wrold'])

      selectChars(host, 0, 8).unlink()
      expect(host.innerHTML).to.equal('Hello wrold there')
      expect(highlightedText()).to.deep.equal(['wrold'])
    })

    it('forgets editables that left the document', function () {
      const gone = addEditable('Hello world')
      const stays = addEditable('Hello moon')
      setCssHighlight({
        name,
        ranges: [
          {editableHost: gone, start: 6, end: 11},
          {editableHost: stays, start: 6, end: 10}
        ]
      })

      gone.remove()
      refreshCssHighlights({editableHost: stays})
      expect(highlightedText()).to.deep.equal(['moon'])
    })
  })

  describe('deleteCssHighlight()', function () {
    it('removes the highlight and forgets where it was', function () {
      const host = addEditable('Hello world')
      setCssHighlight({name, ranges: [{editableHost: host, start: 6, end: 11}]})

      deleteCssHighlight({name})
      expect(highlightedText()).to.equal(undefined)

      refreshCssHighlights({editableHost: host})
      expect(highlightedText()).to.equal(undefined)
    })
  })

  describe('createCssHighlightRange()', function () {
    it('returns a range over the given characters', function () {
      const host = addEditable('Hello world')
      const range = createCssHighlightRange({editableHost: host, start: 6, end: 11})
      expect(range.toString()).to.equal('world')
    })

    it('returns a range that reaches across elements', function () {
      const host = addEditable('<b>Hello</b> world')
      const range = createCssHighlightRange({editableHost: host, start: 3, end: 8})
      expect(range.toString()).to.equal('lo wo')
    })

    it('returns nothing for offsets past the end of the text', function () {
      const host = addEditable('Hello world')
      const range = createCssHighlightRange({editableHost: host, start: 20, end: 25})
      expect(range).to.equal(undefined)
    })
  })

  describe('getCssHighlightRects()', function () {
    it('returns where the characters sit on screen', function () {
      const host = addEditable('Hello world')
      const {bounding, rects} = getCssHighlightRects({editableHost: host, start: 6, end: 11})

      expect(rects).to.have.lengthOf(1)
      expect(bounding.width).to.be.above(0)
      expect(bounding.height).to.be.above(0)
    })

    it('returns nothing for offsets past the end of the text', function () {
      const host = addEditable('Hello world')
      expect(getCssHighlightRects({editableHost: host, start: 20, end: 25})).to.equal(undefined)
    })
  })

  describe('getCssHighlightTextOffset()', function () {
    it('counts the same characters as getCssHighlightText()', function () {
      const host = addEditable('Hello<br><b>world</b>')
      const container = host.querySelector('b').firstChild

      const offset = getCssHighlightTextOffset({
        editableHost: host, container, containerOffset: 2
      })

      expect(offset).to.equal(8)
    })

    it('returns the offset of the child a position in an element points at', function () {
      const host = addEditable('Hello <b>world</b>')

      const offset = getCssHighlightTextOffset({
        editableHost: host, container: host, containerOffset: 1
      })

      expect(offset).to.equal(6)
    })

    it('returns the end of the block for a position after the last child', function () {
      const host = addEditable('Hello <b>world</b>')

      const offset = getCssHighlightTextOffset({
        editableHost: host, container: host, containerOffset: host.childNodes.length
      })

      expect(offset).to.equal(11)
    })
  })
})

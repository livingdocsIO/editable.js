import $ from 'jquery'
import rangy from 'rangy'
import sinon from 'sinon'

import Editable from '../src/core'
import Highlighting from '../src/highlighting'
import Cursor from '../src/cursor'

// import Spellcheck from '../src/plugins/highlighting/spellcheck'

describe('Spellcheck:', function () {

  // Helpers

  function createCursor (host, elem, offset) {
    const range = rangy.createRange()
    range.setStart(elem, offset)
    range.setEnd(elem, offset)
    return new Cursor(host, range)
  }

  // Specs

  beforeEach(() => {
    this.editable = new Editable()
  })

  describe('with a simple sentence', () => {

    beforeEach(() => {
      this.p = $('<p>A simple sentence.</p>')[0]
      this.errors = ['simple']
      this.highlighting = new Highlighting(this.editable, {
        spellcheck: {
          marker: '<span class="misspelled-word"></span>',
          spellcheckService: (text, callback) => {
            callback(this.errors)
          }
        }
      })
    })

    describe('highlight()', () => {

      it('calls highlightMatches()', () => {
        const highlightMatches = sinon.spy(this.highlighting, 'highlightMatches')
        this.highlighting.highlight(this.p)
        expect(highlightMatches.called).toEqual(true)
      })

      it('highlights a match with the given marker node', () => {
        this.highlighting.highlight(this.p)
        expect($(this.p).find('.misspelled-word').length).toEqual(1)
      })

      it('removes a corrected highlighted match.', () => {
        this.highlighting.highlight(this.p)
        let $misspelledWord = $(this.p).find('.misspelled-word')
        expect($misspelledWord.length).toEqual(1)

        // correct the error
        $misspelledWord.html('simpler')
        this.errors = []

        this.highlighting.highlight(this.p)
        // console.log('this.p.outerHTML', this.p.outerHTML)
        $misspelledWord = $(this.p).find('.misspelled-word')
        expect($misspelledWord.length).toEqual(0)
      })

      it('match highlights are marked with "ui-unwrap"', () => {
        this.highlighting.highlight(this.p)
        const $spellcheck = $(this.p).find('.misspelled-word').first()
        const dataEditable = $spellcheck.attr('data-editable')
        expect(dataEditable).toEqual('ui-unwrap')
      })

      it('calls highlight() for an empty wordlist', () => {
        const highlight = sinon.spy(this.highlighting, 'highlight')
        this.highlighting.config.spellcheckService = function (text, callback) {
          callback([])
        }
        this.highlighting.highlight(this.p)
        expect(highlight.called).toEqual(true)
      })

      it('calls highlight() for an undefined wordlist', () => {
        const highlight = sinon.spy(this.highlighting, 'highlight')
        this.highlighting.config.spellcheckService = function (text, callback) {
          callback()
        }
        this.highlighting.highlight(this.p)
        expect(highlight.called).toEqual(true)
      })
    })

    describe('removeHighlights()', () => {

      it('removes the highlights', () => {
        this.highlighting.highlight(this.p)
        expect($(this.p).find('.misspelled-word').length).toEqual(1)
        this.highlighting.removeHighlights(this.p)
        expect($(this.p).find('.misspelled-word').length).toEqual(0)
      })
    })

    describe('removeHighlightsAtCursor()', () => {

      beforeEach(() => {
        this.highlighting.highlight(this.p)
        this.highlight = $(this.p).find('.misspelled-word')[0]
      })

      afterEach(() => {
        this.editable.getSelection.restore()
      })

      it('does remove the highlights if cursor is within a match', () => {
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.highlight, 0))

        this.highlighting.removeHighlightsAtCursor(this.p)
        expect($(this.p).find('.misspelled-word').length).toEqual(0)
      })

      it('does not remove the highlights if cursor is outside a match', () => {
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.p.firstChild, 0))

        this.highlighting.removeHighlightsAtCursor(this.p)
        expect($(this.p).find('.misspelled-word').length).toEqual(1)
      })
    })

    describe('retains cursor position', () => {

      it('in the middle of a text node', () => {
        const cursor = createCursor(this.p, this.p.firstChild, 4)
        cursor.save()
        this.highlighting.highlight(this.p)
        cursor.restore()

        // These are the child nodes of the paragraph we expect after restoring the cursor:
        // 'A |span|span| sentence.'
        //
        // The cursor should be positioned between the two marker <span> elements.
        expect(cursor.range.startContainer).toEqual(this.p)
        expect(cursor.range.startOffset).toEqual(2)

        // The storing of the cursor position will have split up the text node,
        // so now we have two markers in the editable.
        expect($(this.p).find('.misspelled-word').length).toEqual(2)
      })
    })
  })
})

import {expect} from 'chai'
import sinon from 'sinon'
import {Editable} from '../src/core'
import MonitoredHighlighting from '../src/monitored-highlighting'
import Cursor from '../src/cursor'
import {createElement, createRange} from '../src/util/dom'

describe('Spellcheck:', function () {

  // Helpers

  function createCursor (host, elem, offset) {
    const range = createRange()
    range.setStart(elem, offset)
    range.setEnd(elem, offset)
    return new Cursor(host, range)
  }

  // Specs

  beforeEach(function () {
    this.editable = new Editable()
  })

  afterEach(function () {
    this.editable.unload()
  })

  describe('with a simple sentence', function () {

    beforeEach(function () {
      this.p = createElement('<p>A simple sentence.</p>')

      // The spellcheck has a safeguard against disconnected elments
      // so we need to append the element to the document.
      window.document.body.appendChild(this.p)

      this.errors = ['simple']
      this.highlighting = new MonitoredHighlighting(this.editable, {
        spellcheck: {
          marker: '<span class="misspelled-word"></span>',
          spellcheckService: (text, callback) => {
            callback(this.errors)
          }
        }
      })
    })

    this.afterEach(function () {
      this.p.remove()
    })

    describe('highlight()', function () {

      it('calls highlightMatches()', function () {
        const highlightMatches = sinon.spy(this.highlighting, 'highlightMatches')
        this.highlighting.highlight(this.p)
        expect(highlightMatches.called).to.equal(true)
      })

      it('highlights a match with the given marker node', function () {
        this.highlighting.highlight(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(1)
      })

      it('notify spellcheckUpdated on add highlight through spellcheck', function () {
        let called = 0
        this.editable.on('spellcheckUpdated', () => called++)
        this.highlighting.highlight(this.p, true)
        expect(called).to.equal(1)
      })

      it('removes a corrected highlighted match.', function () {
        this.highlighting.highlight(this.p)
        let misspelledWord = this.p.querySelectorAll('.misspelled-word')
        expect(misspelledWord.length).to.equal(1)

        // correct the error
        misspelledWord[0].innerHTML = 'simpler'
        this.errors = []

        this.highlighting.highlight(this.p)

        misspelledWord = this.p.querySelectorAll('.misspelled-word')
        expect(misspelledWord.length).to.equal(0)
      })

      it('match highlights are marked with "ui-unwrap"', function () {
        this.highlighting.highlight(this.p)
        const spellcheck = this.p.querySelector('.misspelled-word')
        const dataEditable = spellcheck.getAttribute('data-editable')
        expect(dataEditable).to.equal('ui-unwrap')
      })

      it('calls highlight() for an empty wordlist', function () {
        const highlight = sinon.spy(this.highlighting, 'highlight')
        this.highlighting.config.spellcheckService = function (text, callback) {
          callback([])
        }
        this.highlighting.highlight(this.p)
        expect(highlight.called).to.equal(true)
      })

      it('calls highlight() for an undefined wordlist', function () {
        const highlight = sinon.spy(this.highlighting, 'highlight')
        this.highlighting.config.spellcheckService = function (text, callback) {
          callback()
        }
        this.highlighting.highlight(this.p)
        expect(highlight.called).to.equal(true)
      })
    })

    describe('removeHighlights()', function () {

      it('removes the highlights', function () {
        this.highlighting.highlight(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(1)
        this.highlighting.removeHighlights(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(0)
      })
    })

    describe('removeHighlightsAtCursor()', function () {

      beforeEach(function () {
        this.highlighting.highlight(this.p)
        this.highlight = this.p.querySelector('.misspelled-word')
      })

      afterEach(function () {
        this.editable.getSelection.restore()
      })

      it('does remove the highlights if cursor is within a match', function () {
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.highlight, 0))

        this.highlighting.removeHighlightsAtCursor(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(0)
      })

      it('does not remove the highlights config.removeOnCorrection is set to false', function () {
        this.highlighting.config.removeOnCorrection = false
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.highlight, 0))

        this.highlighting.onChange(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(1)
      })

      it('does not remove the highlights if cursor is within a match of highlight type != spellcheck', function () {
        this.p.querySelector('.misspelled-word').setAttribute('data-highlight', 'comment')
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.highlight, 0))

        this.highlighting.removeHighlightsAtCursor(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(1)
      })

      it('does not remove the highlights if cursor is outside a match', function () {
        sinon.stub(this.editable, 'getSelection').callsFake(() => createCursor(this.p, this.p.firstChild, 0))

        this.highlighting.removeHighlightsAtCursor(this.p)
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(1)
      })
    })

    describe('retains cursor position', function () {

      it('in the middle of a text node', function () {
        const cursor = createCursor(this.p, this.p.firstChild, 4)
        cursor.save()
        this.highlighting.highlight(this.p)
        cursor.restore()

        // These are the child nodes of the paragraph we expect after restoring the cursor:
        // 'A |span|span| sentence.'
        //
        // The cursor should be positioned between the two marker <span> elements.
        expect(cursor.range.startContainer).to.equal(this.p)
        expect(cursor.range.startOffset).to.equal(2)

        // The storing of the cursor position will have split up the text node,
        // so now we have two markers in the editable.
        expect(this.p.querySelectorAll('.misspelled-word').length).to.equal(2)
      })
    })
  })
})

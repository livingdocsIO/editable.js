import {expect} from 'chai'
import sinon from 'sinon'

import Cursor from '../src/cursor.js'
import highlightText from '../src/highlight-text.js'
import {searchAllWords} from '../src/plugins/highlighting/text-search.js'
import {createElement, createRange} from '../src/util/dom.js'

describe('highlightText', function () {

  function createParagraphWithTextNodes (...parts) {
    const elem = document.createElement('p')
    for (const part of parts) elem.appendChild(document.createTextNode(part))

    return elem
  }

  function highlight (elem, searchTexts) {
    const stencil = createElement('<span spellcheck="true">')

    const text = highlightText.extractText(elem)
    const matches = searchAllWords(text, searchTexts, stencil)

    highlightText.highlightMatches(elem, matches)
  }

  function createCursor (host, elem, offset) {
    const range = createRange()
    range.setStart(elem, offset)
    range.setEnd(elem, offset)
    return new Cursor(host, range)
  }

  // A word-id is stored on matches so that
  // spans belonging to the same match can be identified.
  // But this is not of interest in many tests,
  // and this is where this helper comes in.
  function removeWordId (elem) {
    for (const el of elem.querySelectorAll('[data-word-id]')) el.removeAttribute('data-word-id')
  }

  function removeSpellcheckAttr (elem) {
    for (const el of elem.querySelectorAll('[spellcheck]')) el.removeAttribute('spellcheck')
  }

  describe('extractText()', function () {

    beforeEach(function () {
      this.element = document.createElement('div')
    })

    it('extracts the text', function () {
      this.element.innerHTML = 'a'
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('a')
    })

    it('extracts the text with nested elements', function () {
      this.element.innerHTML = 'a<span>b</span><span></span>c'
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('abc')
    })

    it('extracts a &nbsp; entity', function () {
      this.element.innerHTML = '&nbsp;'
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('\u00A0') // \u00A0 is utf8 for the '&nbsp;' html entity
    })

    it('extracts a zero width no-break space', function () {
      this.element.innerHTML = '\ufeff'
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('\ufeff')
    })

    it('skips stored cursor positions', function () {
      this.element = createElement('<div>ab</div>')
      const cursor = createCursor(this.element, this.element.firstChild, 1)
      cursor.save()
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('ab')
    })

    it('extracts text with a <br> properly', function () {
      this.element = createElement('<div>a<br>b</div>')
      const text = highlightText.extractText(this.element)
      expect(text).to.equal('a\nb')
    })

    it(`extracts ' <br>' properly`, function () {
      this.element = createElement('<div> <br></div>')
      const text = highlightText.extractText(this.element)
      expect(text).to.equal(' \n')
    })

    it(`extracts ' <br> ' properly`, function () {
      this.element = createElement('<div> <br> </div>')
      const text = highlightText.extractText(this.element)
      expect(text).to.equal(' \n ')
    })
  })

  describe('iterator', function () {

    beforeEach(function () {
      this.wrapMatch = sinon.spy(highlightText, 'wrapMatch')
    })

    afterEach(function () {
      this.wrapMatch.restore()
    })

    it('finds a word that is its own text node', function () {
      const elem = createParagraphWithTextNodes('a ', 'b', ' c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, 'portions.length')
      expect(portions[0].text).to.equal('b')
      expect(portions[0].offset).to.equal(2, 'offset')
      expect(portions[0].length).to.equal(1, 'length')
      expect(portions[0].isLastPortion).to.equal(true, 'isLastPortion')
    })

    it('finds a word that is in a text node with a character before', function () {
      const elem = createParagraphWithTextNodes('a', ' b', ' c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, 'portions.length')
      expect(portions[0].text).to.equal('b')
      expect(portions[0].offset).to.equal(2, 'offset')
      expect(portions[0].length).to.equal(1, 'length')
      expect(portions[0].isLastPortion).to.equal(true, 'isLastPortion')
    })

    it('finds a word that is in a text node with a charcter after', function () {
      const elem = createParagraphWithTextNodes('a ', 'b x', 'c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, 'portions.length')
      expect(portions[0].text).to.equal('b')
      expect(portions[0].offset).to.equal(2, 'offset')
      expect(portions[0].length).to.equal(1, 'length')
      expect(portions[0].isLastPortion).to.equal(true, 'isLastPortion')
    })

    it('finds a word that span over two text nodes', function () {
      const elem = createParagraphWithTextNodes('a ', 'b', 'c')
      highlight(elem, ['bc'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, portions.length)
      expect(portions[0].text).to.equal('bc')
      expect(portions[0].isLastPortion).to.equal(true, 'isLastPortion')
    })

    it('finds a word that spans over three text nodes', function () {
      const elem = createParagraphWithTextNodes('a', 'b', 'c')
      highlight(elem, ['abc'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, 'portions.length')
      expect(portions[0].text).to.equal('abc')
    })

    it('finds a word that is partially contained in two text nodes', function () {
      const elem = createParagraphWithTextNodes('a', ' xx', 'xx ')
      highlight(elem, ['xxxx'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).to.equal(1, 'portions.length')
      expect(portions[0].text).to.equal('xxxx')
      expect(portions[0].offset).to.equal(2, 'offset')
      expect(portions[0].length).to.equal(4, 'length')
      expect(portions[0].isLastPortion).to.equal(true)
    })
  })

  describe('wrapMatch()', function () {

    it('wraps a word in a single text node', function () {
      const elem = createElement('<div>Some juice.</div>')
      highlight(elem, ['juice'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div>Some <span spellcheck="true">juice</span>.</div>')
    })

    it('wraps a word with a partial <em> element', function () {
      const elem = createElement('<div>Some jui<em>ce.</em></div>')
      highlight(elem, ['juice'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div>Some <span spellcheck="true">jui</span><em><span spellcheck="true">ce</span>.</em></div>')
    })

    it('wraps two words in the same text node', function () {
      const elem = createElement('<div>a or b</div>')
      highlight(elem, ['a', 'b'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div><span spellcheck="true">a</span> or <span spellcheck="true">b</span></div>')
    })

    it('wraps a word in a <em> element', function () {
      const elem = createElement('<div><em>word</em></div>')
      highlight(elem, ['word'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div><em><span spellcheck="true">word</span></em></div>')
    })

    it('can handle a non-match', function () {
      const elem = createElement('<div><em>word</em></div>')
      highlight(elem, ['xxx'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div><em>word</em></div>')
    })

    it('works with a more complex regex', function () {
      const elem = createElement('<div><em>a</em> or b</div>')
      highlight(elem, ['b', 'a'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div><em><span spellcheck="true">a</span></em> or <span spellcheck="true">b</span></div>')
    })

    it('wraps two words with a tag in between', function () {
      const elem = createElement('<div>A word <em>is</em> not necessary</div>')
      highlight(elem, ['word', 'not'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div>A <span spellcheck="true">word</span> <em>is</em> <span spellcheck="true">not</span> necessary</div>')
    })

    it('wraps two characters in the same textnode, when the first match has an offset', function () {
      const elem = createElement('<div>a, b or c, d</div>')
      highlight(elem, ['b', 'c'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div>a, <span spellcheck="true">b</span> or <span spellcheck="true">c</span>, d</div>')
    })

    it('wraps a character after a <br>', function () {
      const elem = createElement('<div>a<br>b</div>')
      highlight(elem, ['b'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .to.equal('<div>a<br><span spellcheck="true">b</span></div>')
    })

    it('stores data-word-id on a highlight', function () {
      const elem = createElement('<div>a</div>')
      highlight(elem, ['a'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .to.equal('<div><span data-word-id="0">a</span></div>')
    })

    it('stores data-word-id on different matches', function () {
      const elem = createElement('<div>a b</div>')
      highlight(elem, ['a', 'b'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .to.equal('<div><span data-word-id="0">a</span> <span data-word-id="2">b</span></div>')
    })

    it('stores same data-word-id on multiple highlights for the same match', function () {
      const elem = createElement('<div>a<i>b</i></div>')
      highlight(elem, ['ab'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .to.equal('<div><span data-word-id="0">a</span><i><span data-word-id="0">b</span></i></div>')
    })
  })
})

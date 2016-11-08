import $ from 'jquery'
import rangy from 'rangy'
import sinon from 'sinon'

import Cursor from '../src/cursor'
import highlightText from '../src/highlight-text'
import WordHighlighter from '../src/plugins/highlighting/word-highlighting'

describe('highlightText', function () {

  function createParagraphWithTextNodes (parts) {
    const elem = document.createElement('p')
    Array.from(arguments).forEach((part) => {
      const textNode = document.createTextNode(part)
      elem.appendChild(textNode)
    })

    // Note: Without appending the elem to the body rangy throws
    // a range exception (probably a bug as it can be prevented
    // if the 'p' is created by jquery with some text inside.
    // Yeah it's strange)
    document.body.appendChild(elem)

    return elem
  }

  function highlight (elem, words) {
    const stencil = $('<span spellcheck="true">')[0]
    const highlighter = new WordHighlighter(stencil)

    const text = highlightText.extractText(elem)
    const matches = highlighter.findMatches(text, words)

    highlightText.highlightMatches(elem, matches)
  }

  function createCursor (host, elem, offset) {
    const range = rangy.createRange()
    range.setStart(elem, offset)
    range.setEnd(elem, offset)
    return new Cursor(host, range)
  }

  // A word-id is stored on matches so that
  // spans belonging to the same match can be identified.
  // But this is not of interest in many tests,
  // and this is where this helper comes in.
  function removeWordId (elem) {
    $(elem).find('[data-word-id]').removeAttr('data-word-id')
  }

  function removeSpellcheckAttr (elem) {
    $(elem).find('[spellcheck]').removeAttr('spellcheck')
  }

  describe('extractText()', () => {

    beforeEach(() => {
      this.element = $('<div></div>')[0]
    })

    it('extracts the text', () => {
      this.element.innerHTML = 'a'
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('a')
    })

    it('extracts the text with nested elements', () => {
      this.element.innerHTML = 'a<span>b</span><span></span>c'
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('abc')
    })

    it('extracts a &nbsp; entity', () => {
      this.element.innerHTML = '&nbsp;'
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('\u00A0') // \u00A0 is utf8 for the '&nbsp;' html entity
    })

    it('extracts a zero width no-break space', () => {
      this.element.innerHTML = '\ufeff'
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('\ufeff')
    })

    it('skips stored cursor positions', () => {
      this.element = $('<div>ab</div>')[0]
      const cursor = createCursor(this.element, this.element.firstChild, 1)
      cursor.save()
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('ab')
    })

    it('extracts text with a <br> properly', () => {
      this.element = $('<div>a<br>b</div>')[0]
      const text = highlightText.extractText(this.element)
      expect(text).toEqual('a b')
    })
  })

  describe('iterator', () => {

    beforeEach(() => {
      this.wrapMatch = sinon.spy(highlightText, 'wrapMatch')
    })

    afterEach(() => {
      this.wrapMatch.restore()
    })

    it('finds a word that is its own text node', () => {
      const elem = createParagraphWithTextNodes('a ', 'b', ' c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(0)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds a word that is in a text node with a character before', () => {
      const elem = createParagraphWithTextNodes('a', ' b', ' c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(1)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds a word that is in a text node with a charcter after', () => {
      const elem = createParagraphWithTextNodes('a ', 'b x', 'c')
      highlight(elem, ['b'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(0)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds a word that span over two text nodes', () => {
      const elem = createParagraphWithTextNodes('a ', 'b', 'c')
      highlight(elem, ['bc'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(2)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].isLastPortion).toEqual(false)

      expect(portions[1].text).toEqual('c')
      expect(portions[1].isLastPortion).toEqual(true)
    })

    it('finds a word that spans over three text nodes', () => {
      const elem = createParagraphWithTextNodes('a', 'b', 'c')
      highlight(elem, ['abc'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(3)
      expect(portions[0].text).toEqual('a')
      expect(portions[1].text).toEqual('b')
      expect(portions[2].text).toEqual('c')
    })

    it('finds a word that is partially contained in two text nodes', () => {
      const elem = createParagraphWithTextNodes('a', ' xx', 'xx ')
      highlight(elem, ['xxxx'])
      const portions = this.wrapMatch.firstCall.args[0]

      expect(portions.length).toEqual(2)
      expect(portions[0].text).toEqual('xx')
      expect(portions[0].offset).toEqual(1)
      expect(portions[0].length).toEqual(2)
      expect(portions[0].isLastPortion).toEqual(false)

      expect(portions[1].text).toEqual('xx')
      expect(portions[1].offset).toEqual(0)
      expect(portions[1].length).toEqual(2)
      expect(portions[1].isLastPortion).toEqual(true)
    })
  })

  describe('wrapMatch()', () => {

    it('wraps a word in a single text node', () => {
      const elem = $('<div>Some juice.</div>')[0]
      highlight(elem, ['juice'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>Some <span spellcheck="true">juice</span>.</div>')
    })

    it('wraps a word with a partial <em> element', () => {
      const elem = $('<div>Some jui<em>ce.</em></div>')[0]
      highlight(elem, ['juice'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>Some <span spellcheck="true">jui</span><em><span spellcheck="true">ce</span>.</em></div>')
    })

    it('wraps two words in the same text node', () => {
      const elem = $('<div>a or b</div>')[0]
      highlight(elem, ['a', 'b'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span spellcheck="true">a</span> or <span spellcheck="true">b</span></div>')
    })

    it('wraps a word in a <em> element', () => {
      const elem = $('<div><em>word</em></div>')[0]
      highlight(elem, ['word'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em><span spellcheck="true">word</span></em></div>')
    })

    it('can handle a non-match', () => {
      const elem = $('<div><em>word</em></div>')[0]
      highlight(elem, ['xxx'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em>word</em></div>')
    })

    it('works with a more complex regex', () => {
      const elem = $('<div><em>a</em> or b</div>')[0]
      highlight(elem, ['b', 'a'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em><span spellcheck="true">a</span></em> or <span spellcheck="true">b</span></div>')
    })

    it('wraps two words with a tag in between', () => {
      const elem = $('<div>A word <em>is</em> not necessary</div>')[0]
      highlight(elem, ['word', 'not'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>A <span spellcheck="true">word</span> <em>is</em> <span spellcheck="true">not</span> necessary</div>')
    })

    it('wraps two characters in the same textnode, when the first match has an offset', () => {
      const elem = $('<div>a, b or c, d</div>')[0]
      highlight(elem, ['b', 'c'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>a, <span spellcheck="true">b</span> or <span spellcheck="true">c</span>, d</div>')
    })

    it('wraps a character after a <br>', () => {
      const elem = $('<div>a<br>b</div>')[0]
      highlight(elem, ['b'])
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>a<br><span spellcheck="true">b</span></div>')
    })

    it('stores data-word-id on a highlight', () => {
      const elem = $('<div>a</div>')[0]
      highlight(elem, ['a'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span></div>')
    })

    it('stores data-word-id on different matches', () => {
      const elem = $('<div>a b</div>')[0]
      highlight(elem, ['a', 'b'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span> <span data-word-id="2">b</span></div>')
    })

    it('stores same data-word-id on multiple highlights for the same match', () => {
      const elem = $('<div>a<i>b</i></div>')[0]
      highlight(elem, ['ab'])
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span><i><span data-word-id="0">b</span></i></div>')
    })
  })
})

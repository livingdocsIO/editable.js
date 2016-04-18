var $ = require('jquery')
var rangy = require('rangy')
var sinon = require('sinon')

var Cursor = require('../src/cursor')
var highlightText = require('../src/highlight-text')
var Spellcheck = require('../src/spellcheck')

describe('highlightText', function () {
  // Helper Methods
  // --------------

  var createParagraphWithTextNodes = function (firstPart, parts) {
    var textNode, part
    var elem = $('<p>' + firstPart + '</p>')[0]
    for (var i = 1; i < arguments.length; i++) {
      part = arguments[i]
      textNode = document.createTextNode(part)
      elem.appendChild(textNode)
    }
    return elem
  }

  var highlight = function (elem, regex, stencil) {
    if (!stencil) stencil = $('<span spellcheck="true">')[0]
    highlightText.highlight(elem, regex, stencil)
  }

  var createCursor = function (host, elem, offset) {
    var range = rangy.createRange()
    range.setStart(elem, offset)
    range.setEnd(elem, offset)
    return new Cursor(host, range)
  }

  // A word-id is stored on matches so that
  // spans belonging to the same match can be identified.
  // But this is not of interest in many tests,
  // and this is where this helper comes in.
  var removeWordId = function (elem) {
    $(elem).find('[data-word-id]').removeAttr('data-word-id')
  }

  var removeSpellcheckAttr = function (elem) {
    $(elem).find('[spellcheck]').removeAttr('spellcheck')
  }

  describe('extractText()', function () {
    beforeEach(function () {
      this.element = $('<div></div>')[0]
    })

    it('extracts the text', function () {
      this.element.innerHTML = 'a'
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('a')
    })

    it('extracts the text with nested elements', function () {
      this.element.innerHTML = 'a<span>b</span><span></span>c'
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('abc')
    })

    it('extracts a &nbsp; entity', function () {
      this.element.innerHTML = '&nbsp;'
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('\u00A0') // \u00A0 is utf8 for the '&nbsp;' html entity
    })

    it('extracts a zero width no-break space', function () {
      this.element.innerHTML = '\ufeff'
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('\ufeff')
    })

    it('skips stored cursor positions', function () {
      this.element = $('<div>ab</div>')[0]
      var cursor = createCursor(this.element, this.element.firstChild, 1)
      cursor.save()
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('ab')
    })

    it('extracts text with a <br> properly', function () {
      this.element = $('<div>a<br>b</div>')[0]
      var text = highlightText.extractText(this.element)
      expect(text).toEqual('a b')
    })
  })

  describe('minimal case', function () {
    beforeEach(function () {
      this.element = $('<div>a</div>')[0]
      this.regex = /a/g
    })

    it('finds the letter "a"', function () {
      var matches = highlightText.find(this.element, this.regex)
      var firstMatch = matches[0]
      expect(firstMatch.search).toEqual('a')
      expect(firstMatch.matchIndex).toEqual(0)
      expect(firstMatch.startIndex).toEqual(0)
      expect(firstMatch.endIndex).toEqual(1)
    })

    it('does not find the letter "b"', function () {
      var matches = highlightText.find(this.element, /b/g)
      expect(matches.length).toEqual(0)
    })
  })

  describe('Some juice.', function () {
    beforeEach(function () {
      this.element = $('<div>Some juice.</div>')[0]
      this.regex = /juice/g
    })

    it('finds the word "juice"', function () {
      var matches = highlightText.find(this.element, this.regex)
      var firstMatch = matches[0]
      expect(firstMatch.search).toEqual('juice')
      expect(firstMatch.matchIndex).toEqual(0)
      expect(firstMatch.startIndex).toEqual(5)
      expect(firstMatch.endIndex).toEqual(10)
    })
  })

  describe('iterator', function () {
    beforeEach(function () {
      this.wrapWord = sinon.spy(highlightText, 'wrapWord')
    })

    afterEach(function () {
      this.wrapWord.restore()
    })

    it('finds a letter that is its own text node', function () {
      var elem = createParagraphWithTextNodes('a', 'b', 'c')
      highlight(elem, /b/g)
      var portions = this.wrapWord.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(0)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds a letter that is in a text node with a letter before', function () {
      var elem = createParagraphWithTextNodes('a', 'xb', 'c')
      highlight(elem, /b/g)
      var portions = this.wrapWord.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(1)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds a letter that is in a text node with a letter after', function () {
      var elem = createParagraphWithTextNodes('a', 'bx', 'c')
      highlight(elem, /b/g)
      var portions = this.wrapWord.firstCall.args[0]

      expect(portions.length).toEqual(1)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].offset).toEqual(0)
      expect(portions[0].length).toEqual(1)
      expect(portions[0].isLastPortion).toEqual(true)
    })

    it('finds two letters that span over two text nodes', function () {
      var elem = createParagraphWithTextNodes('a', 'b', 'c')
      highlight(elem, /bc/g)
      var portions = this.wrapWord.firstCall.args[0]

      expect(portions.length).toEqual(2)
      expect(portions[0].text).toEqual('b')
      expect(portions[0].isLastPortion).toEqual(false)

      expect(portions[1].text).toEqual('c')
      expect(portions[1].isLastPortion).toEqual(true)
    })

    it('finds three letters that span over three text nodes', function () {
      var elem = createParagraphWithTextNodes('a', 'b', 'c')
      highlight(elem, /abc/g)
      var portions = this.wrapWord.firstCall.args[0]

      expect(portions.length).toEqual(3)
      expect(portions[0].text).toEqual('a')
      expect(portions[1].text).toEqual('b')
      expect(portions[2].text).toEqual('c')
    })

    it('finds a word that is partially contained in two text nodes', function () {
      var elem = createParagraphWithTextNodes('a', 'bxx', 'xxe')
      highlight(elem, /xxxx/g)
      var portions = this.wrapWord.firstCall.args[0]

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

  describe('wrapWord', function () {
    it('wraps a word in a single text node', function () {
      var elem = $('<div>Some juice.</div>')[0]
      highlight(elem, /juice/g)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>Some <span spellcheck="true">juice</span>.</div>')
    })

    it('wraps a word with a partial <em> element', function () {
      var elem = $('<div>Some jui<em>ce.</em></div>')[0]
      highlight(elem, /juice/g)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>Some <span spellcheck="true">jui</span><em><span spellcheck="true">ce</span>.</em></div>')
    })

    it('wraps two words in the same text node', function () {
      var elem = $('<div>a or b</div>')[0]
      highlight(elem, /a|b/g)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span spellcheck="true">a</span> or <span spellcheck="true">b</span></div>')
    })

    it('wraps a word in a <em> element', function () {
      var elem = $('<div><em>word</em></div>')[0]
      highlight(elem, /word/g)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em><span spellcheck="true">word</span></em></div>')
    })

    it('can handle a non-match', function () {
      var elem = $('<div><em>word</em></div>')[0]
      highlight(elem, /xxx/g)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em>word</em></div>')
    })

    it('works with a more complex regex', function () {
      var elem = $('<div><em>a</em> or b</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['b', 'a'])
      highlight(elem, regex)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div><em><span spellcheck="true">a</span></em> or <span spellcheck="true">b</span></div>')
    })

    it('wraps two words with a tag in between', function () {
      var elem = $('<div>A word <em>is</em> not necessary</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['word', 'not'])
      highlight(elem, regex)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>A <span spellcheck="true">word</span> <em>is</em> <span spellcheck="true">not</span> necessary</div>')
    })

    it('wraps two characters in the same textnode, when the first match has an offset', function () {
      var elem = $('<div>a, b or c, d</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['b', 'c'])
      highlight(elem, regex)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>a, <span spellcheck="true">b</span> or <span spellcheck="true">c</span>, d</div>')
    })

    it('wraps a character after a <br>', function () {
      var elem = $('<div>a<br>b</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['b'])
      highlight(elem, regex)
      removeWordId(elem)
      expect(elem.outerHTML)
        .toEqual('<div>a<br><span spellcheck="true">b</span></div>')
    })

    it('stores data-word-id on a highlight', function () {
      var elem = $('<div>a</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['a'])
      highlight(elem, regex)
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span></div>')
    })

    it('stores data-word-id on different matches', function () {
      var elem = $('<div>a b</div>')[0]
      var regex = Spellcheck.prototype.createRegex(['a', 'b'])
      highlight(elem, regex)
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span> <span data-word-id="2">b</span></div>')
    })

    it('stores same data-word-id on multiple highlights for the same match', function () {
      var elem = $('<div>a<i>b</i></div>')[0]
      var regex = Spellcheck.prototype.createRegex(['ab'])
      highlight(elem, regex)
      removeSpellcheckAttr(elem)
      expect(elem.outerHTML)
        .toEqual('<div><span data-word-id="0">a</span><i><span data-word-id="0">b</span></i></div>')
    })
  })
})

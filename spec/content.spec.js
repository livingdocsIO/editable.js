import rangy from 'rangy'
import {createElement} from '../src/util/dom'

import * as content from '../src/content'
import * as rangeSaveRestore from '../src/range-save-restore'

rangy.init()

describe('Content', function () {

  describe('normalizeTags()', function () {
    const plain = createElement('<div>Plain <strong>text</strong><strong>block</strong> example snippet</div>')
    const plainWithSpace = createElement('<div>Plain <strong>text</strong> <strong>block</strong> example snippet</div>')
    const nested = createElement('<div>Nested <strong><em>text</em></strong><strong><em>block</em></strong> example snippet</div>')
    const nestedMixed = createElement('<div>Nested <strong>and mixed <em>text</em></strong><strong><em>block</em> <em>examples</em></strong> snippet</div>')
    const consecutiveNewLines = createElement('<div>Consecutive<br><br>new lines</div>')
    const emptyTags = createElement('<div>Example with <strong>empty <em></em>nested</strong><br>tags</div>')

    it('works with plain block', function () {
      const expected = createElement('<div>Plain <strong>textblock</strong> example snippet</div>')
      const actual = plain.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('does not merge tags if not consecutives', function () {
      const expected = plainWithSpace.cloneNode(true)
      const actual = plainWithSpace.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('works with nested blocks', function () {
      const expected = createElement('<div>Nested <strong><em>textblock</em></strong> example snippet</div>')
      const actual = nested.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('works with nested blocks that mix other tags', function () {
      const expected = createElement('<div>Nested <strong>and mixed <em>textblock</em> <em>examples</em></strong> snippet</div>')
      const actual = nestedMixed.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('does not merge consecutive new lines', function () {
      const expected = consecutiveNewLines.cloneNode(true)
      const actual = consecutiveNewLines.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('should remove empty tags and preserve new lines', function () {
      const expected = createElement('<div>Example with <strong>empty nested</strong><br>tags</div>')
      const actual = emptyTags.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })
  })

  describe('normalizeWhitespace()', function () {

    beforeEach(function () {
      this.element = createElement('<div></div>')
    })

    it('replaces whitespace with spaces', function () {
      this.element.innerHTML = '&nbsp; \ufeff'
      let text = this.element.textContent

      // Check that textContent works as expected
      expect(text).toEqual('\u00A0 \ufeff')

      text = content.normalizeWhitespace(text)
      expect(text).toEqual('   ') // Check for three spaces
    })
  })

  describe('getInnerTags()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('works with partially selected <strong><em>', function () {
      // <div>|a <strong><em>b|</em></strong> c</div>
      const test = createElement('<div>a <strong><em>b</em></strong> c</div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test.querySelector('em'), 1)
      const tags = content.getInnerTags(this.range)
      expect(content.getTagNames(tags)).toEqual(['STRONG', 'EM'])
    })

    it('gets nothing inside a <b>', function () {
      // <div><b>|a|</b></div>
      const test = createElement('<div><b>a</b></div>')
      this.range.setStart(test.querySelector('b'), 0)
      this.range.setEnd(test.querySelector('b'), 1)
      const tags = content.getInnerTags(this.range)
      expect(content.getTagNames(tags)).toEqual([])
    })

    it('gets a fully surrounded <b>', function () {
      // <div>|<b>a</b>|</div>
      const test = createElement('<div><b>a</b></div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test, 1)
      const tags = content.getInnerTags(this.range)
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('gets partially selected <b> and <i>', function () {
      // <div><b>a|b</b><i>c|d</i></div>
      const test = createElement('<div><b>ab</b><i>cd</i></div>')
      const range = rangy.createRange()
      range.setStart(test.querySelector('b').firstChild, 1)
      range.setEnd(test.querySelector('i').firstChild, 1)
      const tags = content.getInnerTags(range)
      expect(content.getTagNames(tags)).toEqual(['B', 'I'])
    })
  })

  describe('getTags()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('inside <b>', function () {
      // <div><b>|a|</b></div>
      const test = createElement('<div><b>a</b></div>')
      this.range.setStart(test.querySelector('b'), 0)
      this.range.setEnd(test.querySelector('b'), 1)
      const tags = content.getTags(test, this.range)
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('insde <em><b>', function () {
      // <div><i><b>|a|</b></i></div>
      const test = createElement('<div><i><b>a</b></i></div>')
      this.range.setStart(test.querySelector('b'), 0)
      this.range.setEnd(test.querySelector('b'), 1)
      const tags = content.getTags(test, this.range)
      expect(content.getTagNames(tags)).toEqual(['B', 'I'])
    })
  })

  describe('getTagsByName()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('filters outer tags', function () {
      // <div><i><b>|a|</b></i></div>
      const test = createElement('<div><i><b>a</b></i></div>')
      this.range.setStart(test.querySelector('b'), 0)
      this.range.setEnd(test.querySelector('b'), 1)
      const tags = content.getTagsByName(test, this.range, 'b')
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('filters inner tags', function () {
      // <div>|<i><b>a</b></i>|</div>
      const test = createElement('<div><i><b>a</b></i></div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test, 1)
      const tags = content.getTagsByName(test, this.range, 'i')
      expect(content.getTagNames(tags)).toEqual(['I'])
    })
  })

  describe('getTagsByNameAndAttributes()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('filters tag with attributes match', function () {
      const test = createElement('<div><span class="foo"><span class="test">a</span></span></div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test, 1)
      const tags = content.getTagsByNameAndAttributes(test, this.range, createElement('<span class="foo">'))
      expect(content.getTagNames(tags)).toEqual(['SPAN'])
    })

    it('filters tag with attributes match', function () {
      const test = createElement('<div><span class="foo"><span class="foo">a</span></span></div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test, 1)
      const tags = content.getTagsByNameAndAttributes(test, this.range, createElement('<span class="foo">'))
      expect(content.getTagNames(tags)).toEqual(['SPAN', 'SPAN'])
    })

    it('filters inner tags', function () {
      // <div>|<span class="foo"><span class="test">a</span></span>|</div>
      const test = createElement('<div><span class="foo"><span class="test">a</span></span></div>')
      this.range.setStart(test, 0)
      this.range.setEnd(test, 1)
      const tags = content.getTagsByNameAndAttributes(test, this.range, createElement('<span class="foo">'))
      expect(content.getTagNames(tags)).toEqual(['SPAN'])
    })
  })

  describe('wrap()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('creates an <em>', function () {
      // <div>|b|</div>
      const host = createElement('<div>b</div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 1)

      content.wrap(this.range, '<em>')
      expect(host.innerHTML).toEqual('<em>b</em>')
    })
  })

  describe('isAffectedBy()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('detects a <b> tag', function () {
      // <div><b>|a|</b></div>
      const host = createElement('<div><b>a</b></div>')
      this.range.setStart(host.querySelector('b'), 0)
      this.range.setEnd(host.querySelector('b'), 1)

      expect(content.isAffectedBy(host, this.range, 'b')).toEqual(true)
      expect(content.isAffectedBy(host, this.range, 'strong')).toEqual(false)
    })
  })

  describe('containsString()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('finds a character in the this.range', function () {
      // <div>|ab|c</div>
      const host = createElement('<div>abc</div>')
      this.range.setStart(host.firstChild, 0)
      this.range.setEnd(host.firstChild, 2)

      expect(content.containsString(this.range, 'a')).toEqual(true)
      expect(content.containsString(this.range, 'b')).toEqual(true)
      expect(content.containsString(this.range, 'c')).toEqual(false)
    })
  })

  describe('deleteCharacter()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('removes a character in the this.range and preserves the this.range', function () {
      // <div>|ab|c</div>
      const host = createElement('<div>abc</div>')
      this.range.setStart(host.firstChild, 0)
      this.range.setEnd(host.firstChild, 2)

      this.range = content.deleteCharacter(host, this.range, 'a')
      expect(host.innerHTML).toEqual('bc')

      // show resulting text nodes
      expect(host.childNodes.length).toEqual(1)
      expect(host.childNodes[0].nodeValue).toEqual('bc')

      // check this.range. It should look like this:
      // <div>|b|c</div>
      expect(this.range.startContainer).toEqual(host)
      expect(this.range.startOffset).toEqual(0)
      expect(this.range.endContainer).toEqual(host.firstChild)
      expect(this.range.endOffset).toEqual(1)
      expect(this.range.toString()).toEqual('b')
    })

    it('works with a partially selected tag', function () {
      // <div>|a<em>b|b</em></div>
      const host = createElement('<div>a<em>bb</em></div>')
      this.range.setStart(host.firstChild, 0)
      this.range.setEnd(host.querySelector('em').firstChild, 1)

      this.range = content.deleteCharacter(host, this.range, 'b')
      expect(host.innerHTML).toEqual('a<em>b</em>')

      // show resulting nodes
      expect(host.childNodes.length).toEqual(2)
      expect(host.childNodes[0].nodeValue).toEqual('a')
      expect(host.childNodes[1].tagName).toEqual('EM')
    })
  })

  describe('toggleTag()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('toggles a <b> tag', function () {
      // <div><b>|a|</b></div>
      const host = createElement('<div><b>a</b></div>')
      this.range.setStart(host.querySelector('b'), 0)
      this.range.setEnd(host.querySelector('b'), 1)

      this.range = content.toggleTag(host, this.range, createElement('<b>'))
      expect(host.innerHTML).toEqual('a')

      content.toggleTag(host, this.range, createElement('<b>'))
      expect(host.innerHTML).toEqual('<b>a</b>')
    })
  })

  describe('nuke()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('removes surrounding <b>', function () {
      // <div><b>|a|</b></div>
      const host = createElement('<div><b>a</b></div>')
      this.range.setStart(host.querySelector('b'), 0)
      this.range.setEnd(host.querySelector('b'), 1)
      content.nuke(host, this.range)
      expect(host.innerHTML).toEqual('a')
    })

    it('removes tons of tags', function () {
      // <div><b>|a<i>b</i><em>c|d</em></b></div>
      const host = createElement('<div><b>a<i>b</i><em>cd</em></b></div>')
      this.range.setStart(host.querySelector('b'), 0)
      this.range.setEnd(host.querySelector('em').firstChild, 1)
      content.nuke(host, this.range)
      expect(host.innerHTML).toEqual('abcd')
    })

    it('leaves <br> alone', function () {
      // <div>|a<br>b|</div>
      const host = createElement('<div>a<br>b</div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 3)
      content.nuke(host, this.range)
      expect(host.innerHTML).toEqual('a<br>b')
    })

    it('leaves saved this.range markers intact', function () {
      // <div><b>|a|</b></div>
      const host = createElement('<div><b>a</b></div>')
      this.range.setStart(host.querySelector('b'), 0)
      this.range.setEnd(host.querySelector('b'), 1)
      rangeSaveRestore.save(this.range)
      content.nuke(host, this.range)
      expect(host.querySelectorAll('span').length).toEqual(2)
      expect(host.querySelectorAll('b').length).toEqual(0)
    })
  })

  describe('forceWrap()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('adds a link with an href attribute', function () {
      // <div>|b|</div>
      const host = createElement('<div>b</div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 1)

      const link = createElement('<a>')
      link.setAttribute('href', 'www.link.io')

      content.forceWrap(host, this.range, link)
      expect(host.innerHTML).toEqual('<a href="www.link.io">b</a>')
    })

    it('does not nest tags', function () {
      // <div>|<em>b</em>|</div>
      const host = createElement('<div><em>b</em></div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 1)

      const em = createElement('<em>')
      content.forceWrap(host, this.range, em)
      expect(host.innerHTML).toEqual('<em>b</em>')
    })

    it('removes partially selected tags', function () {
      // <div><em>b|c|</em></div>
      const host = createElement('<div><em>bc</em></div>')
      this.range.setStart(host.querySelector('em').firstChild, 1)
      this.range.setEnd(host.querySelector('em').firstChild, 2)

      const em = createElement('<em>')
      content.forceWrap(host, this.range, em)
      expect(host.innerHTML).toEqual('b<em>c</em>')
    })
  })

  describe('surround()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('wraps text in double angle quotes', function () {
      // <div><i>|b|</i></div>
      const host = createElement('<div><i>a</i></div>')
      this.range.setStart(host.querySelector('i'), 0)
      this.range.setEnd(host.querySelector('i'), 1)
      content.surround(host, this.range, '«', '»')
      expect(host.innerHTML).toEqual('<i>«a»</i>')
    })

    it('wraps text in double angle quotes', function () {
      // <div><i>|b|</i></div>
      const host = createElement('<div><i>a</i></div>')
      this.range.setStart(host.querySelector('i'), 0)
      this.range.setEnd(host.querySelector('i'), 1)
      content.surround(host, this.range, '«', '»')

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.querySelector('i').childNodes[0].nodeValue).toEqual('«')
      expect(host.querySelector('i').childNodes[1].nodeValue).toEqual('a')
      expect(host.querySelector('i').childNodes[2].nodeValue).toEqual('»')

      expect(this.range.startContainer).toEqual(host.querySelector('i'))
      expect(this.range.startOffset).toEqual(0)
      expect(this.range.endContainer).toEqual(host.querySelector('i'))
      expect(this.range.endOffset).toEqual(3)
    })

    it('wraps text in double angle quotes', function () {
      // <div><i>a|b|</i></div>
      const host = createElement('<div><i>ab</i></div>')
      this.range.setStart(host.querySelector('i').firstChild, 1)
      this.range.setEnd(host.querySelector('i').firstChild, 2)
      content.surround(host, this.range, '«', '»')
      expect(host.innerHTML).toEqual('<i>a«b»</i>')

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.querySelector('i').childNodes[0].nodeValue).toEqual('a«')
      expect(host.querySelector('i').childNodes[1].nodeValue).toEqual('b')
      expect(host.querySelector('i').childNodes[2].nodeValue).toEqual('»')
      expect(this.range.startContainer).toEqual(host.querySelector('i').firstChild)
      expect(this.range.startOffset).toEqual(1)
      expect(this.range.endContainer).toEqual(host.querySelector('i'))
      expect(this.range.endOffset).toEqual(3)
    })
  })

  describe('isExactSelection()', function () {

    beforeEach(function () {
      this.range = rangy.createRange()
    })

    it('is true if the selection is directly outside the tag', function () {
      // <div>|<em>b</em>|</div>
      const host = createElement('<div><em>b</em></div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 1)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(true)
    })

    it('is true if the selection is directly inside the tag', function () {
      // <div><em>|b|</em></div>
      const host = createElement('<div><em>b</em></div>')
      this.range.setStart(host.querySelector('em'), 0)
      this.range.setEnd(host.querySelector('em'), 1)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(true)
    })

    it('is false if the selection goes beyond the tag', function () {
      // <div>|a<em>b</em>|</div>
      const host = createElement('<div>a<em>b</em></div>')
      this.range.setStart(host, 0)
      this.range.setEnd(host, 2)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(false)
    })

    it('is false if the selection is only partial', function () {
      // <div><em>a|b|</em></div>
      const host = createElement('<div><em>ab</em></div>')
      this.range.setEnd(host.querySelector('em').firstChild, 1)
      this.range.setEnd(host.querySelector('em').firstChild, 2)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(false)
    })

    it('is false for a collapsed this.range', function () {
      // <div><em>a|b</em></div>
      const host = createElement('<div><em>ab</em></div>')
      this.range.setEnd(host.querySelector('em').firstChild, 1)
      this.range.setEnd(host.querySelector('em').firstChild, 1)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(false)
    })

    it('is false for a collapsed this.range in an empty tag', function () {
      // <div><em>|</em></div>
      const host = createElement('<div><em></em></div>')
      this.range.setEnd(host.querySelector('em'), 0)
      this.range.setEnd(host.querySelector('em'), 0)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(false)
    })

    it('is false if this.range and elem do not overlap but have the same content', function () {
      // <div>|b|<em>b</em></div>
      const host = createElement('<div>b<em>b</em></div>')
      this.range.setEnd(host.firstChild, 0)
      this.range.setEnd(host.firstChild, 1)

      const exact = content.isExactSelection(this.range, host.querySelector('em'))
      expect(exact).toEqual(false)
    })
  })

  describe('extractContent()', function () {
    let host

    beforeEach(function () {
      host = createElement('<div></div>')
    })

    it('extracts the content', function () {
      host.innerHTML = 'a'
      const result = content.extractContent(host)
      // escape to show invisible characters
      expect(escape(result)).toEqual('a')
    })

    it('extracts the content from a document fragment', function () {
      host.innerHTML = 'a<span>b</span>c'
      const element = host
      const fragment = document.createDocumentFragment()
      Array.from(element.childNodes).forEach((child) => {
        fragment.appendChild(child.cloneNode(true))
      })
      expect(content.extractContent(fragment)).toEqual('a<span>b</span>c')
    })

    it('replaces a zeroWidthSpace with a <br> tag', function () {
      host.innerHTML = 'a\u200B'
      const result = content.extractContent(host)
      expect(result).toEqual('a<br>')
    })

    it('removes zeroWidthNonBreakingSpaces', function () {
      host.innerHTML = 'a\uFEFF'
      const result = content.extractContent(host)
      // escape to show invisible characters
      expect(escape(result)).toEqual('a')
    })

    it('removes a marked linebreak', function () {
      host.innerHTML = '<br data-editable="remove">'
      const result = content.extractContent(host)
      expect(result).toEqual('')
    })

    it('removes two nested marked spans', function () {
      host.innerHTML = '<span data-editable="unwrap"><span data-editable="unwrap">a</span></span>'
      const result = content.extractContent(host)
      expect(result).toEqual('a')
    })

    it('removes two adjacent marked spans', function () {
      host.innerHTML = '<span data-editable="remove"></span><span data-editable="remove"></span>'
      const result = content.extractContent(host)
      expect(result).toEqual('')
    })

    it('unwraps two marked spans around text', function () {
      host.innerHTML = '|<span data-editable="unwrap">a</span>|<span data-editable="unwrap">b</span>|'
      const result = content.extractContent(host)
      expect(result).toEqual('|a|b|')
    })

    it('unwraps a "ui-unwrap" span', function () {
      host.innerHTML = 'a<span data-editable="ui-unwrap">b</span>c'
      const result = content.extractContent(host)
      expect(result).toEqual('abc')
    })

    it('removes a "ui-remove" span', function () {
      host.innerHTML = 'a<span data-editable="ui-remove">b</span>c'
      const result = content.extractContent(host)
      expect(result).toEqual('ac')
    })

    describe('called with keepUiElements', function () {

      it('does not unwrap a "ui-unwrap" span', function () {
        host.innerHTML = 'a<span data-editable="ui-unwrap">b</span>c'
        const result = content.extractContent(host, true)
        expect(result).toEqual('a<span data-editable="ui-unwrap">b</span>c')
      })

      it('does not remove a "ui-remove" span', function () {
        host.innerHTML = 'a<span data-editable="ui-remove">b</span>c'
        const result = content.extractContent(host, true)
        expect(result).toEqual('a<span data-editable="ui-remove">b</span>c')
      })
    })

    describe('with ranges', function () {

      beforeEach(function () {
        document.body.appendChild(host)
        this.range = rangy.createRange()
      })

      afterEach(function () {
        host.remove()
      })

      it('removes saved ranges', function () {
        host.innerHTML = 'a'
        this.range.setStart(host, 0)
        this.range.setEnd(host, 0)
        rangeSaveRestore.save(this.range)
        const result = content.extractContent(host)
        expect(result).toEqual('a')
      })

      it('leaves the saved this.ranges in the host', function () {
        this.range.setStart(host, 0)
        this.range.setEnd(host, 0)
        rangeSaveRestore.save(this.range)
        content.extractContent(host)
        expect(host.firstChild.nodeName).toEqual('SPAN')
      })

      it('removes a saved this.range in an otherwise empty host', function () {
        this.range.setStart(host, 0)
        this.range.setEnd(host, 0)
        rangeSaveRestore.save(this.range)
        const result = content.extractContent(host)
        expect(result).toEqual('')
      })
    })
  })
})

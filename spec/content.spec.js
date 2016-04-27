import $ from 'jquery'
import rangy from 'rangy'

import * as content from '../src/content'
import * as rangeSaveRestore from '../src/range-save-restore'

rangy.init()

describe('Content', () => {
  describe('normalizeTags()', () => {
    const plain = $('<div>Plain <strong>text</strong><strong>block</strong> example snippet</div>')[0]
    const plainWithSpace = $('<div>Plain <strong>text</strong> <strong>block</strong> example snippet</div>')[0]
    const nested = $('<div>Nested <strong><em>text</em></strong><strong><em>block</em></strong> example snippet</div>')[0]
    const nestedMixed = $('<div>Nested <strong>and mixed <em>text</em></strong><strong><em>block</em> <em>examples</em></strong> snippet</div>')[0]
    const consecutiveNewLines = $('<div>Consecutive<br><br>new lines</div>')[0]
    const emptyTags = $('<div>Example with <strong>empty <em></em>nested</strong><br>tags</div>')[0]

    it('works with plain block', () => {
      const expected = $('<div>Plain <strong>textblock</strong> example snippet</div>')[0]
      const actual = plain.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('does not merge tags if not consecutives', () => {
      const expected = plainWithSpace.cloneNode(true)
      const actual = plainWithSpace.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('works with nested blocks', () => {
      const expected = $('<div>Nested <strong><em>textblock</em></strong> example snippet</div>')[0]
      const actual = nested.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('works with nested blocks that mix other tags', () => {
      const expected = $('<div>Nested <strong>and mixed <em>textblock</em> <em>examples</em></strong> snippet</div>')[0]
      const actual = nestedMixed.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('does not merge consecutive new lines', () => {
      const expected = consecutiveNewLines.cloneNode(true)
      const actual = consecutiveNewLines.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })

    it('should remove empty tags and preserve new lines', () => {
      const expected = $('<div>Example with <strong>empty nested</strong><br>tags</div>')[0]
      const actual = emptyTags.cloneNode(true)
      content.normalizeTags(actual)
      expect(actual.innerHTML).toEqual(expected.innerHTML)
    })
  })

  describe('normalizeWhitespace()', function () {
    beforeEach(() => {
      this.element = $('<div></div>')[0]
    })

    it('replaces whitespace with spaces', () => {
      this.element.innerHTML = '&nbsp; \ufeff'
      let text = this.element.textContent

      // Check that textContent works as expected
      expect(text).toEqual('\u00A0 \ufeff')

      text = content.normalizeWhitespace(text)
      expect(text).toEqual('   ') // Check for three spaces
    })
  })

  describe('getInnerTags()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('works with partially selected <strong><em>', () => {
      // <div>|a <strong><em>b|</em></strong> c</div>
      const test = $('<div>a <strong><em>b</em></strong> c</div>')
      range.setStart(test[0], 0)
      range.setEnd(test.find('em')[0], 1)
      const tags = content.getInnerTags(range)
      expect(content.getTagNames(tags)).toEqual(['STRONG', 'EM'])
    })

    it('gets nothing inside a <b>', () => {
      // <div><b>|a|</b></div>
      const test = $('<div><b>a</b></div>')
      range.setStart(test.find('b')[0], 0)
      range.setEnd(test.find('b')[0], 1)
      const tags = content.getInnerTags(range)
      expect(content.getTagNames(tags)).toEqual([])
    })

    it('gets a fully surrounded <b>', () => {
      // <div>|<b>a</b>|</div>
      const test = $('<div><b>a</b></div>')
      range.setStart(test[0], 0)
      range.setEnd(test[0], 1)
      const tags = content.getInnerTags(range)
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('gets partially selected <b> and <i>', () => {
      // <div><b>a|b</b><i>c|d</i></div>
      const test = $('<div><b>ab</b><i>cd</i></div>')
      const range = rangy.createRange()
      range.setStart(test.find('b')[0].firstChild, 1)
      range.setEnd(test.find('i')[0].firstChild, 1)
      const tags = content.getInnerTags(range)
      expect(content.getTagNames(tags)).toEqual(['B', 'I'])
    })
  })

  describe('getTags()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('inside <b>', () => {
      // <div><b>|a|</b></div>
      const test = $('<div><b>a</b></div>')
      range.setStart(test.find('b')[0], 0)
      range.setEnd(test.find('b')[0], 1)
      const tags = content.getTags(test[0], range)
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('insde <em><b>', () => {
      // <div><i><b>|a|</b></i></div>
      const test = $('<div><i><b>a</b></i></div>')
      range.setStart(test.find('b')[0], 0)
      range.setEnd(test.find('b')[0], 1)
      const tags = content.getTags(test[0], range)
      expect(content.getTagNames(tags)).toEqual(['B', 'I'])
    })
  })

  describe('getTagsByName()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('filters outer tags', () => {
      // <div><i><b>|a|</b></i></div>
      const test = $('<div><i><b>a</b></i></div>')
      range.setStart(test.find('b')[0], 0)
      range.setEnd(test.find('b')[0], 1)
      const tags = content.getTagsByName(test[0], range, 'b')
      expect(content.getTagNames(tags)).toEqual(['B'])
    })

    it('filters inner tags', () => {
      // <div>|<i><b>a</b></i>|</div>
      const test = $('<div><i><b>a</b></i></div>')
      range.setStart(test[0], 0)
      range.setEnd(test[0], 1)
      const tags = content.getTagsByName(test[0], range, 'i')
      expect(content.getTagNames(tags)).toEqual(['I'])
    })
  })

  describe('wrap()', () => {
    let range

    beforeEach(() => {
      range = rangy.createRange()
    })

    it('creates an <em>', () => {
      // <div>|b|</div>
      const host = $('<div>b</div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 1)

      content.wrap(range, '<em>')
      expect(host.html()).toEqual('<em>b</em>')
    })
  })

  describe('isAffectedBy()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('detects a <b> tag', () => {
      // <div><b>|a|</b></div>
      const host = $('<div><b>a</b></div>')
      range.setStart(host.find('b')[0], 0)
      range.setEnd(host.find('b')[0], 1)

      expect(content.isAffectedBy(host[0], range, 'b')).toEqual(true)
      expect(content.isAffectedBy(host[0], range, 'strong')).toEqual(false)
    })
  })

  describe('containsString()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('finds a character in the range', () => {
      // <div>|ab|c</div>
      const host = $('<div>abc</div>')
      range.setStart(host[0].firstChild, 0)
      range.setEnd(host[0].firstChild, 2)

      expect(content.containsString(range, 'a')).toEqual(true)
      expect(content.containsString(range, 'b')).toEqual(true)
      expect(content.containsString(range, 'c')).toEqual(false)
    })
  })

  describe('deleteCharacter()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('removes a character in the range and preserves the range', () => {
      // <div>|ab|c</div>
      const host = $('<div>abc</div>')
      range.setStart(host[0].firstChild, 0)
      range.setEnd(host[0].firstChild, 2)

      range = content.deleteCharacter(host[0], range, 'a')
      expect(host.html()).toEqual('bc')

      // show resulting text nodes
      expect(host[0].childNodes.length).toEqual(1)
      expect(host[0].childNodes[0].nodeValue).toEqual('bc')

      // check range. It should look like this:
      // <div>|b|c</div>
      expect(range.startContainer).toEqual(host[0])
      expect(range.startOffset).toEqual(0)
      expect(range.endContainer).toEqual(host[0].firstChild)
      expect(range.endOffset).toEqual(1)
      expect(range.toString()).toEqual('b')
    })

    it('works with a partially selected tag', () => {
      // <div>|a<em>b|b</em></div>
      const host = $('<div>a<em>bb</em></div>')
      range.setStart(host[0].firstChild, 0)
      range.setEnd(host.find('em')[0].firstChild, 1)

      range = content.deleteCharacter(host[0], range, 'b')
      expect(host.html()).toEqual('a<em>b</em>')

      // show resulting nodes
      expect(host[0].childNodes.length).toEqual(2)
      expect(host[0].childNodes[0].nodeValue).toEqual('a')
      expect(host[0].childNodes[1].tagName).toEqual('EM')
    })
  })

  describe('toggleTag()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('toggles a <b> tag', () => {
      // <div><b>|a|</b></div>
      const host = $('<div><b>a</b></div>')
      range.setStart(host.find('b')[0], 0)
      range.setEnd(host.find('b')[0], 1)

      range = content.toggleTag(host[0], range, $('<b>')[0])
      expect(host.html()).toEqual('a')

      content.toggleTag(host[0], range, $('<b>')[0])
      expect(host.html()).toEqual('<b>a</b>')
    })
  })

  describe('nuke()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('removes surrounding <b>', () => {
      // <div><b>|a|</b></div>
      const host = $('<div><b>a</b></div>')
      range.setStart(host.find('b')[0], 0)
      range.setEnd(host.find('b')[0], 1)
      content.nuke(host[0], range)
      expect(host.html()).toEqual('a')
    })

    it('removes tons of tags', () => {
      // <div><b>|a<i>b</i><em>c|d</em></b></div>
      const host = $('<div><b>a<i>b</i><em>cd</em></b></div>')
      range.setStart(host.find('b')[0], 0)
      range.setEnd(host.find('em')[0].firstChild, 1)
      content.nuke(host[0], range)
      expect(host.html()).toEqual('abcd')
    })

    it('leaves <br> alone', () => {
      // <div>|a<br>b|</div>
      const host = $('<div>a<br>b</div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 3)
      content.nuke(host[0], range)
      expect(host.html()).toEqual('a<br>b')
    })

    it('leaves saved range markers intact', () => {
      // <div><b>|a|</b></div>
      const host = $('<div><b>a</b></div>')
      range.setStart(host.find('b')[0], 0)
      range.setEnd(host.find('b')[0], 1)
      rangeSaveRestore.save(range)
      content.nuke(host[0], range)
      expect(host.find('span').length).toEqual(2)
      expect(host.find('b').length).toEqual(0)
    })
  })

  describe('forceWrap()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('adds a link with an href attribute', () => {
      // <div>|b|</div>
      const host = $('<div>b</div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 1)

      const $link = $('<a>')
      $link.attr('href', 'www.link.io')

      content.forceWrap(host[0], range, $link[0])
      expect(host.html()).toEqual('<a href="www.link.io">b</a>')
    })

    it('does not nest tags', () => {
      // <div>|<em>b</em>|</div>
      const host = $('<div><em>b</em></div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 1)

      const $em = $('<em>')
      content.forceWrap(host[0], range, $em[0])
      expect(host.html()).toEqual('<em>b</em>')
    })

    it('removes partially selected tags', () => {
      // <div><em>b|c|</em></div>
      const host = $('<div><em>bc</em></div>')
      range.setStart(host.find('em')[0].firstChild, 1)
      range.setEnd(host.find('em')[0].firstChild, 2)

      const $em = $('<em>')
      content.forceWrap(host[0], range, $em[0])
      expect(host.html()).toEqual('b<em>c</em>')
    })
  })

  describe('surround()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('wraps text in double angle quotes', () => {
      // <div><i>|b|</i></div>
      const host = $('<div><i>a</i></div>')
      range.setStart(host.find('i')[0], 0)
      range.setEnd(host.find('i')[0], 1)
      content.surround(host[0], range, '«', '»')
      expect(host.html()).toEqual('<i>«a»</i>')
    })

    it('wraps text in double angle quotes', () => {
      // <div><i>|b|</i></div>
      const host = $('<div><i>a</i></div>')
      range.setStart(host.find('i')[0], 0)
      range.setEnd(host.find('i')[0], 1)
      content.surround(host[0], range, '«', '»')

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.find('i')[0].childNodes[0].nodeValue).toEqual('«')
      expect(host.find('i')[0].childNodes[1].nodeValue).toEqual('a')
      expect(host.find('i')[0].childNodes[2].nodeValue).toEqual('»')

      expect(range.startContainer).toEqual(host.find('i')[0])
      expect(range.startOffset).toEqual(0)
      expect(range.endContainer).toEqual(host.find('i')[0])
      expect(range.endOffset).toEqual(3)
    })

    it('wraps text in double angle quotes', () => {
      // <div><i>a|b|</i></div>
      const host = $('<div><i>ab</i></div>')
      range.setStart(host.find('i')[0].firstChild, 1)
      range.setEnd(host.find('i')[0].firstChild, 2)
      content.surround(host[0], range, '«', '»')
      expect(host.html()).toEqual('<i>a«b»</i>')

      // the text nodes are not glued together as they should.
      // So we have 3 TextNodes after the manipulation.
      expect(host.find('i')[0].childNodes[0].nodeValue).toEqual('a«')
      expect(host.find('i')[0].childNodes[1].nodeValue).toEqual('b')
      expect(host.find('i')[0].childNodes[2].nodeValue).toEqual('»')
      expect(range.startContainer).toEqual(host.find('i')[0].firstChild)
      expect(range.startOffset).toEqual(1)
      expect(range.endContainer).toEqual(host.find('i')[0])
      expect(range.endOffset).toEqual(3)
    })
  })

  describe('isExactSelection()', () => {
    let range
    beforeEach(() => {
      range = rangy.createRange()
    })

    it('is true if the selection is directly outside the tag', () => {
      // <div>|<em>b</em>|</div>
      const host = $('<div><em>b</em></div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 1)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(true)
    })

    it('is true if the selection is directly inside the tag', () => {
      // <div><em>|b|</em></div>
      const host = $('<div><em>b</em></div>')
      range.setStart(host.find('em')[0], 0)
      range.setEnd(host.find('em')[0], 1)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(true)
    })

    it('is false if the selection goes beyond the tag', () => {
      // <div>|a<em>b</em>|</div>
      const host = $('<div>a<em>b</em></div>')
      range.setStart(host[0], 0)
      range.setEnd(host[0], 2)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(false)
    })

    it('is false if the selection is only partial', () => {
      // <div><em>a|b|</em></div>
      const host = $('<div><em>ab</em></div>')
      range.setEnd(host.find('em')[0].firstChild, 1)
      range.setEnd(host.find('em')[0].firstChild, 2)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(false)
    })

    it('is false for a collapsed range', () => {
      // <div><em>a|b</em></div>
      const host = $('<div><em>ab</em></div>')
      range.setEnd(host.find('em')[0].firstChild, 1)
      range.setEnd(host.find('em')[0].firstChild, 1)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(false)
    })

    it('is false for a collapsed range in an empty tag', () => {
      // <div><em>|</em></div>
      const host = $('<div><em></em></div>')
      range.setEnd(host.find('em')[0], 0)
      range.setEnd(host.find('em')[0], 0)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(false)
    })

    it('is false if range and elem do not overlap but have the same content', () => {
      // <div>|b|<em>b</em></div>
      const host = $('<div>b<em>b</em></div>')
      range.setEnd(host[0].firstChild, 0)
      range.setEnd(host[0].firstChild, 1)

      const exact = content.isExactSelection(range, host.find('em')[0])
      expect(exact).toEqual(false)
    })
  })

  describe('extractContent()', () => {
    let $host

    beforeEach(() => {
      $host = $('<div></div>')
    })

    it('extracts the content', () => {
      $host.html('a')
      const result = content.extractContent($host[0])
      // escape to show invisible characters
      expect(escape(result)).toEqual('a')
    })

    it('extracts the content from a document fragment', () => {
      $host.html('a<span>b</span>c')
      const element = $host[0]
      const fragment = document.createDocumentFragment()
      Array.from(element.childNodes).forEach((child) => {
        fragment.appendChild(child.cloneNode(true))
      })
      expect(content.extractContent(fragment)).toEqual('a<span>b</span>c')
    })

    it('replaces a zeroWidthSpace with a <br> tag', () => {
      $host.html('a\u200B')
      const result = content.extractContent($host[0])
      expect(result).toEqual('a<br>')
    })

    it('removes zeroWidthNonBreakingSpaces', () => {
      $host.html('a\uFEFF')
      const result = content.extractContent($host[0])
      // escape to show invisible characters
      expect(escape(result)).toEqual('a')
    })

    it('removes a marked linebreak', () => {
      $host.html('<br data-editable="remove">')
      const result = content.extractContent($host[0])
      expect(result).toEqual('')
    })

    it('removes two nested marked spans', () => {
      $host.html('<span data-editable="unwrap"><span data-editable="unwrap">a</span></span>')
      const result = content.extractContent($host[0])
      expect(result).toEqual('a')
    })

    it('removes two adjacent marked spans', () => {
      $host.html('<span data-editable="remove"></span><span data-editable="remove"></span>')
      const result = content.extractContent($host[0])
      expect(result).toEqual('')
    })

    it('unwraps two marked spans around text', () => {
      $host.html('|<span data-editable="unwrap">a</span>|<span data-editable="unwrap">b</span>|')
      const result = content.extractContent($host[0])
      expect(result).toEqual('|a|b|')
    })

    it('unwraps a "ui-unwrap" span', () => {
      $host.html('a<span data-editable="ui-unwrap">b</span>c')
      const result = content.extractContent($host[0])
      expect(result).toEqual('abc')
    })

    it('removes a "ui-remove" span', () => {
      $host.html('a<span data-editable="ui-remove">b</span>c')
      const result = content.extractContent($host[0])
      expect(result).toEqual('ac')
    })

    describe('called with keepUiElements', () => {
      it('does not unwrap a "ui-unwrap" span', () => {
        $host.html('a<span data-editable="ui-unwrap">b</span>c')
        const result = content.extractContent($host[0], true)
        expect(result).toEqual('a<span data-editable="ui-unwrap">b</span>c')
      })

      it('does not remove a "ui-remove" span', () => {
        $host.html('a<span data-editable="ui-remove">b</span>c')
        const result = content.extractContent($host[0], true)
        expect(result).toEqual('a<span data-editable="ui-remove">b</span>c')
      })
    })

    describe('with ranges', () => {
      let range
      beforeEach(() => {
        $host.appendTo(document.body)
        range = rangy.createRange()
      })

      afterEach(() => {
        $host.remove()
      })

      it('removes saved ranges', () => {
        $host.html('a')
        range.setStart($host[0], 0)
        range.setEnd($host[0], 0)
        rangeSaveRestore.save(range)
        const result = content.extractContent($host[0])
        expect(result).toEqual('a')
      })

      it('leaves the saved ranges in the host', () => {
        range.setStart($host[0], 0)
        range.setEnd($host[0], 0)
        rangeSaveRestore.save(range)
        content.extractContent($host[0])
        expect($host[0].firstChild.nodeName).toEqual('SPAN')
      })

      it('removes a saved range in an otherwise empty host', () => {
        range.setStart($host[0], 0)
        range.setEnd($host[0], 0)
        rangeSaveRestore.save(range)
        const result = content.extractContent($host[0])
        expect(result).toEqual('')
      })
    })
  })
})

import {expect} from 'chai'
import sinon from 'sinon'

import {Editable} from '../src/core.js'
import highlightSupport from '../src/highlight-support.js'
import {createElement, createRange, toCharacterRange} from '../src/util/dom.js'
import Selection from '../src/selection.js'

function setupHighlightEnv (context, text) {
  context.text = text
  context.div = createElement(`<div>${context.text}</div>`)
  document.body.appendChild(context.div)
  if (context.editable) context.editable.unload()
  context.editable = new Editable()
  context.editable.add(context.div)

  context.getCharacterRange = () => {
    const range = createRange()
    range.selectNodeContents(context.div)
    const selection = new Selection(context.div, range)
    return selection.getTextRange()
  }

  // eslint-disable-next-line no-shadow
  context.highlightRange = (text, highlightId, start, end, dispatcher, type) => {
    return highlightSupport.highlightRange(
      context.div,
      text,
      highlightId,
      start,
      end,
      dispatcher,
      type
    )
  }

  context.removeHighlight = (highlightId, dispatcher) => {
    return highlightSupport.removeHighlight(
      context.div,
      highlightId,
      dispatcher
    )
  }

  // we don't want to compare the native range in our tests since this is a native JS object
  context.extractWithoutNativeRange = function (type) {
    const positions = context.editable.getHighlightPositions({editableHost: context.div, type})
    if (!positions) return undefined
    const extracted = {}
    for (const id in positions) {
      const val = positions[id]
      const {nativeRange, ...withoutNativeRange} = val // eslint-disable-line
      extracted[id] = withoutNativeRange
    }
    return extracted
  }

  context.extract = function (type) {
    return context.editable.getHighlightPositions({editableHost: context.div, type})
  }

  context.getHtml = function () {
    return context.div.innerHTML
  }

  context.formatHtml = (string) => {
    return createElement(`<div>${string.replace(/\n/gm, '')}</div>`).innerHTML
  }
}

describe('highlight-support:', function () {

  afterEach(function () {
    // teardownHighlightEnv
    this.div?.remove()
    this.editable?.unload()
  })

  describe('editable.highlight()', function () {

    beforeEach(function () {
      this.editable = new Editable()
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
    })

    it('skips and warns if an invalid range object was passed', function () {
      this.editable.highlight({
        editableHost: this.div,
        highlightId: 'myId',
        textRange: {foo: 3, bar: 7}
      })
      const highlightSpan = this.div.querySelectorAll('[data-word-id="myId"]')
      expect(highlightSpan.length).to.equal(0)
    })

    it('skips if the range exceeds the content length', function () {
      const result = this.editable.highlight({
        editableHost: this.div,
        highlightId: 'myId',
        textRange: {foo: 3, bar: 32}
      })
      const highlightSpan = this.div.querySelectorAll('[data-word-id="myId"]')
      expect(highlightSpan.length).to.equal(0)
      expect(result).to.equal(-1)
    })

    it('skips and warns if the range object represents a cursor', function () {
      this.editable.highlight({
        editableHost: this.div,
        highlightId: 'myId',
        textRange: {start: 3, end: 3}
      })

      const highlightSpan = this.div.querySelectorAll('[data-word-id="myId"]')
      expect(highlightSpan.length).to.equal(0)
    })
  })

  describe('highlightRange()', function () {

    it('handles a single highlight', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      const text = 'ple '
      const startIndex = this.highlightRange(text, 'myId', 3, 7)
      const expectedRanges = {
        myId: {
          text: 'ple ',
          start: 3,
          end: 7
        }
      }
      const expectedHtml = this.formatHtml(`Peo
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">ple </span>
Make The <br> World Go Round`)

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
      expect(startIndex).to.equal(3)
    })

    it('has the native range', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      this.highlightRange('ple ', 'myId', 3, 7)
      const extracted = this.extract()
      expect(extracted.myId.nativeRange.constructor.name).to.equal('Range')
    })

    it('handles adjaccent highlights', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      this.highlightRange('P', 'firstId', 0, 1)
      this.highlightRange('e', 'secondId', 1, 2)
      this.highlightRange('o', 'thirdId', 2, 3)
      this.highlightRange('p', 'fourthId', 3, 4)

      const expectedRanges = {
        firstId: {
          text: 'P',
          start: 0,
          end: 1
        },
        secondId: {
          text: 'e',
          start: 1,
          end: 2
        },
        thirdId: {
          text: 'o',
          start: 2,
          end: 3
        },
        fourthId: {
          text: 'p',
          start: 3,
          end: 4
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="firstId">P</span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId">e</span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="thirdId">o</span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fourthId">p</span>
le Make The <br> World Go Round`)

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)

    })

    it('handles nested highlights', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      this.highlightRange('P', 'firstId', 0, 1)
      this.highlightRange('e', 'secondId', 1, 2)
      this.highlightRange('ople', 'thirdId', 2, 6)
      this.highlightRange('People', 'fourthId', 0, 6)
      const expectedRanges = {
        firstId: {
          text: 'P',
          start: 0,
          end: 1
        },
        secondId: {
          text: 'e',
          start: 1,
          end: 2
        },
        thirdId: {
          text: 'ople',
          start: 2,
          end: 6
        },
        fourthId: {
          text: 'People',
          start: 0,
          end: 6
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="firstId">
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fourthId">P</span></span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId">
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fourthId">e</span></span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="thirdId">
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fourthId">ople</span></span>
 Make The <br> World Go Round`)

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
    })

    it('handles intersecting highlights', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      this.highlightRange('Peo', 'firstId', 0, 3)
      this.highlightRange('ople', 'secondId', 2, 6)
      this.highlightRange('le', 'thirdId', 4, 6)
      const expectedRanges = {
        firstId: {
          text: 'Peo',
          start: 0,
          end: 3
        },
        secondId: {
          text: 'ople',
          start: 2,
          end: 6
        },
        thirdId: {
          text: 'le',
          start: 4,
          end: 6
        }
      }

      const expectedHtml = this.formatHtml(`
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="firstId">Pe
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId">o</span></span>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId">p
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="thirdId">le</span></span>
 Make The <br> World Go Round`)
      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
    })

    // todo: it seems the string ' The \nWorld' does not matter -> check if this is true
    // todo: the input is ' The <br> World' which would be 11 - 23
    // todo:   is there some whitespace normalization going on?
    it('handles highlights containing break tags', function () {
      setupHighlightEnv(this, 'The <br> World Go Round')
      this.highlightRange('The  World', 'myId', 0, 10)
      const expectedRanges = {
        myId: {
          text: 'The  World',
          start: 0,
          end: 10
        }
      }
      const expectedHtml = this.formatHtml(`
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">The </span>
<br><span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId"> World</span>
 Go Round`)

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)

    })

    it('handles identical ranges', function () {
      setupHighlightEnv(this, 'People Make The World Go Round')
      this.highlightRange(' The World', 'firstId', 11, 21)
      this.highlightRange(' The World', 'secondId', 11, 21)
      const expectedRanges = {
        firstId: {
          text: ' The World',
          start: 11,
          end: 21
        },
        secondId: {
          text: ' The World',
          start: 11,
          end: 21
        }
      }
      const expectedHtml = this.formatHtml(`People Make
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="firstId">
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId"> The World</span>
</span>
 Go Round`)

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)

    })

    it('updates any existing range', function () {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
      this.highlightRange('a', 'myId', 11, 22)
      this.highlightRange('a', 'myId', 8, 9)
      const expectedRanges = {
        myId: {
          text: 'a',
          start: 8,
          end: 9
        }
      }
      const expectedHtml = this.formatHtml(`People M
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">a</span>
ke The <br> World Go Round`)

      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
      expect(this.getHtml()).to.equal(expectedHtml)
    })

    it('handles a <br> tag without whitespaces', function () {
      setupHighlightEnv(this, 'a<br>b')
      this.highlightRange('b', 'myId', 1, 2)
      const expectedHtml = this.formatHtml(`a<br>
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">b</span>`)

      expect(this.getHtml()).to.equal(expectedHtml)
    })

    it('does not throw when text has been deleted', function () {
      setupHighlightEnv(this, '')
      expect(() => this.highlightRange('not found', 'myId', 33, 38)).to.not.throw()
    })

    it('normalizes a simple text node after removing a highlight', function () {
      setupHighlightEnv(this, 'People Make The World Go Round')
      this.highlightRange('ple ', 'myId', 3, 7)
      const normalizeSpy = sinon.spy(this.div, 'normalize')
      this.removeHighlight('myId')
      // There is no way to see the actual error in a test since it only happens in (non-headless)
      // Chome environments. We just check if the normalize method has been called here.
      expect(normalizeSpy.callCount).to.equal(1)
      normalizeSpy.restore()
    })
  })

  describe('highlightRange() - with formatted text', function () {

    it('handles highlights surrounding <span> tags', function () {
      setupHighlightEnv(this, 'a<span>b</span>cd')
      this.highlightRange('bc', 'myId', 1, 3)
      const extract = this.extractWithoutNativeRange()

      expect(extract.myId.text).to.equal('bc')

      const content = this.getHtml()
      expect(content).to.equal('a<span><span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">b</span></span><span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">c</span>d')
    })

    it('handles highlights intersecting <span> tags', function () {
      setupHighlightEnv(this, 'a<span data-word-id="x">bc</span>d')
      this.highlightRange('ab', 'myId', 0, 2)
      const extract = this.extractWithoutNativeRange()

      expect(extract.myId.text).to.equal('ab')

      const content = this.getHtml()
      expect(content).to.equal('<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">a</span><span data-word-id="x"><span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">b</span>c</span>d')
    })
  })

  // How characters are counted determines how the the highlight
  // startIndex and endIndex are applied.
  describe('highlightRange() - character counting', function () {

    // actual / expected length / expected text
    const cases = [
      ['😐', 2, '😐'],
      ['&nbsp;', 1, ' '],
      [' ', 1, ' '], // 160 - no-break space
      [' ', 1, ' '], // 8201 - thin space
      [' ', 1, ' '], // 8202 - hair space
      ['\r', 1, '\n'], // was: ['\r', 0]
      ['\n', 1, '\n'], // was: ['\n', 0]
      ['\n 🌍', 4, '\n 🌍'], // new
      ['\r\n', 1, '\n'], // new
      ['\r \n', 3, '\n \n'], // new
      ['&nbsp; ', 2, '  '], // new
      ['<br>', 0]
    ]

    // Generate a test for each test case
    for (const [char, expectedLength, expectedText] of cases) {

      it(`treats '${char}' as ${expectedLength} characters`, function () {
        setupHighlightEnv(this, char)

        const {start, end} = this.getCharacterRange()
        this.highlightRange(char, 'char', start, end)

        if (expectedLength === 0) {
          expect(this.extractWithoutNativeRange()).to.equal(undefined)
        } else {
          expect(this.extractWithoutNativeRange()).to.deep.equal({
            char: {
              start: 0,
              end: expectedLength,
              text: expectedText
            }
          })
        }
      })
    }
  })

  describe('highlightRange() - with special characters', function () {

    it('maps selection offsets to ranges containing multibyte symbols consistently', function () {
      setupHighlightEnv(this, '😐 Make&nbsp;The \n 🌍 Go \n🔄')
      const range = createRange()
      const node = this.div
      range.setStart(node.firstChild, 0)
      range.setEnd(node.firstChild, 2)
      const {start, end} = toCharacterRange(range, this.div)

      this.highlightRange('😐', 'myId', start, end)
      const expectedRanges = {
        myId: {
          text: '😐',
          start: 0,
          end: 2
        }
      }

      const expectedHtml = '<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">😐</span> Make&nbsp;The \n 🌍 Go \n🔄'

      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
      expect(this.getHtml()).to.equal(expectedHtml)
    })

    it('treats non-breakable spaces consistently', function () {
      setupHighlightEnv(this, '😐 Make&nbsp;The \n 🌍 Go \n🔄')
      this.highlightRange(' Make T', 'myId', 2, 9)
      const expectedRanges = {
        myId: {
          text: ' Make T',
          start: 2,
          end: 9
        }
      }
      const expectedHtml = `😐<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId"> Make&nbsp;T</span>he \n 🌍 Go \n🔄`

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
    })

    it('treats \\n spaces consistently', function () {
      setupHighlightEnv(this, '&nbsp;The \n 🌍 Go \n🔄')
      this.highlightRange('The \n 🌍', 'myId', 1, 9)
      const expectedRanges = {
        myId: {
          text: 'The \n 🌍',
          start: 1,
          end: 9
        }
      }

      const expectedHtml = `&nbsp;<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">The \n 🌍</span> Go \n🔄`

      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
    })

    it('extracts a readable text', function () {
      setupHighlightEnv(this, '😐 Make&nbsp;The \r\n 🌍 Go \n🔄')
      this.highlightRange('😐 Make The 🌍 Go 🔄', 'myId', 0, 23)
      const expectedRanges = {
        myId: {
          text: '😐 Make The \n 🌍 Go \n🔄',
          start: 0,
          end: 23
        }
      }
      const expectedHtml = '<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">😐 Make&nbsp;The \n 🌍 Go \n🔄</span>'
      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange()).to.deep.equal(expectedRanges)
    })

    it('notify change on add highlight when dispatcher is given', function () {
      setupHighlightEnv(this, '😐 Make&nbsp;The \r\n 🌍 Go \n🔄')
      let called = 0
      const dispatcher = {notify: () => called++}
      this.highlightRange('😐 Make The 🌍 Go 🔄', 'myId', 0, 20, dispatcher)

      expect(called).to.equal(1)
    })

    it('notify change on remove highlight when dispatcher is given', function () {
      setupHighlightEnv(this, '😐 Make&nbsp;The \r\n 🌍 Go \n🔄')
      let called = 0
      const dispatcher = {notify: () => called++}
      this.highlightRange('😐 Make The 🌍 Go 🔄', 'myId', 0, 20)
      this.removeHighlight('first', dispatcher)

      expect(called).to.equal(1)
    })
  })

  describe('highlightRange() - multiple white spaces', function () {

    beforeEach(function () {
      this.editable = new Editable()
      setupHighlightEnv(this, 'People Make The&nbsp;<br>&nbsp;World Go Round')
    })

    it('can handle all cases combined and creates consistent output', function () {
      this.highlightRange('ople Mak', 'firstId', 2, 10)
      this.highlightRange('l', 'secondId', 4, 5)
      this.highlightRange('ld Go Round', 'thirdId', 20, 31)
      this.highlightRange(' ', 'fourthId', 22, 23)
      this.highlightRange(' ', 'fifthId', 22, 23)

      const expectedRanges = {
        firstId: {
          start: 2,
          end: 10,
          text: 'ople Mak'
        },
        secondId: {
          start: 4,
          end: 5,
          text: 'l'
        },
        thirdId: {
          start: 20,
          end: 31,
          text: 'ld Go Round'
        },
        fourthId: {
          start: 22,
          end: 23,
          text: ' '
        },
        fifthId: {
          start: 22,
          end: 23,
          text: ' '
        }
      }
      const expectedHtml = this.formatHtml(`Pe
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="firstId">op
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="secondId">l</span>
e Mak</span>
e The&nbsp;<br>&nbsp;Wor<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="thirdId">ld
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fourthId">
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="fifthId"> </span></span>
Go Round</span>`)

      const extractedRanges = this.extractWithoutNativeRange()
      const content = this.editable.getContent(this.div)
      expect(content).to.equal(this.text)
      expect(extractedRanges).to.deep.equal(expectedRanges)
      expect(this.getHtml()).to.deep.equal(expectedHtml)
    })

    it('returns only highlightRanges with specific type', function () {
      const startIndex = this.highlightRange('ple ', 'myId', 3, 7)
      this.highlightRange('orld', 'spellcheckId', 18, 22, undefined, 'spellcheck')
      const expectedRanges = {
        myId: {
          text: 'ple ',
          start: 3,
          end: 7
        }
      }
      const expectedHtml = this.formatHtml(`Peo
<span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">ple </span>
Make The&nbsp;<br>&nbsp;W<span class="highlight-spellcheck" data-editable="ui-unwrap" data-highlight="spellcheck" data-word-id="spellcheckId">orld</span> Go Round`)
      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange('comment')).to.deep.equal(expectedRanges)
      expect(startIndex).to.equal(3)
    })
  })

  describe('highlightRange() - matches based on both start index and match', function () {
    beforeEach(function () {
      setupHighlightEnv(this, 'People make the world go round and round and round the world')
    })

    it('highlights based on both match and start index', function () {
      this.highlightRange('round', 'myId', 35, 40)
      const expectedRanges = {
        myId: {
          text: 'round',
          start: 35,
          end: 40
        }
      }
      const expectedHtml = this.formatHtml(`People make the world go round and <span class="highlight-comment" data-editable="ui-unwrap" data-highlight="comment" data-word-id="myId">round</span> and round the world`)
      expect(this.getHtml()).to.equal(expectedHtml)
      expect(this.extractWithoutNativeRange('comment')).to.deep.equal(expectedRanges)
    })
  })
})

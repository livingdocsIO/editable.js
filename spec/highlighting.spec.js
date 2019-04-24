import $ from 'jquery'
import rangy from 'rangy'
import Editable from '../src/core'
import Highlighting from '../src/highlighting'
import highlightSupport from '../src/highlight-support'
import WordHighlighter from '../src/plugins/highlighting/text-highlighting'


function setupHighlightEnv (context, text) {
  context.text = text
  context.$div = $('<div>' + context.text + '</div>').appendTo(document.body)
  context.editable = new Editable()
  context.editable.add(context.$div)
  context.highlightRange = (highlightId, start, end) => {
    return highlightSupport.highlightRange(
      context.$div[0],
      highlightId,
      start, end
    )
  }

  context.extract = () => {
    return context.editable.getHighlightPositions({editableHost: context.$div[0]})
  }

  context.getHtml = () => {
    return context.$div[0].innerHTML
  }

  context.formatHtml = string => {
    return $('<div>' + string.replace(/\n/gm, '') + '</div>')[0].innerHTML
  }
}

function teardownHighlightEnv (context) {
  context.$div.remove()
  context.editable.off()
  context.editable = undefined
  context.highlightRange = undefined
  context.assertUniqueSpan = undefined
}

describe('Highlighting', function () {
  beforeEach(() => {
    this.editable = new Editable()
  })

  describe('new Highlighting()', () => {
    it('creates an instance with a reference to editable', () => {
      const highlighting = new Highlighting(this.editable, {})
      expect(highlighting.editable).toEqual(this.editable)
    })
  })

  describe('WordHighlighter', () => {
    beforeEach(() => {
      const markerNode = $('<span class="highlight"></span>')[0]
      this.highlighter = new WordHighlighter(markerNode)
    })

    it('finds the word "a"', () => {
      const text = 'a'
      const matches = this.highlighter.findMatches(text, ['a'])

      const firstMatch = matches[0]
      expect(firstMatch.match).toEqual('a')
      expect(firstMatch.startIndex).toEqual(0)
      expect(firstMatch.endIndex).toEqual(1)
    })

    it('does not find the word "b"', () => {
      const text = 'a'
      const matches = this.highlighter.findMatches(text, ['b'])
      expect(matches.length).toEqual(0)
    })

    it('finds the word "juice"', () => {
      const text = 'Some juice.'
      const matches = this.highlighter.findMatches(text, ['juice'])
      const firstMatch = matches[0]
      expect(firstMatch.match).toEqual('juice')
      expect(firstMatch.startIndex).toEqual(5)
      expect(firstMatch.endIndex).toEqual(10)
    })
  })

  describe('highlightSupport', () => {
    beforeEach(() => {
      setupHighlightEnv(this, 'People Make The <br> World Go Round')
    })

    afterEach(() => {
      teardownHighlightEnv(this)
    })

    it('can handle a single highlight', () => {
      const startIndex = this.highlightRange('myId', 3, 7)
      const expectedRanges = {
        myId: {
          text: 'ple ',
          start: 3,
          end: 7
        }
      }
      const expectedHtml = this.formatHtml(`Peo
<span class="highlight-comment" data-word-id="myId" data-editable="ui-unwrap" data-highlight="comment">ple </span>
Make The <br> World Go Round`)

      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)
      expect(startIndex).toEqual(3)
    })

    it('can handle adjaccent highlights', () => {
      this.highlightRange('first', 0, 1)
      this.highlightRange('second', 1, 2)
      this.highlightRange('third', 2, 3)
      this.highlightRange('fourth', 3, 4)

      const expectedRanges = {
        first: {
          text: 'P',
          start: 0,
          end: 1
        },
        second: {
          text: 'e',
          start: 1,
          end: 2
        },
        third: {
          text: 'o',
          start: 2,
          end: 3
        },
        fourth: {
          text: 'p',
          start: 3,
          end: 4
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">P</span>
<span class="highlight-comment" data-word-id="second" data-editable="ui-unwrap" data-highlight="comment">e</span>
<span class="highlight-comment" data-word-id="third" data-editable="ui-unwrap" data-highlight="comment">o</span>
<span class="highlight-comment" data-word-id="fourth" data-editable="ui-unwrap" data-highlight="comment">p</span>
le Make The <br> World Go Round`)

      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)

    })

    it('can handle nested highlights', () => {
      this.highlightRange('first', 0, 1)
      this.highlightRange('second', 1, 2)
      this.highlightRange('third', 2, 6)
      this.highlightRange('fourth', 0, 6)
      const expectedRanges = {
        first: {
          text: 'P',
          start: 0,
          end: 1
        },
        second: {
          text: 'e',
          start: 1,
          end: 2
        },
        third: {
          text: 'ople',
          start: 2,
          end: 6
        },
        fourth: {
          text: 'People',
          start: 0,
          end: 6
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-word-id="fourth" data-editable="ui-unwrap" data-highlight="comment">
<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">P</span>
<span class="highlight-comment" data-word-id="second" data-editable="ui-unwrap" data-highlight="comment">e</span>
<span class="highlight-comment" data-word-id="third" data-editable="ui-unwrap" data-highlight="comment">ople</span>
</span>
 Make The <br> World Go Round`)
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)
    })

    it('can handle intersecting highlights', () => {
      this.highlightRange('first', 0, 3)
      this.highlightRange('second', 3, 7)
      this.highlightRange('third', 4, 6)
      const expectedRanges = {
        first: {
          text: 'Peo',
          start: 0,
          end: 3
        },
        second: {
          text: 'ple ',
          start: 3,
          end: 7
        },
        third: {
          text: 'le',
          start: 4,
          end: 6
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">Peo</span>
<span class="highlight-comment" data-word-id="second" data-editable="ui-unwrap" data-highlight="comment">p
<span class="highlight-comment" data-word-id="third" data-editable="ui-unwrap" data-highlight="comment">le</span>
 </span>
Make The <br> World Go Round`)
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)
    })

    it('can handle highlights containing break tags', () => {
      this.highlightRange('first', 11, 22)
      const expectedRanges = {
        first: {
          text: ' The \nWorld',
          start: 11,
          end: 22
        }
      }
      const expectedHtml = this.formatHtml(`People Make
<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment"> The <br> World</span>
 Go Round`)

      expect(this.extract()).toEqual(expectedRanges)
      expect(this.getHtml()).toEqual(expectedHtml)

    })

    it('can handle identical ranges', () => {
      this.highlightRange('first', 11, 22)
      this.highlightRange('second', 11, 22)
      const expectedRanges = {
        first: {
          text: ' The \nWorld',
          start: 11,
          end: 22
        },
        second: {
          text: ' The \nWorld',
          start: 11,
          end: 22
        }
      }
      const expectedHtml = this.formatHtml(`People Make
<span class="highlight-comment" data-word-id="second" data-editable="ui-unwrap" data-highlight="comment">
<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment"> The <br> World</span>
</span>
 Go Round`)


      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)

    })

    it('will update any existing range found under `highlightId` aka upsert', () => {
      this.highlightRange('first', 11, 22)
      this.highlightRange('first', 8, 9)
      const expectedRanges = {
        first: {
          text: 'a',
          start: 8,
          end: 9
        }
      }
      const expectedHtml = this.formatHtml(`People M
<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">a</span>
ke The <br> World Go Round`)

      console.log(expectedHtml)

      expect(this.extract()).toEqual(expectedRanges)
      expect(this.getHtml()).toEqual(expectedHtml)
    })

    it('can handle all cases combined and creates consistent output', () => {
      this.highlightRange('first', 4, 8)
      this.highlightRange('second', 2, 10)
      this.highlightRange('third', 4, 5)
      this.highlightRange('first', 0, 24)
      this.highlightRange('fourth', 20, 31)
      this.highlightRange('fifth', 15, 16)
      this.highlightRange('sixth', 15, 16)

      const expectedRanges = {
        first: {
          text: 'People Make The \nWorld G',
          start: 0,
          end: 24
        },
        second: {
          text: 'ople Mak',
          start: 2,
          end: 10
        },
        third: {
          text: 'l',
          start: 4,
          end: 5
        },
        fourth: {
          text: 'ld Go Round',
          start: 20,
          end: 31
        },
        fifth: {
          text: ' ',
          start: 15,
          end: 16
        },
        sixth: {
          text: ' ',
          start: 15,
          end: 16
        }
      }
      const expectedHtml = this.formatHtml(`<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">Pe
<span class="highlight-comment" data-word-id="second" data-editable="ui-unwrap" data-highlight="comment">op
<span class="highlight-comment" data-word-id="third" data-editable="ui-unwrap" data-highlight="comment">l</span>
e Mak</span>e The<span class="highlight-comment" data-word-id="sixth" data-editable="ui-unwrap" data-highlight="comment">
<span class="highlight-comment" data-word-id="fifth" data-editable="ui-unwrap" data-highlight="comment"> </span>
</span>
<br> Wor</span>
<span class="highlight-comment" data-word-id="fourth" data-editable="ui-unwrap" data-highlight="comment">
<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">ld G</span>
o Round</span>`)

      const extractedHtml = this.getHtml()
      const extractedRanges = this.extract()

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedHtml).toEqual(expectedHtml)


      const content = this.editable.getContent(this.$div[0])
      this.$div.html(content)
      expect(content).toEqual(this.text)
      const ids = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']
      ids.forEach(highlightId => {
        this.highlightRange(
          highlightId,
          extractedRanges[highlightId].start,
          extractedRanges[highlightId].end
        )
      })

      expect(this.extract()).toEqual(expectedRanges)
      expect(this.getHtml()).toEqual(expectedHtml)
    })

    it('skips and warns if an invalid range object was passed', () => {
      this.editable.highlight({
        editableHost: this.$div[0],
        highlightId: 'myId',
        textRange: { foo: 3, bar: 7 }
      })
      const highlightSpan = this.$div.find('[data-word-id="myId"]')
      expect(highlightSpan.length).toEqual(0)
    })

    it('skips if the range exceeds the content length', () => {
      const result = this.editable.highlight({
        editableHost: this.$div[0],
        highlightId: 'myId',
        textRange: { foo: 3, bar: 32 }
      })
      const highlightSpan = this.$div.find('[data-word-id="myId"]')
      expect(highlightSpan.length).toEqual(0)
      expect(result).toEqual(-1)
    })

    it('skips and warns if the range object represents a cursor', () => {
      this.editable.highlight({
        editableHost: this.$div[0],
        highlightId: 'myId',
        textRange: { start: 3, end: 3 }
      })

      const highlightSpan = this.$div.find('[data-word-id="myId"]')
      expect(highlightSpan.length).toEqual(0)
    })
  })

  describe('highlight support with special characters', () => {
    it('treats special characters as expected', () => {
      // actual / expected length / expected text
      const characters = [
        ['😐', 2, '😐'],
        ['&nbsp;', 1, ' '], // eslint-disable-line
        [' ', 1, ' '], // eslint-disable-line
        [' ', 1, ' '], // eslint-disable-line,
        [' ', 1, ' '], // eslint-disable-line,
        ['\r', 0],
        ['\n', 0],
        ['<br>', 0]
      ]

      characters.forEach(([char, expectedLength, expectedText]) => {
        setupHighlightEnv(this, char)
        const range = rangy.createRange()
        const node = this.$div[0]
        range.selectNode(node.firstChild)
        const { start, end } = range.toCharacterRange(this.$div[0])
        this.highlightRange('char', start, end)
        if (expectedLength === 0) {
          expect(this.extract()).toEqual(undefined)
        } else {
          expect(this.extract()).toEqual({
            char: {
              start: 0,
              end: expectedLength,
              text: expectedText
            }
          })
        }
        teardownHighlightEnv(this)
      })
    })
  })

  describe('highlightSupport with special characters', () => {
    beforeEach(() => {
      setupHighlightEnv(this, '😐 Make&nbsp;The \r\n 🌍 Go \n🔄')
    })

    afterEach(() => {
      teardownHighlightEnv(this)
    })

    it('maps selection offsets to ranges containing multibyte symbols consistently', () => {
      const range = rangy.createRange()
      const node = this.$div[0]
      range.setStart(node.firstChild, 0)
      range.setEnd(node.firstChild, 2)
      const {start, end} = range.toCharacterRange(this.$div[0])

      this.highlightRange('first', start, end)
      const expectedRanges = {
        first: {
          text: '😐',
          start: 0,
          end: 2
        }
      }

      const expectedHtml = '<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">😐</span> Make&nbsp;The \n 🌍 Go \n🔄'

      expect(this.extract()).toEqual(expectedRanges)
      expect(this.getHtml()).toEqual(expectedHtml)
    })

    it('treats non-breakable spaces consistently', () => {
      this.highlightRange('first', 2, 9)
      const expectedRanges = {
        first: {
          text: ' Make T',
          start: 2,
          end: 9
        }
      }
      const expectedHtml = '😐<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment"> Make&nbsp;T</span>he \n 🌍 Go \n🔄'
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)


    })

    it('treats \\n\\r spaces consistently', () => {
      this.highlightRange('first', 8, 15)
      const expectedRanges = {
        first: {
          text: 'The 🌍 ',
          start: 8,
          end: 15
        }
      }

      const expectedHtml = '😐 Make&nbsp;<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">The \n 🌍 </span>Go \n🔄'
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)

    })

    it('treats \\n spaces consistently', () => {
      this.highlightRange('first', 15, 20)
      const expectedRanges = {
        first: {
          text: 'Go 🔄',
          start: 15,
          end: 20
        }
      }
      const expectedHtml = '😐 Make&nbsp;The \n 🌍 <span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">Go \n🔄</span>'
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)
    })

    it('extracts a readable text', () => {
      this.highlightRange('first', 0, 20)
      const expectedRanges = {
        first: {
          text: '😐 Make The 🌍 Go 🔄',
          start: 0,
          end: 20
        }
      }
      const expectedHtml = '<span class="highlight-comment" data-word-id="first" data-editable="ui-unwrap" data-highlight="comment">😐 Make&nbsp;The \n 🌍 Go \n🔄</span>'
      expect(this.getHtml()).toEqual(expectedHtml)
      expect(this.extract()).toEqual(expectedRanges)
    })
  })
})

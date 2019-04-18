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

  context.extractTexts = (ranges) => {
    return Object.keys(ranges).reduce(
      (result, highlightId) => {
        const range = rangy.createRange()
        range.selectCharacters(
          context.$div[0],
          ranges[highlightId].start,
          ranges[highlightId].end
        )
        result[highlightId] = range.text()
        return result
      },
      {}
    )
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
          start: 3,
          end: 7
        }
      }
      const expectedTexts = {myId: 'ple '}

      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
      expect(startIndex).toEqual(3)
    })

    it('can handle adjaccent highlights', () => {
      this.highlightRange('first', 0, 1)
      this.highlightRange('second', 1, 2)
      this.highlightRange('third', 2, 3)
      this.highlightRange('fourth', 3, 4)

      const expectedRanges = {
        first: {
          start: 0,
          end: 1
        },
        second: {
          start: 1,
          end: 2
        },
        third: {
          start: 2,
          end: 3
        },
        fourth: {
          start: 3,
          end: 4
        }
      }
      const expectedTexts = {
        first: 'P',
        second: 'e',
        third: 'o',
        fourth: 'p'
      }

      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
    })

    it('can handle nested highlights', () => {
      this.highlightRange('first', 0, 1)
      this.highlightRange('second', 1, 2)
      this.highlightRange('third', 2, 6)
      this.highlightRange('fourth', 0, 6)
      const expectedRanges = {
        first: {
          start: 0,
          end: 1
        },
        second: {
          start: 1,
          end: 2
        },
        third: {
          start: 2,
          end: 6
        },
        fourth: {
          start: 0,
          end: 6
        }
      }


      const expectedTexts = {
        first: 'P',
        second: 'e',
        third: 'ople',
        fourth: 'People'
      }

      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
    })

    it('can handle intersecting highlights', () => {
      this.highlightRange('first', 0, 3)
      this.highlightRange('second', 3, 7)
      this.highlightRange('third', 4, 6)
      const expectedRanges = {
        first: {
          start: 0,
          end: 3
        },
        second: {
          start: 3,
          end: 7
        },
        third: {
          start: 4,
          end: 6
        }
      }

      const expectedTexts = {
        first: 'Peo',
        second: 'ple ',
        third: 'le'
      }
      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
    })

    it('can handle highlights containing newlines', () => {
      this.highlightRange('first', 11, 22)
      const expectedRanges = {
        first: {
          start: 11,
          end: 22
        }
      }
      const expectedTexts = {
        first: ' The \nWorld'
      }
      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
    })

    it('can handle identical ranges', () => {
      this.highlightRange('first', 11, 22)
      this.highlightRange('second', 11, 22)
      const expectedRanges = {
        first: {
          start: 11,
          end: 22
        },
        second: {
          start: 11,
          end: 22
        }
      }
      const expectedTexts = {
        first: ' The \nWorld',
        second: ' The \nWorld'
      }
      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
    })

    it('will update any existing range found under `highlightId` aka upsert', () => {
      this.highlightRange('first', 11, 22)
      this.highlightRange('first', 8, 9)
      const expectedRanges = {
        first: {
          start: 8,
          end: 9
        }
      }
      const expectedTexts = {
        first: 'a'
      }

      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)
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
          start: 0,
          end: 24
        },
        second: {
          start: 2,
          end: 10
        },
        third: {
          start: 4,
          end: 5
        },
        fourth: {
          start: 20,
          end: 31
        },
        fifth: {
          start: 15,
          end: 16
        },
        sixth: {
          start: 15,
          end: 16
        }
      }
      const expectedTexts = {
        first: 'People Make The \nWorld G',
        second: 'ople Mak',
        third: 'l',
        fourth: 'ld Go Round',
        sixth: ' ',
        fifth: ' '
      }
      const extractedRanges = this.extract()
      const extractedTexts = this.extractTexts(extractedRanges)

      expect(extractedRanges).toEqual(expectedRanges)
      expect(extractedTexts).toEqual(expectedTexts)

      const content = this.editable.getContent(this.$div[0])
      this.$div.html(content)
      expect(content).toEqual(this.text)

      for (let highlightId in extractedRanges) {
        this.highlightRange(
          highlightId,
          extractedRanges[highlightId].start,
          extractedRanges[highlightId].end
        )
      }

      expect(this.extract()).toEqual(expectedRanges)
    })

    it('skips and warns if an invalid range object was passed', () => {
      this.editable.highlight({
        editableHost: this.$div[0],
        text: 'ple ',
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
        text: 'ple ',
        highlightId: 'myId',
        textRange: { start: 3, end: 3 }
      })

      const highlightSpan = this.$div.find('[data-word-id="myId"]')
      expect(highlightSpan.length).toEqual(0)
    })
  })
})

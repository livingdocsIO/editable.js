import {expect} from 'chai'
import {isDoubleQuote, isSingleQuote, isWhitespace, isSeparatorOrWhitespace, isApostrophe, replaceQuote} from '../src/smartQuotes'
import {createElement} from '../src/util/dom.js'
import {deleteCssHighlight, setCssHighlight} from '../src/plugins/highlighting/css-highlights.js'

const allSingleQuotes = ['‘', '’', '‹', '›', '‚', '‘', '›', '‹', `'`, `‘`]
const allDoubleQuotes = ['«', '»', '»', '«', '"', '"', '“', '”', '”', '”', '“', '“', '„', '“']
const charValues = ['', '*', '<', 'b', 'ab']
const nonStringValues = [undefined, null, true, 123, NaN]
const whitespaceChars = [' ', '\t', '\n', '\r', '\v', '\f']
const separatorValues = ['>', '-', '–—']

describe('Smart Quotes Helper Functions:', () => {
  describe('isDoubleQuote', () => {
    it('Should return false for non double quote values', () => {
      [...charValues, ...separatorValues, ...nonStringValues, ...allSingleQuotes].forEach(value => {
        expect(isDoubleQuote(value)).to.equal(false, `Failed for value: ${value}`)
      })
    })

    it('Should return true for double quote values', () => {
      allDoubleQuotes.forEach(value => {
        expect(isDoubleQuote(value)).to.equal(true, `Failed for value: ${value}`)
      })
    })
  })

  describe('isSingleQuote', () => {
    it('Should return false for non single quote values', () => {
      [...charValues, ...separatorValues, ...nonStringValues, ...allDoubleQuotes].forEach(value => {
        expect(isSingleQuote(value)).to.equal(false, `Failed for value: ${value}`)
      })
    })

    it('Should return true for single quote values', () => {
      allSingleQuotes.forEach(value => {
        expect(isSingleQuote(value)).to.equal(true, `Failed for value: ${value}`)
      })
    })
  })

  describe('isWhiteSpace', () => {
    it('should return false for non whitespace characters', () => {
      [...charValues, ...nonStringValues].forEach(value => {
        expect(isWhitespace(value)).to.equal(false, `Failed for: ${value}`)
      })
    })

    it('should return true for  whitespace characters', () => {
      [...whitespaceChars ].forEach(value => {
        expect(isWhitespace(value)).to.equal(true, `Failed for: ${value}`)
      })
    })
  })

  describe('isSeparatorOrWhitespace', () => {
    it('should return false for non whitespace/ separator characters', () => {
      [...charValues, ...nonStringValues ].forEach(value => {
        expect(isSeparatorOrWhitespace(value)).to.equal(false, `Failed for: ${value}`)
      })
    })

    it('should return true for  whitespace/ separator characters', () => {
      [...whitespaceChars, ...separatorValues].forEach(value => {
        expect(isSeparatorOrWhitespace(value)).to.equal(true, `Failed for: ${value}`)
      })
    })
  })

  describe('isApostrophe', () => {
    it('should return false for non apostrophe characters', () => {
      [...charValues, ...nonStringValues, ...allDoubleQuotes, `'f`, '’j', '‘', '‹', '›', '‚', '‘', '›', '‹', `‘`].forEach(value => {
        expect(isApostrophe(value)).to.equal(false, `Failed for: ${value}`)
      })
    })

    it('should return true for apostrophe characters', () => {
      [`'`, '’'].forEach(value => {
        expect(isApostrophe(value)).to.equal(true, `Failed for: ${value}`)
      })
    })
  })
})

const createRangeWithText = (text) => {
  const textNode = document.createTextNode(text)
  const range = document.createRange()
  range.selectNodeContents(textNode)
  return range
}

describe('replaceQuote(): ', () => {
  const testString = '123 "you'
  const index = testString.indexOf('"')

  it('should replace quote at given index', () => {
    const range = createRangeWithText(testString)
    expect(replaceQuote(range, index, '`')).to.equal(true)
    expect(range.startContainer.textContent).to.equal('123 `you')
  })

  it('should return false if range is invalid', () => {
    expect(replaceQuote(undefined, index, '`')).to.equal(false)
  })

  it('should return false if range is empty', () => {
    const range = createRangeWithText('')
    expect(replaceQuote(range, 0, '`')).to.equal(false)
    expect(range.startContainer.textContent).to.equal('')
  })

  it('should insert quote at the end, if index is out of bounds', () => {
    const range = createRangeWithText(testString)
    expect(replaceQuote(range, 40, '`')).to.equal(true)
    expect(range.startContainer.textContent).to.equal(`${testString}${'`'}`)
  })

  describe('with a css highlight', () => {
    const highlightName = 'spellcheck'
    let host

    beforeEach(() => {
      host = createElement(`<div>${testString}</div>`)
      document.body.appendChild(host)
    })

    afterEach(() => {
      deleteCssHighlight({name: highlightName})
      host.remove()
    })

    const highlight = (start, end) => {
      setCssHighlight({name: highlightName, ranges: [{editableHost: host, start, end}]})
    }

    const replaceQuoteInHost = () => {
      const range = document.createRange()
      range.selectNodeContents(host.firstChild)
      replaceQuote(range, index, '`')
    }

    const highlightedTexts = () => Array.from(CSS.highlights.get(highlightName), (r) => r.toString())

    it('should keep a highlight around the quote', () => {
      highlight(3, 6)

      replaceQuoteInHost()

      expect(host.textContent).to.equal('123 `you')
      expect(highlightedTexts()).to.deep.equal([' `y'])
    })

    it('should keep a highlight away from the quote', () => {
      highlight(0, 3)

      replaceQuoteInHost()

      expect(host.textContent).to.equal('123 `you')
      expect(highlightedTexts()).to.deep.equal(['123'])
    })

    it('should keep a highlight starting right after the quote', () => {
      highlight(5, 8)

      replaceQuoteInHost()

      expect(host.textContent).to.equal('123 `you')
      expect(highlightedTexts()).to.deep.equal(['you'])
    })

    it('should keep a highlight ending right before the quote', () => {
      highlight(0, 4)

      replaceQuoteInHost()

      expect(host.textContent).to.equal('123 `you')
      expect(highlightedTexts()).to.deep.equal(['123 '])
    })
  })
})

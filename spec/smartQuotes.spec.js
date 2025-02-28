import {expect} from 'chai'
import {isDoubleQuote, isSingleQuote, isWhitespace, isSeparatorOrWhitespace, isApostrophe, replaceQuote} from '../src/smartQuotes'

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
    const replacedTextNode = replaceQuote(range, index, '`')
    expect(replacedTextNode.textContent).to.equal('123 `you')
  })

  it('should return null if range is invalid', () => {
    const invalidNodeValue = replaceQuote(undefined, index, '`')
    expect(invalidNodeValue).to.equal(null)
  })

  it('should return null if range is empty', () => {
    const range = createRangeWithText('')
    const replacedTextNode = replaceQuote(range, 0, '`')
    expect(replacedTextNode).to.equal(null)
  })

  it('should insert quote at the end, if index is out of bounce', () => {
    const range = createRangeWithText(testString)
    const replacedTextNode = replaceQuote(range, 40, '`')
    expect(replacedTextNode.textContent).to.equal(`${testString}${'`'}`)
  })
})

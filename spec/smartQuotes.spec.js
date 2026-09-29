import {expect} from 'chai'
import {isDoubleQuote, isSingleQuote, isWhitespace, isSeparatorOrWhitespace, isApostrophe, shouldApplySmartQuotes, applySmartQuotes} from '../src/smartQuotes'
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

const germanConfig = {quotes: ['„', '“'], singleQuotes: ['‚', '‘'], apostrophe: '’'}
const englishConfig = {quotes: ['“', '”'], singleQuotes: ['‘', '’'], apostrophe: '’'}

describe('shouldApplySmartQuotes():', () => {
  const config = {smartQuotes: true, ...germanConfig}
  let target

  beforeEach(() => {
    target = createElement('<div contenteditable="true"></div>')
    document.body.appendChild(target)
  })

  afterEach(() => {
    target.remove()
  })

  it('applies smart quotes with all quotes configured', () => {
    expect(shouldApplySmartQuotes(config, target)).to.equal(true)
  })

  it('does not apply smart quotes without a double quote config', () => {
    expect(shouldApplySmartQuotes({...config, quotes: undefined}, target)).to.equal(false)
    expect(shouldApplySmartQuotes({...config, quotes: ['„']}, target)).to.equal(false)
  })

  it('does not apply smart quotes without a single quote config', () => {
    expect(shouldApplySmartQuotes({...config, singleQuotes: undefined}, target)).to.equal(false)
    expect(shouldApplySmartQuotes({...config, singleQuotes: ['‚']}, target)).to.equal(false)
  })

  it('applies smart quotes without an apostrophe config', () => {
    expect(shouldApplySmartQuotes({...config, apostrophe: undefined}, target)).to.equal(true)
  })

  it('does not apply smart quotes when they are disabled', () => {
    expect(shouldApplySmartQuotes({...config, smartQuotes: false}, target)).to.equal(false)
  })

  it('does not apply smart quotes outside of an editable', () => {
    target.removeAttribute('contenteditable')
    expect(shouldApplySmartQuotes(config, target)).to.equal(false)
  })
})

describe('applySmartQuotes():', () => {
  let host

  afterEach(() => {
    host.remove()
  })

  // Renders `text` and returns a range with the cursor at `cursor`
  const render = (text, cursor) => {
    host = createElement(`<div contenteditable="true">${text}</div>`)
    document.body.appendChild(host)
    const range = document.createRange()
    range.setStart(host.firstChild, cursor)
    return range
  }

  // Simulates the input event for `char` typed between `before` and `after`
  // and returns the resulting text
  const typeQuote = (before, char, after = '', config = germanConfig) => {
    const cursor = before.length + 1
    applySmartQuotes(render(`${before}${char}${after}`, cursor), config, char, host, cursor)
    return host.textContent
  }

  describe('double quotes', () => {
    it('writes an opening double quote at a word start', () => {
      expect(typeQuote('Er sagte: ', '"')).to.equal('Er sagte: „')
    })

    it('writes a closing double quote inside a word', () => {
      expect(typeQuote('„Tor', '"')).to.equal('„Tor“')
    })

    it('keeps a typed double quote from the config', () => {
      expect(typeQuote('Tor', '„')).to.equal('Tor„')
    })
  })

  describe('single quotes', () => {
    it('writes an opening single quote at block start', () => {
      expect(typeQuote('', `'`)).to.equal('‚')
    })

    it('writes an opening single quote after whitespace', () => {
      expect(typeQuote('Er sagte: ', `'`)).to.equal('Er sagte: ‚')
    })

    it('writes an opening single quote after a separator', () => {
      expect(typeQuote('Tor –', `'`)).to.equal('Tor –‚')
    })

    it('writes an opening single quote directly after a double quote', () => {
      expect(typeQuote('„', `'`)).to.equal('„‚')
    })

    it('writes a closing single quote inside a word with an open single quote', () => {
      expect(typeQuote('„Er sagte: ‚Tor!', `'`)).to.equal('„Er sagte: ‚Tor!‘')
      expect(typeQuote('‚Tor', `'`, ' sagte er')).to.equal('‚Tor‘ sagte er')
    })

    it('writes a closing single quote that equals the apostrophe', () => {
      expect(typeQuote('‘Hi', `'`, '', englishConfig)).to.equal('‘Hi’')
    })

    it('keeps a typed single quote from the config', () => {
      expect(typeQuote('Tor', '‚')).to.equal('Tor‚')
    })
  })

  describe('apostrophes', () => {
    it('writes the apostrophe inside a word without an open single quote', () => {
      expect(typeQuote('Hans', `'`)).to.equal('Hans’')
      expect(typeQuote('geht', `'`, 's')).to.equal('geht’s')
      expect(typeQuote('O', `'`, 'Brien')).to.equal('O’Brien')
    })

    it('writes an apostrophe that equals the closing single quote', () => {
      expect(typeQuote('Hans', `'`, '', englishConfig)).to.equal('Hans’')
    })

    it('does not treat an earlier apostrophe as an open single quote', () => {
      expect(typeQuote('Rock’n', `'`)).to.equal('Rock’n’')
    })

    it('writes the apostrophe before a character with an open single quote', () => {
      expect(typeQuote('‚er geht', `'`, 's')).to.equal('‚er geht’s')
    })

    it('does not treat a closed single quote as an open single quote', () => {
      expect(typeQuote('‚Tor‘ sagte Hans', `'`)).to.equal('‚Tor‘ sagte Hans’')
    })

    it('keeps a typed apostrophe', () => {
      expect(typeQuote('‚er geht', '’')).to.equal('‚er geht’')
    })

    it('leaves the quote alone without an apostrophe config', () => {
      expect(typeQuote('Hans', `'`, '', {...germanConfig, apostrophe: undefined})).to.equal(`Hans'`)
      expect(typeQuote('Hans', `'`, '', {...germanConfig, apostrophe: ''})).to.equal(`Hans'`)
      expect(typeQuote('‚er geht', `'`, 's', {...germanConfig, apostrophe: undefined})).to.equal(`‚er geht's`)
    })
  })

  describe('cursor and highlights', () => {
    it('keeps the cursor after the replaced quote', () => {
      typeQuote('geht', `'`, 's')
      const selection = window.getSelection()
      expect(selection.anchorNode).to.equal(host.firstChild)
      expect(selection.anchorOffset).to.equal(5)
    })

    it('moves the cursor to the latest input position', () => {
      applySmartQuotes(render(`geht's`, 5), germanConfig, `'`, host, 6)
      expect(host.textContent).to.equal('geht’s')
      expect(window.getSelection().anchorOffset).to.equal(6)
    })

    describe('with a css highlight', () => {
      afterEach(() => {
        deleteCssHighlight({name: 'spellcheck'})
      })

      // Types `"` in `123 "you` with a highlight from `start` to `end`
      // and returns the highlighted texts
      const typeWithHighlight = (start, end) => {
        const range = render('123 "you', 5)
        setCssHighlight({name: 'spellcheck', ranges: [{editableHost: host, start, end}]})
        applySmartQuotes(range, germanConfig, '"', host, 5)
        expect(host.textContent).to.equal('123 „you')
        return Array.from(CSS.highlights.get('spellcheck'), (r) => r.toString())
      }

      it('keeps a highlight around the quote', () => {
        expect(typeWithHighlight(3, 6)).to.deep.equal([' „y'])
      })

      it('keeps a highlight away from the quote', () => {
        expect(typeWithHighlight(0, 3)).to.deep.equal(['123'])
      })

      it('keeps a highlight starting right after the quote', () => {
        expect(typeWithHighlight(5, 8)).to.deep.equal(['you'])
      })

      it('keeps a highlight ending right before the quote', () => {
        expect(typeWithHighlight(0, 4)).to.deep.equal(['123 '])
      })
    })
  })

  describe('unexpected text', () => {
    it('leaves the text alone when the typed character is not a quote', () => {
      expect(typeQuote('Tor', 'a')).to.equal('Tora')
    })

    it('leaves the text alone when the cursor is not in a text node', () => {
      const range = render(`geht'`, 0)
      range.setStart(host, 1)
      applySmartQuotes(range, germanConfig, `'`, host, 1)
      expect(host.textContent).to.equal(`geht'`)
    })
  })
})

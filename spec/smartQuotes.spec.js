import {expect} from 'chai'
import {shouldApplySmartQuotes, applySmartQuotes} from '../src/smartQuotes'
import {createElement} from '../src/util/dom.js'
import {textNodesUnder} from '../src/util/element.js'
import {deleteCssHighlight, setCssHighlight} from '../src/plugins/highlighting/css-highlights.js'

const swissConfig = {quotes: ['«', '»'], singleQuotes: ['‹', '›'], apostrophe: '’'}
const englishConfig = {quotes: ['“', '”'], singleQuotes: ['‘', '’'], apostrophe: 'ʼ'}

describe('shouldApplySmartQuotes():', () => {
  const config = {smartQuotes: true, ...swissConfig}
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

  it('does not apply smart quotes without both double quotes', () => {
    expect(shouldApplySmartQuotes({...config, quotes: undefined}, target)).to.equal(false)
    expect(shouldApplySmartQuotes({...config, quotes: ['«']}, target)).to.equal(false)
  })

  it('does not apply smart quotes without both single quotes', () => {
    expect(shouldApplySmartQuotes({...config, singleQuotes: undefined}, target)).to.equal(false)
    expect(shouldApplySmartQuotes({...config, singleQuotes: ['‹']}, target)).to.equal(false)
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

  // Renders `html` and returns a range with the cursor at the `|`
  const render = (html) => {
    host = createElement(`<div contenteditable="true">${html}</div>`)
    document.body.append(host)
    const textNode = textNodesUnder(host).find((node) => node.nodeValue.includes('|'))
    const cursor = textNode.nodeValue.indexOf('|')
    textNode.deleteData(cursor, 1)
    const range = document.createRange()
    range.setStart(textNode, cursor)
    return range
  }

  // Types `typed` between `before` and `after`, one input at a time,
  // and returns the resulting html
  const type = (before, typed, after = '', config = swissConfig) => {
    const range = render(`${before}|${after}`)
    for (const char of typed) {
      range.startContainer.insertData(range.startOffset, char)
      range.setStart(range.startContainer, range.startOffset + char.length)
      applySmartQuotes(host, range, config, char)
    }
    return host.innerHTML
  }

  describe('double quotes', () => {
    it('writes an opening double quote at a word start', () => {
      expect(type('Er sagte: ', '"')).to.equal('Er sagte: «')
    })

    it('writes an opening double quote after an opening bracket', () => {
      expect(type('(', '"')).to.equal('(«')
    })

    it('writes a closing double quote after a word', () => {
      expect(type('«Tor', '"')).to.equal('«Tor»')
    })

    it('writes a closing double quote after a punctuation mark', () => {
      expect(type('«Tor!', '"')).to.equal('«Tor!»')
    })

    it('replaces every double quote that is not in the config', () => {
      for (const quote of ['"', '„', '“', '”']) {
        expect(type('Er sagte: ', quote)).to.equal('Er sagte: «', `Failed for: ${quote}`)
      }
    })
  })

  describe('single quotes', () => {
    it('writes an opening single quote at block start', () => {
      expect(type('', `'`)).to.equal('‹')
    })

    it('writes an opening single quote after whitespace', () => {
      expect(type('Er sagte: ', `'`)).to.equal('Er sagte: ‹')
      expect(type('Er sagte:&nbsp;', `'`)).to.equal('Er sagte:&nbsp;‹')
    })

    it('writes an opening single quote after an opening bracket or a hyphen', () => {
      expect(type('(', `'`)).to.equal('(‹')
      expect(type('Anti-', `'`)).to.equal('Anti-‹')
    })

    it('writes an opening single quote after an opening double quote', () => {
      expect(type('«', `'`)).to.equal('«‹')
    })

    it('writes a closing single quote when one is open', () => {
      expect(type('«Er rief: ‹Tor!', `'`)).to.equal('«Er rief: ‹Tor!›')
      expect(type('‹Tor', `'`, ' und jubelte')).to.equal('‹Tor› und jubelte')
    })

    it('writes a closing single quote before a punctuation mark or a hyphen', () => {
      expect(type('‹Abseits', `'`, '.')).to.equal('‹Abseits›.')
      expect(type('‹Tor', `'`, '-Jubel')).to.equal('‹Tor›-Jubel')
    })

    it('replaces every single quote that is not in the config', () => {
      for (const quote of [`'`, '‚', '‘']) {
        expect(type('Er sagte: ', quote)).to.equal('Er sagte: ‹', `Failed for: ${quote}`)
      }
    })
  })

  describe('apostrophes', () => {
    it('writes the apostrophe after a word without an open single quote', () => {
      expect(type('Hans', `'`, ' Auto')).to.equal('Hans’ Auto')
      expect(type('Wie geht', `'`, 's?')).to.equal('Wie geht’s?')
      expect(type('O', `'`, 'Brien')).to.equal('O’Brien')
    })

    it('does not treat an earlier apostrophe as an open single quote', () => {
      expect(type('Rock’n', `'`)).to.equal('Rock’n’')
    })

    it('writes the apostrophe before a letter with an open single quote', () => {
      expect(type('‹Wie geht', `'`, 's?')).to.equal('‹Wie geht’s?')
    })

    it('does not treat a closed single quote as an open single quote', () => {
      expect(type('‹Tor›, rief Hans', `'`)).to.equal('‹Tor›, rief Hans’')
      expect(type('‘Tor’, said James', `'`, '', englishConfig)).to.equal('‘Tor’, said Jamesʼ')
    })

    it('writes an apostrophe that differs from the closing single quote', () => {
      expect(type('', `He said 'it's fine' today.`, '', englishConfig)).to.equal('He said ‘itʼs fine’ today.')
      expect(type('', `He said 'it's fine' today.`, '', {...englishConfig, apostrophe: '’'})).to.equal('He said ‘it’s fine’ today.')
    })

    it('keeps a typed apostrophe', () => {
      expect(type('‹Wie geht', '’')).to.equal('‹Wie geht’')
    })

    it('turns a closing single quote before a typed letter into the apostrophe', () => {
      expect(type('‹Wie geht›', 's')).to.equal('‹Wie geht’s')
      expect(type('‹Rock›', 'n')).to.equal('‹Rock’n')
    })

    it('keeps a closing single quote at a word start', () => {
      expect(type('Das Wort ›', 'T')).to.equal('Das Wort ›T')
    })

    it('keeps a closing single quote before a typed punctuation mark', () => {
      expect(type('‹Tor›', ',')).to.equal('‹Tor›,')
    })

    it('leaves a typed letter alone without a closing single quote before it', () => {
      expect(type('Hall', 'o')).to.equal('Hallo')
    })

    it('writes apostrophes and single quotes in a sentence', () => {
      expect(type('', `Er sagt 'geht's' und geht.`)).to.equal('Er sagt ‹geht’s› und geht.')
    })

    it('leaves the quotes alone without an apostrophe config', () => {
      expect(type('Hans', `'`, ' Auto', {...swissConfig, apostrophe: undefined})).to.equal(`Hans' Auto`)
      expect(type('Hans', `'`, ' Auto', {...swissConfig, apostrophe: ''})).to.equal(`Hans' Auto`)
      expect(type('‹Wie geht', `'`, 's?', {...swissConfig, apostrophe: undefined})).to.equal(`‹Wie geht's?`)
      expect(type('‹Wie geht›', 's', '', {...swissConfig, apostrophe: undefined})).to.equal('‹Wie geht›s')
    })
  })

  describe('emojis', () => {
    it('writes single quotes in text with an emoji', () => {
      expect(type('🎉 Er sagte: ', `'`)).to.equal('🎉 Er sagte: ‹')
      expect(type('‹Gratuliere 🎉', `'`)).to.equal('‹Gratuliere 🎉›')
    })
  })

  describe('formatting and links', () => {
    it('writes a closing single quote after a formatted word', () => {
      expect(type('‹Er sagte <i>Abseits</i>', `'`)).to.equal('‹Er sagte <i>Abseits</i>›')
    })

    it('writes a closing single quote inside a link', () => {
      expect(type('‹Er sagte <a href="#">Abseits', `'`, '</a>')).to.equal('‹Er sagte <a href="#">Abseits›</a>')
    })

    it('turns a closing single quote in a formatted word into the apostrophe', () => {
      expect(type('‹Wie <b>geht›</b>', 's')).to.equal('‹Wie <b>geht’</b>s')
    })

    it('writes an opening single quote after a line break', () => {
      expect(type('Er sagte:<br>', `'`, 'Tor')).to.equal('Er sagte:<br>‹Tor')
    })
  })

  describe('cursor', () => {
    const selection = window.getSelection()
    let range

    beforeEach(() => {
      range = render(`geht'|s`)
    })

    // Replaces the typed quote in `geht's`
    const replaceQuote = () => {
      applySmartQuotes(host, range, swissConfig, `'`)
      expect(host.textContent).to.equal('geht’s')
    }

    it('keeps the cursor after the quote', () => {
      selection.collapse(host.firstChild, 5)
      replaceQuote()
      expect(selection.anchorNode).to.equal(host.firstChild)
      expect(selection.anchorOffset).to.equal(5)
    })

    it('keeps a text selection', () => {
      selection.setBaseAndExtent(host.firstChild, 0, host.firstChild, 6)
      replaceQuote()
      expect(selection.toString()).to.equal('geht’s')
    })

    it('keeps the cursor in another element', () => {
      const other = createElement('<div contenteditable="true">Tor</div>')
      document.body.append(other)
      selection.collapse(other.firstChild, 2)
      replaceQuote()
      expect(selection.anchorNode).to.equal(other.firstChild)
      other.remove()
    })
  })

  describe('highlights', () => {
    afterEach(() => {
      deleteCssHighlight({name: 'spellcheck'})
    })

    // Types `"` in `Sie sagt "Hallo` with a highlight from `start` to `end`
    // and returns the highlighted texts
    const typeWithHighlight = (start, end) => {
      const range = render('Sie sagt "|Hallo')
      setCssHighlight({name: 'spellcheck', ranges: [{editableHost: host, start, end}]})
      applySmartQuotes(host, range, swissConfig, '"')
      expect(host.textContent).to.equal('Sie sagt «Hallo')
      return Array.from(CSS.highlights.get('spellcheck'), (r) => r.toString())
    }

    it('keeps a highlight around the quote', () => {
      expect(typeWithHighlight(8, 11)).to.deep.equal([' «H'])
    })

    it('keeps a highlight away from the quote', () => {
      expect(typeWithHighlight(0, 3)).to.deep.equal(['Sie'])
    })

    it('keeps a highlight starting right after the quote', () => {
      expect(typeWithHighlight(10, 15)).to.deep.equal(['Hallo'])
    })

    it('keeps a highlight ending right before the quote', () => {
      expect(typeWithHighlight(0, 9)).to.deep.equal(['Sie sagt '])
    })
  })

  describe('unexpected input', () => {
    it('leaves the text alone when the typed quote is gone', () => {
      const range = render('geht|')
      applySmartQuotes(host, range, swissConfig, `'`)
      expect(host.textContent).to.equal('geht')
    })

    it('leaves the text alone when the cursor is at the start', () => {
      const range = render(`|'Tor`)
      applySmartQuotes(host, range, swissConfig, `'`)
      expect(host.textContent).to.equal(`'Tor`)
    })

    it('leaves the text alone when the cursor is not in a text node', () => {
      const range = render(`geht'|`)
      range.setStart(host, 1)
      applySmartQuotes(host, range, swissConfig, `'`)
      expect(host.textContent).to.equal(`geht'`)
    })
  })
})

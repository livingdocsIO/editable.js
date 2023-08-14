// See: https://en.wikipedia.org/wiki/Whitespace_character

const characters = {
  'A0': 'no-break space', // \\u00A0
  '2000': 'en quad', // \\u2000
  '2001': 'em quad', // \\u2001
  '2002': 'en space', // \\u2002
  '2003': 'em space', // \\u2003
  '2004': 'three-per-em space', // \\u2004
  '2005': 'four-per-em space', // \\u2005
  '2006': 'six-per-em space', // \\u2006
  '2007': 'figure space', // \\u2007
  '2008': 'punctuation space', // \\u2008
  '2009': 'thin space', // \\u2009
  '200A': 'hair space', // \\u200A
  '202F': 'narrow no-break space', // \\u202F
  '205F': 'medium mathematical space', // \\u205F
  '3000': 'ideographic space' // \\u3000
}

// The no-break space is not highlighted as this can cause problems.
// Browser can insert no-break spaces when typing at the end of
// a paragraph and the highlighting prevents browsers from converting
// the no-break space back to a normal space when the user keeps typing.
const specialWhitespaceChars = '\\u2000-\\u200A\\u202F\\u205F\\u3000'
const specialWhitespaceCharsRegex = new RegExp(`[${specialWhitespaceChars}]`, 'g')

export default class WhitespaceHighlighting {

  constructor (markerNode) {
    this.marker = markerNode
  }

  findMatches (text) {
    if (!text) return

    const matches = [...text.matchAll(specialWhitespaceCharsRegex)]
    return matches.map((entry) => this.prepareMatch(entry))
  }

  prepareMatch (match) {
    const startIndex = match.index
    const unicode = getUnicode(match[0])
    const description = characters[unicode]
    return {
      startIndex,
      endIndex: startIndex + match.length,
      match: match[0],
      title: `${description} (\\u${unicode})`,
      marker: this.marker
    }
  }
}

function getUnicode (character) {
  const code = character.charCodeAt(0)
  return `${code.toString(16).toUpperCase()}`
}

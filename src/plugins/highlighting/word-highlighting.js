import $ from 'jquery'

// Unicode character blocks for letters.
// See: http://jrgraphix.net/research/unicode_blocks.php
//
// \\u0041-\\u005A    A-Z (Basic Latin)
// \\u0061-\\u007A    a-z (Basic Latin)
// \\u0030-\\u0039    0-9 (Basic Latin)
// \\u00AA            ª   (Latin-1 Supplement)
// \\u00B5            µ   (Latin-1 Supplement)
// \\u00BA            º   (Latin-1 Supplement)
// \\u00C0-\\u00D6    À-Ö (Latin-1 Supplement)
// \\u00D8-\\u00F6    Ø-ö (Latin-1 Supplement)
// \\u00F8-\\u00FF    ø-ÿ (Latin-1 Supplement)
// \\u0100-\\u017F    Ā-ſ (Latin Extended-A)
// \\u0180-\\u024F    ƀ-ɏ (Latin Extended-B)
const letterChars = '\\u0041-\\u005A\\u0061-\\u007A\\u0030-\\u0039\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF\\u0100-\\u017F\\u0180-\\u024F'

export default class WordHighlighting {

  constructor (markerNode) {
    this.marker = markerNode
  }

  highlight (text, misspelledWords, callback) {
    if (!text) return callback(null)

    if (misspelledWords && misspelledWords.length > 0) {
      // this works on the old text (may be outdated by now)
      const matches = this.findMatches(text, misspelledWords)
      callback(null, matches)
    } else {
      callback(null)
    }
  }

  findMatches (text, misspelledWords) {
    const regex = this.createRegex(misspelledWords)
    const matches = []
    let match
    while ((match = regex.exec(text))) matches.push(match)

    return matches.map((entry) => this.prepareMatch(entry))
  }

  createRegex (words) {
    const escapedWords = $.map(words, (word) => this.escapeRegEx(word))

    // (notLetter|^)(words)(?=notLetter|$)
    const regex = `([^${letterChars}]|^)` +
      `(${escapedWords.join('|')})` +
      `(?=[^${letterChars}]|$)`

    return new RegExp(regex, 'g')
  }

  escapeRegEx (s) {
    return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
  }

  prepareMatch (match) {
    const startIndex = match.index + match[1].length
    return {
      startIndex,
      endIndex: startIndex + match[2].length,
      match: match[0],
      marker: this.marker
    }
  }

}

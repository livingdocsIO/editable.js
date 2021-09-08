export default class WordHighlighting {

  // @param markerNode {DOM Node}
  // @param matchMode {String} either 'word' or 'text'
  constructor (markerNode, matchMode = 'word') {
    this.marker = markerNode
    this.matchMode = matchMode
  }

  isElement (obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrome)
      return obj instanceof HTMLElement
    } catch (e) {
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have (works on IE7)
      return (typeof obj === 'object') &&
        (obj.nodeType === 1) && (typeof obj.style === 'object') &&
        (typeof obj.ownerDocument === 'object')
    }
  }

  findMatches (text, highlights) {
    if (!text || text === '' || !this.isElement(this.marker)) return

    if (highlights && highlights.length > 0) {
      return this.searchMatches(text, highlights)
    }
  }

  searchMatches (text, highlights) {
    const createRegex = this.matchMode === 'word'
      ? createWordRegex
      : createHighlightRegex

    const regex = createRegex(highlights)
    const matches = [...text.matchAll(regex)]

    return matches.map((entry) => this.prepareMatch(entry))
  }

  prepareMatch (match) {
    let startIndex
    let matchedText
    if (this.matchMode === 'word') {
      startIndex = match.index + match[1].length
      matchedText = match[2]
    } else {
      startIndex = match.index
      matchedText = match[0]
    }

    return {
      startIndex,
      endIndex: startIndex + matchedText.length,
      match: matchedText,
      marker: this.marker
    }
  }

}

function createHighlightRegex (words) {
  const escapedWords = (words || []).map((word) => escapeRegEx(word))

  const regex = `(${escapedWords.join('|')})`
  return new RegExp(regex, 'g')
}

// Regex to find whole words within a string
//
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

function createWordRegex (words) {
  const escapedWords = (words || []).map((word) => escapeRegEx(word))

  // (notLetter|^)(words)(?=notLetter|$)
  const regex = `([^${letterChars}]|^)` +
    `(${escapedWords.join('|')})` +
    `(?=[^${letterChars}]|$)`

  return new RegExp(regex, 'g')
}

function escapeRegEx (s) {
  return String(s).replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')
}

import * as content from '../../content.js'

/**
* Spellcheck class.
*
* @class Spellcheck
* @constructor
*/
export default class SpellcheckService {

  constructor (spellcheckService) {
    this.spellcheckService = spellcheckService
  }

  check (text, callback) {
    if (!text) return callback(null)

    const condensedText = content.normalizeWhitespace(text)

    this.spellcheckService(condensedText, (misspelledWords) => {
      if (misspelledWords && misspelledWords.length > 0) {
        return callback(null, misspelledWords)
      }
      return callback(null)
    })
  }

}

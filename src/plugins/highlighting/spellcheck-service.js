import * as content from '../../content'

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

    let condensedText = content.normalizeWhitespace(text)

    this.spellcheckService(condensedText, (misspelledWords) => {
      if (misspelledWords && misspelledWords.length > 0) {
        callback(null, misspelledWords)
      } else {
        callback(null)
      }
    })
  }

}

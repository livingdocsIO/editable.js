import $ from 'jquery'

import * as content from './content'
import highlightText from './highlight-text'
import * as nodeType from './node-type'

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

function escapeRegEx (s) {
  return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
}

/**
* Spellcheck class.
*
* @class Spellcheck
* @constructor
*/
export default class Spellcheck {
  constructor (editable, configuration) {
    const defaultConfig = {
      checkOnFocus: false, // check on focus
      checkOnChange: true, // check after changes
      throttle: 1000, // unbounce rate in ms before calling the spellcheck service after changes
      removeOnCorrection: true, // remove highlights after a change if the cursor is inside a highlight
      markerNode: $('<span class="spellcheck"></span>'),
      spellcheckService: undefined
    }

    this.editable = editable
    this.win = editable.win
    this.config = $.extend(defaultConfig, configuration)
    this.prepareMarkerNode()
    this.setup()
  }

  setup (editable) {
    if (this.config.checkOnFocus) {
      this.editable.on('focus', $.proxy(this, 'onFocus'))
      this.editable.on('blur', $.proxy(this, 'onBlur'))
    }
    if (this.config.checkOnChange || this.config.removeOnCorrection) {
      this.editable.on('change', $.proxy(this, 'onChange'))
    }
  }

  onFocus (editableHost) {
    if (this.focusedEditable !== editableHost) {
      this.focusedEditable = editableHost
      this.editableHasChanged(editableHost)
    }
  }

  onBlur (editableHost) {
    if (this.focusedEditable === editableHost) {
      this.focusedEditable = undefined
    }
  }

  onChange (editableHost) {
    if (this.config.checkOnChange) {
      this.editableHasChanged(editableHost, this.config.throttle)
    }
    if (this.config.removeOnCorrection) {
      this.removeHighlightsAtCursor(editableHost)
    }
  }

  prepareMarkerNode () {
    let marker = this.config.markerNode
    if (marker.jquery) {
      marker = marker[0]
    }
    marker = content.adoptElement(marker, this.win.document)
    this.config.markerNode = marker

    marker.setAttribute('data-editable', 'ui-unwrap')
    marker.setAttribute('data-spellcheck', 'spellcheck')
  }

  createMarkerNode () {
    return this.config.markerNode.cloneNode()
  }

  removeHighlights (editableHost) {
    $(editableHost).find('[data-spellcheck=spellcheck]')
    .each((index, elem) => {
      content.unwrap(elem)
    })
  }

  removeHighlightsAtCursor (editableHost) {
    const selection = this.editable.getSelection(editableHost)
    if (selection && selection.isCursor) {
      let elementAtCursor = selection.range.startContainer
      if (elementAtCursor.nodeType === nodeType.textNode) {
        elementAtCursor = elementAtCursor.parentNode
      }

      let wordId
      do {
        if (elementAtCursor === editableHost) return
        if (elementAtCursor.hasAttribute('data-word-id')) {
          wordId = elementAtCursor.getAttribute('data-word-id')
          break
        }
      } while ((elementAtCursor = elementAtCursor.parentNode))

      if (wordId) {
        selection.retainVisibleSelection(() => {
          $(editableHost).find('[data-word-id=' + wordId + ']').each((index, elem) => {
            content.unwrap(elem)
          })
        })
      }
    }
  }

  createRegex (words) {
    const escapedWords = $.map(words, (word) => escapeRegEx(word))

    const regex = `([^${letterChars}]|^)` +
      `(${escapedWords.join('|')})` +
      `(?=[^${letterChars}]|$)`

    return new RegExp(regex, 'g')
  }

  highlight (editableHost, misspelledWords) {
    // Remove old highlights
    this.removeHighlights(editableHost)

    // Create new highlights
    if (misspelledWords && misspelledWords.length > 0) {
      const regex = this.createRegex(misspelledWords)
      const span = this.createMarkerNode()
      highlightText.highlight(editableHost, regex, span)
    }
  }

  editableHasChanged (editableHost, throttle) {
    if (this.timeoutId && this.currentEditableHost === editableHost) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.checkSpelling(editableHost)
      this.currentEditableHost = undefined
      this.timeoutId = undefined
    }, throttle || 0)

    this.currentEditableHost = editableHost
  }

  checkSpelling (editableHost) {
    let text = highlightText.extractText(editableHost)
    text = content.normalizeWhitespace(text)

    this.config.spellcheckService(text, (misspelledWords) => {
      const selection = this.editable.getSelection(editableHost)
      if (!selection) return this.highlight(editableHost, misspelledWords)
      selection.retainVisibleSelection(() => {
        this.highlight(editableHost, misspelledWords)
      })
    })
  }
}

import $ from 'jquery'

import * as nodeType from './node-type'
import * as content from './content'
import highlightText from './highlight-text'
import SpellcheckService from './plugins/highlighting/spellcheck-service'
import WhitespaceHighlighting from './plugins/highlighting/whitespace-highlighting'
import WordHighlighting from './plugins/highlighting/text-highlighting'
import MatchCollection from './plugins/highlighting/match-collection'
import highlightSupport from './highlight-support'

export default class Highlighting {

  constructor (editable, configuration, spellcheckConfig) {
    this.editable = editable
    this.win = editable.win
    this.focusedEditableHost = undefined
    this.currentlyCheckedEditableHost = undefined
    this.timeout = {}

    const defaultConfig = {
      checkOnInit: false,
      checkOnFocus: false,
      checkOnChange: true,
      // unbounce rate in ms before calling the spellcheck service after changes
      throttle: 1000,
      // remove highlights after a change if the cursor is inside a highlight
      removeOnCorrection: true,
      spellcheck: {
        marker: '<span class="highlight-spellcheck"></span>',
        throttle: 1000,
        spellcheckService: function () {}
      },
      whitespace: {
        marker: '<span class="highlight-whitespace"></span>'
      }
    }

    this.config = $.extend(true, defaultConfig, configuration)

    let spellcheckService = this.config.spellcheck.spellcheckService
    const spellcheckMarker = this.config.spellcheck.marker
    const whitespaceMarker = this.config.whitespace.marker
    const spellcheckMarkerNode = highlightSupport
      .createMarkerNode(spellcheckMarker, 'spellcheck', this.win)
    const whitespaceMarkerNode = highlightSupport
      .createMarkerNode(whitespaceMarker, 'spellcheck', this.win)

    this.spellcheckService = new SpellcheckService(spellcheckService)
    this.spellcheck = new WordHighlighting(spellcheckMarkerNode)
    this.whitespace = new WhitespaceHighlighting(whitespaceMarkerNode)

    this.setupListeners()
  }

  // Events
  // ------

  setupListeners () {
    if (this.config.checkOnFocus) {
      this.editable.on('focus', $.proxy(this, 'onFocus'))
      this.editable.on('blur', $.proxy(this, 'onBlur'))
    }
    if (this.config.checkOnChange || this.config.removeOnCorrection) {
      this.editable.on('change', $.proxy(this, 'onChange'))
    }
    if (this.config.checkOnInit) {
      this.editable.on('init', $.proxy(this, 'onInit'))
    }
  }

  onInit (editableHost) {
    this.highlight(editableHost)
  }

  onFocus (editableHost) {
    if (this.focusedEditableHost !== editableHost) {
      this.focusedEditableHost = editableHost
      this.editableHasChanged(editableHost)
    }
  }

  onBlur (editableHost) {
    if (this.focusedEditableHost === editableHost) {
      this.focusedEditableHost = undefined
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

  // Manage Highlights
  // -----------------

  editableHasChanged (editableHost, throttle) {
    if (this.timeout.id && this.timeout.editableHost === editableHost) {
      clearTimeout(this.timeout.id)
    }

    const timeoutId = setTimeout(() => {
      this.highlight(editableHost)

      this.timeout = {}
    }, throttle || 0)

    this.timeout = {
      id: timeoutId,
      editableHost: editableHost
    }
  }

  highlight (editableHost) {
    let text = highlightText.extractText(editableHost)

    // getSpellcheck
    this.spellcheckService.check(text, (err, misspelledWords) => {
      if (err) { return }

      // refresh the text
      text = highlightText.extractText(editableHost)

      const matchCollection = new MatchCollection()

      let matches = this.spellcheck.findMatches(text, misspelledWords)
      matchCollection.addMatches('spellcheck', matches)

      matches = this.whitespace.findMatches(text)
      matchCollection.addMatches('whitespace', matches)

      this.safeHighlightMatches(editableHost, matchCollection.matches)
    })

  }

  // Calls highlightMatches internally but ensures
  // that the selection stays the same
  safeHighlightMatches (editableHost, matches) {
    const selection = this.editable.getSelection(editableHost)
    if (selection) {
      selection.retainVisibleSelection(() => {
        this.highlightMatches(editableHost, matches)
      })
    } else {
      this.highlightMatches(editableHost, matches)
    }
  }

  highlightMatches (editableHost, matches) {
    // Remove old highlights
    this.removeHighlights(editableHost)

    // Create new highlights
    if (matches && matches.length > 0) {
      // const span = this.createMarkerNode()
      highlightText.highlightMatches(editableHost, matches)
    }
  }

  removeHighlights (editableHost) {
    $(editableHost).find('[data-highlight="spellcheck"]')
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
        const highlightType = elementAtCursor.getAttribute('data-highlight')
        if (highlightType === 'spellcheck') {
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

}

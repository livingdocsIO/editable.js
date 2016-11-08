import $ from 'jquery'

import * as nodeType from './node-type'
import * as content from './content'
import highlightText from './highlight-text'
import SpellcheckService from './plugins/highlighting/spellcheck-service'
import WhitespaceHighlighting from './plugins/highlighting/whitespace-highlighting'
import WordHighlighting from './plugins/highlighting/word-highlighting'
import MatchCollection from './plugins/highlighting/match-collection'

export default class Highlighting {
  constructor (editable, configuration, spellcheckConfig) {
    this.editable = editable
    this.win = editable.win
    this.focusedEditableHost = undefined
    this.currentlyCheckedEditableHost = undefined
    this.timeout = {}

    const defaultConfig = {
      checkOnInit: false, // todo: implement (LP)
      checkOnFocus: false, // check on focus
      checkOnChange: true, // check after changes
      throttle: 1000, // unbounce rate in ms before calling the spellcheck service after changes
      removeOnCorrection: true, // remove highlights after a change if the cursor is inside a highlight
      spellcheck: {
        marker: '<span class="highlight-whitespace"></span>',
        throttle: 1000,
        spellcheckService: function () {}
      },
      whitespace: {
        marker: '<span class="highlight-whitespace"></span>'
      }
    }

    this.config = $.extend(true, defaultConfig, configuration)

    let spellcheckService = this.config.spellcheck.spellcheckService
    let spellcheckMarker = this.createMarkerNode(this.config.spellcheck.marker)
    let whitespaceMarker = this.createMarkerNode(this.config.whitespace.marker)

    this.spellcheckService = new SpellcheckService(spellcheckService)
    this.spellcheck = new WordHighlighting(spellcheckMarker)
    this.whitespace = new WhitespaceHighlighting(whitespaceMarker)

    this.setupListeners()
  }

  // Plugins
  // -------

  activatePlugin (name, plugin) {
    this.plugins[name] = plugin
  }


  deactivatePlugin (name) {
    this.plugins[name] = undefined
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

  // Marker
  // ------

  createMarkerNode (markerMarkup) {
    let marker = $(markerMarkup)[0]
    marker = content.adoptElement(marker, this.win.document)

    marker.setAttribute('data-editable', 'ui-unwrap')
    marker.setAttribute('data-highlight', 'highlight')
    return marker
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

      this.spellcheck.highlight(text, misspelledWords, (err, matches) => {
        if (err) { return }
        matchCollection.addMatches('spellcheck', matches)
      })

      this.whitespace.highlight(text, (err, matches) => {
        if (err) { return }
        matchCollection.addMatches('whitespace', matches)
      })

      // console.log('matchCollection', matchCollection.matches)
      this.safeHighlightMatches(editableHost, matchCollection.matches)
    })

  }

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
    $(editableHost).find('[data-highlight]')
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

}

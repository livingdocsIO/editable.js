import {selectionchange} from './feature-detection.js'
import * as clipboard from './clipboard.js'
import eventable from './eventable.js'
import SelectionWatcher from './selection-watcher.js'
import config from './config.js'
import Keyboard from './keyboard.js'
import {closest} from './util/dom.js'
import {replaceLast, endsWithSingleSpace} from './util/string.js'
import {applySmartQuotes, shouldApplySmartQuotes} from './smartQuotes.js'

/**
 * The Dispatcher module is responsible for dealing with events and their handlers.
 *
 * @module core
 * @submodule dispatcher
 */
export default class Dispatcher {

  constructor (editable) {
    const win = editable.win
    eventable(this, editable)
    this.document = win.document
    this.config = editable.config
    this.editable = editable
    this.editableSelector = editable.editableSelector
    this.selectionWatcher = new SelectionWatcher(this, win)
    this.keyboard = new Keyboard(this.selectionWatcher)
    this.activeListeners = []
    this.setup()
    this.getEditableBlockByEvent = (evt) => closest(evt.target, editable.editableSelector)
  }

  setupDocumentListener (event, func, capture = false) {
    const listener = {event, listener: func.bind(this), capture}
    this.activeListeners.push(listener)

    this.document.addEventListener(event, listener.listener, capture)
    return this
  }

  /**
  * Sets up all events that Editable.JS is catching.
  *
  * @method setup
  */
  setup () {
    // setup all events listeners and keyboard handlers
    this.setupKeyboardEvents()
    this.setupEventListeners()
  }

  unload () {
    this.off()
    for (const l of this.activeListeners) {
      this.document.removeEventListener(l.event, l.listener, l.capture)
    }
    this.activeListeners.length = 0
  }

  suspend () {
    if (this.suspended) return
    this.suspended = true
    for (const l of this.activeListeners) {
      this.document.removeEventListener(l.event, l.listener, l.capture)
    }
    this.activeListeners.length = 0
  }

  continue () {
    if (!this.suspended) return
    this.suspended = false
    this.setupEventListeners()
  }

  setupEventListeners () {
    this.setupElementListeners()
    this.setupKeydownListener()

    if (selectionchange) {
      this.setupSelectionChangeListeners()
    } else {
      this.setupSelectionChangeFallbackListeners()
    }
  }

  /**
  * Sets up events that are triggered on modifying an element.
  *
  * @method setupElementListeners
  */
  setupElementListeners () {
    this
      .setupDocumentListener('focus', function focusListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return
        if (evt.target.getAttribute(config.pastingAttribute)) return
        this.selectionWatcher.syncSelection()
        this.notify('focus', block)
      }, true)
      .setupDocumentListener('blur', function blurListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return
        if (block.getAttribute(config.pastingAttribute)) return
        this.notify('blur', block)
      }, true)
      .setupDocumentListener('copy', function copyListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return
        const selection = this.selectionWatcher.getFreshSelection()
        if (selection && selection.isSelection) {
          this.notify('clipboard', block, 'copy', selection)
        }
      })
      .setupDocumentListener('cut', function cutListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return
        const selection = this.selectionWatcher.getFreshSelection()
        if (selection && selection.isSelection) {
          this.notify('clipboard', block, 'cut', selection)
        }
      })
      .setupDocumentListener('paste', function pasteListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return

        evt.preventDefault()
        const selection = this.selectionWatcher.getFreshSelection()
        const clipboardContent = evt.clipboardData.getData('text/html') || evt.clipboardData.getData('text/plain')

        const {blocks, cursor} = clipboard.paste(block, selection, clipboardContent)
        if (blocks.length) {
          if (endsWithSingleSpace(evt.target.innerText)) {
            cursor.retainVisibleSelection(() => {
              block.innerHTML = replaceLast(block.innerHTML, '&nbsp;', ' ')
            })
          }
          this.notify('paste', block, blocks, cursor)
          // The input event does not fire when we process the content manually
          // and insert it via script
          this.notify('change', block)
        } else {
          cursor.setVisibleSelection()
        }
      })
      .setupDocumentListener('input', function inputListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return

        const target = evt.target

        if (shouldApplySmartQuotes(config, target)) {
          const currentChar = evt.data
          const selection = this.selectionWatcher.getFreshSelection()
          const offset = selection.range.startOffset
          const wholeText = [...target.innerText]
          const resetCursor = () => this.editable.createCursorAtCharacterOffset({element: block, offset})
          applySmartQuotes(config, currentChar, wholeText, offset, target, resetCursor)
        }
        this.notify('change', block)
      })

      .setupDocumentListener('formatEditable', function formatEditableListener (evt) {
        const block = this.getEditableBlockByEvent(evt)
        if (!block) return
        this.notify('change', block)
      })
  }

  dispatchSwitchEvent (event, element, direction) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const cursor = this.selectionWatcher.getFreshSelection()
    if (!cursor || cursor.isSelection) return

    // store position
    if (!this.switchContext) {
      this.switchContext = {
        positionX: cursor.getBoundingClientRect().left,
        events: ['cursor']
      }
    } else {
      this.switchContext.events = ['cursor']
    }

    if (direction === 'up' && cursor.isAtFirstLine()) {
      event.preventDefault()
      event.stopPropagation()
      this.switchContext.events = ['switch', 'blur', 'focus', 'cursor']
      this.notify('switch', element, direction, cursor)
    }

    if (direction === 'down' && cursor.isAtLastLine()) {
      event.preventDefault()
      event.stopPropagation()
      this.switchContext.events = ['switch', 'blur', 'focus', 'cursor']
      this.notify('switch', element, direction, cursor)
    }
  }

  /**
  * Sets up listener for keydown event which forwards events to
  * the Keyboard instance.
  *
  * @method setupKeydownListener
  */
  setupKeydownListener () {
    this.setupDocumentListener('keydown', function (evt) {
      const block = this.getEditableBlockByEvent(evt)
      if (!block) return
      this.keyboard.dispatchKeyEvent(evt, block, false)
    }, true)
  }

  /**
  * Sets up handlers for the keyboard events.
  * Keyboard definitions are in {{#crossLink "Keyboard"}}{{/crossLink}}.
  *
  * @method setupKeyboardEvents
  */
  setupKeyboardEvents () {
    const self = this

    this.keyboard
      .on('up', function (event) {
        self.dispatchSwitchEvent(event, this, 'up')
      })

      .on('down', function (event) {
        self.dispatchSwitchEvent(event, this, 'down')
      })

      .on('backspace', function (event) {
        const rangeContainer = self.selectionWatcher.getFreshRange()
        if (!rangeContainer.isCursor) return

        const cursor = rangeContainer.getCursor()
        if (!cursor.isAtBeginning()) return

        event.preventDefault()
        event.stopPropagation()
        self.notify('merge', this, 'before', cursor)
      })

      .on('delete', function (event) {
        const rangeContainer = self.selectionWatcher.getFreshRange()
        if (!rangeContainer.isCursor) return

        const cursor = rangeContainer.getCursor()
        if (!cursor.isAtTextEnd()) return

        event.preventDefault()
        event.stopPropagation()
        self.notify('merge', this, 'after', cursor)
      })

      .on('enter', function (event) {
        event.preventDefault()
        event.stopPropagation()
        const rangeContainer = self.selectionWatcher.getFreshRange()
        const cursor = rangeContainer.forceCursor()

        if (cursor.isAtTextEnd()) {
          self.notify('insert', this, 'after', cursor)
        } else if (cursor.isAtBeginning()) {
          self.notify('insert', this, 'before', cursor)
        } else {
          self.notify('split', this, cursor.before(), cursor.after(), cursor)
        }
      })

      .on('shiftEnter', function (event) {
        event.preventDefault()
        event.stopPropagation()
        const cursor = self.selectionWatcher.forceCursor()
        self.notify('newline', this, cursor)
      })

      .on('bold', function (event) {
        event.preventDefault()
        event.stopPropagation()
        const selection = self.selectionWatcher.getFreshSelection()
        if (selection.isSelection) {
          self.notify('toggleBold', selection)
        }
      })

      .on('italic', function (event) {
        event.preventDefault()
        event.stopPropagation()
        const selection = self.selectionWatcher.getFreshSelection()
        if (selection.isSelection) {
          self.notify('toggleEmphasis', selection)
        }
      })

      .on('character', function (event) {
        self.notify('change', this)
      })
  }

  /**
  * Sets up events that are triggered on a selection change.
  *
  * @method setupSelectionChangeListeners
  */
  setupSelectionChangeListeners () {
    let selectionDirty = false
    let suppressSelectionChanges = false
    const selectionWatcher = this.selectionWatcher

    // fires on mousemove (thats probably a bit too much)
    // catches changes like 'select all' from context menu
    this.setupDocumentListener('selectionchange', (evt) => {
      const cursor = this.selectionWatcher.getFreshSelection()

      if (cursor && cursor.isSelection && cursor.isAtBeginning() && cursor.isAtEnd()) {
        this.notify('selectToBoundary', cursor.host, evt, 'both')
      } else if (cursor && cursor.isSelection && cursor.isAtBeginning()) {
        this.notify('selectToBoundary', cursor.host, evt, 'start')
      } else if (cursor && cursor.isSelection && cursor.isAtEnd()) {
        this.notify('selectToBoundary', cursor.host, evt, 'end')
      }

      if (suppressSelectionChanges) {
        selectionDirty = true
      } else {
        selectionWatcher.selectionChanged()
      }
    })

    // listen for selection changes by mouse so we can
    // suppress the selectionchange event and only fire the
    // change event on mouseup
    this.setupDocumentListener('mousedown', function (evt) {
      if (!this.getEditableBlockByEvent(evt)) return
      if (this.config.mouseMoveSelectionChanges === false) {
        suppressSelectionChanges = true

        // Without this timeout the previous selection is active
        // until the mouseup event (no. not good).
        setTimeout(() => selectionWatcher.selectionChanged(), 0)
      }

      this.document.addEventListener('mouseup', () => {
        suppressSelectionChanges = false

        if (selectionDirty) {
          selectionDirty = false
          selectionWatcher.selectionChanged()
        }
      }, {
        capture: true,
        once: true
      })
    })
  }

  /**
  * Fallback solution to support selection change events on browsers that don't
  * support selectionChange.
  *
  * @method setupSelectionChangeFallbackListeners
  */
  setupSelectionChangeFallbackListeners () {
    // listen for selection changes by mouse
    this.setupDocumentListener('mouseup', () => {
      // In Opera when clicking outside of a block
      // it does not update the selection as it should
      // without the timeout
      setTimeout(() => this.selectionWatcher.selectionChanged(), 0)
    })

    // listen for selection changes by keys
    this.setupDocumentListener('keyup', (evt) => {
      if (!this.getEditableBlockByEvent(evt)) return
      // when pressing Command + Shift + Left for example the keyup is only triggered
      // after at least two keys are released. Strange. The culprit seems to be the
      // Command key. Do we need a workaround?
      this.selectionWatcher.selectionChanged()
    })
  }
}

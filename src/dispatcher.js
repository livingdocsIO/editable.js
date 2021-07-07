import {selectionchange} from './feature-detection'
import * as clipboard from './clipboard'
import eventable from './eventable'
import SelectionWatcher from './selection-watcher'
import config from './config'
import Keyboard from './keyboard'

// This will be set to true once we detect the input event is working.
// Input event description on MDN:
// https://developer.mozilla.org/en-US/docs/Web/Reference/Events/input
let isInputEventSupported = false

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
    this.supportsInputEvent = false
    this.document = win.document
    this.config = editable.config
    this.editable = editable
    this.editableSelector = editable.editableSelector
    this.selectionWatcher = new SelectionWatcher(this, win)
    this.keyboard = new Keyboard(this.selectionWatcher)
    this.activeListeners = []
    this.setup()
  }

  setupDocumentListener (event, func) {
    const listener = {event, listener: func.bind(this)}
    this.activeListeners.push(listener)
    this.document.addEventListener(event, listener.listener, true)
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
    for (const l of this.activeListeners) this.document.removeEventListener(l.event, l.listener)
    this.activeListeners.length = 0
  }

  suspend () {
    if (this.suspended) return
    this.suspended = true
    for (const l of this.activeListeners) this.document.removeEventListener(l.event, l.listener)
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
        if (!evt.target.matches(this.editableSelector)) return
        if (evt.target.getAttribute(config.pastingAttribute)) return
        this.selectionWatcher.syncSelection()
        this.notify('focus', evt.target)
      })
      .setupDocumentListener('blur', function blurListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        if (evt.target.getAttribute(config.pastingAttribute)) return
        this.notify('blur', evt.target)
      })
      .setupDocumentListener('copy', function copyListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        const selection = this.selectionWatcher.getFreshSelection()
        if (selection.isSelection) {
          this.notify('clipboard', evt.target, 'copy', selection)
        }
      })
      .setupDocumentListener('cut', function cutListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        const selection = this.selectionWatcher.getFreshSelection()
        if (selection.isSelection) {
          this.notify('clipboard', evt.target, 'cut', selection)
          this.triggerChangeEvent(evt.target)
        }
      })
      .setupDocumentListener('paste', function pasteListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        const afterPaste = (blocks, cursor) => {
          if (blocks.length) {
            this.notify('paste', evt.target, blocks, cursor)

            // The input event does not fire when we process the content manually
            // and insert it via script
            this.notify('change', evt.target)
          } else {
            cursor.setVisibleSelection()
          }
        }

        const cursor = this.selectionWatcher.getFreshSelection()
        clipboard.paste(evt.target, cursor, afterPaste)
      })
      .setupDocumentListener('input', function inputListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        if (isInputEventSupported) {
          this.notify('change', evt.target)
        } else {
          // Most likely the event was already handled manually by
          // triggerChangeEvent so the first time we just switch the
          // isInputEventSupported flag without notifying the change event.
          isInputEventSupported = true
        }
      })

      .setupDocumentListener('formatEditable', function formatEditableListener (evt) {
        if (!evt.target.matches(this.editableSelector)) return
        this.notify('change', evt.target)
      })
  }

  /**
  * Trigger a change event
  *
  * This should be done in these cases:
  * - typing a letter
  * - delete (backspace and delete keys)
  * - cut
  * - paste
  * - copy and paste (not easily possible manually as far as I know)
  *
  * Preferably this is done using the input event. But the input event is not
  * supported on all browsers for contenteditable elements.
  * To make things worse it is not detectable either. So instead of detecting
  * we set 'isInputEventSupported' when the input event fires the first time.
  */
  triggerChangeEvent (target) {
    if (isInputEventSupported) return
    this.notify('change', target)
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
      if (!evt.target.matches(this.editableSelector)) return
      const notifyCharacterEvent = !isInputEventSupported
      this.keyboard.dispatchKeyEvent(evt, evt.target, notifyCharacterEvent)
    })
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
        const range = self.selectionWatcher.getFreshRange()
        if (!range.isCursor) return self.triggerChangeEvent(this)

        const cursor = range.getCursor()
        if (!cursor.isAtBeginning()) return self.triggerChangeEvent(this)

        event.preventDefault()
        event.stopPropagation()
        self.notify('merge', this, 'before', cursor)
      })

      .on('delete', function (event) {
        const range = self.selectionWatcher.getFreshRange()
        if (!range.isCursor) return self.triggerChangeEvent(this)

        const cursor = range.getCursor()
        if (!cursor.isAtTextEnd()) return self.triggerChangeEvent(this)

        event.preventDefault()
        event.stopPropagation()
        self.notify('merge', this, 'after', cursor)
      })

      .on('enter', function (event) {
        event.preventDefault()
        event.stopPropagation()
        const range = self.selectionWatcher.getFreshRange()
        const cursor = range.forceCursor()

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
    this.setupDocumentListener('selectionchange', function (evt) {
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
      if (!evt.target.matches(this.editableSelector)) return
      if (this.config.mouseMoveSelectionChanges === false) {
        suppressSelectionChanges = true

        // Without this timeout the previous selection is active
        // until the mouseup event (no. not good).
        setTimeout(() => selectionWatcher.selectionChanged(), 0)
      }

      const listener = () => {
        this.document.removeEventListener('mouseup', listener)
        suppressSelectionChanges = false

        if (selectionDirty) {
          selectionDirty = false
          selectionWatcher.selectionChanged()
        }
      }

      this.document.addEventListener('mouseup', listener, true)
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
    this.setupDocumentListener('mouseup', (evt) => {
      // In Opera when clicking outside of a block
      // it does not update the selection as it should
      // without the timeout
      setTimeout(() => this.selectionWatcher.selectionChanged(), 0)
    })

    // listen for selection changes by keys
    this.setupDocumentListener('keyup', (evt) => {
      if (!evt.target.matches(this.editableSelector)) return
      // when pressing Command + Shift + Left for example the keyup is only triggered
      // after at least two keys are released. Strange. The culprit seems to be the
      // Command key. Do we need a workaround?
      this.selectionWatcher.selectionChanged()
    })
  }
}

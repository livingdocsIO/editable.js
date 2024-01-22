import * as parser from './parser.js'
import RangeContainer from './range-container.js'
import Cursor from './cursor.js'
import Selection from './selection.js'
import {getSelection} from './util/dom.js'

/**
 * The SelectionWatcher module watches for selection changes inside
 * of editable blocks.
 *
 * @module core
 * @submodule selectionWatcher
 */

export default class SelectionWatcher {
  constructor (dispatcher, win) {
    this.dispatcher = dispatcher
    this.win = win || window
    this.selection = undefined
    this.currentSelection = undefined
    this.currentRange = undefined
  }

  /**
   * Updates the internal selection pointer to the current selection.
   * Returns true if no exception occurred.
   */
  syncSelection () {
    // Note: the try catch was introduced because of rangy exceptions with nativeSelections
    try {
      this.selection = getSelection(this.win)
    } catch (err) {
      return false
    }

    return true
  }

  /**
  * Return a RangeContainer if the current selection is within an editable
  * otherwise return an empty RangeContainer
  */
  getRangeContainer () {
    const successfulSync = this.syncSelection()

    // rangeCount is 0 or 1 in all browsers except firefox
    // firefox can work with multiple ranges
    // (on a mac hold down the command key to select multiple ranges)
    if (this.selection?.rangeCount && successfulSync) {
      const range = this.selection.getRangeAt(0)
      const hostNode = parser.getHost(range.commonAncestorContainer)
      if (hostNode) return new RangeContainer(hostNode, range)
    }

    // return an empty range container
    return new RangeContainer()
  }

  /**
  * Gets a fresh RangeContainer with the current selection or cursor.
  *
  * @return RangeContainer instance
  */
  getFreshRange () {
    return this.getRangeContainer()
  }

  /**
  * Gets a fresh RangeContainer with the current selection or cursor.
  *
  * @return Either a Cursor or Selection instance or undefined if
  * there is neither a selection or cursor.
  */
  getFreshSelection () {
    const rangeContainer = this.getRangeContainer()

    return rangeContainer.isCursor
      ? rangeContainer.getCursor(this.win)
      : rangeContainer.getSelection(this.win)
  }

  /**
  * Get the selection set by the last selectionChanged event.
  * Sometimes the event does not fire fast enough and the selection
  * you get is not the one the user sees.
  * In those cases use #getFreshSelection()
  *
  * @return Either a Cursor or Selection instance or undefined if
  * there is neither a selection or cursor.
  */
  getSelection () {
    return this.currentSelection
  }

  forceCursor () {
    const rangeContainer = this.getRangeContainer()
    return rangeContainer.forceCursor()
  }

  selectionChanged () {
    const newRangeContainer = this.getRangeContainer()
    if (newRangeContainer.isDifferentFrom(this.currentRange)) {
      const lastSelection = this.currentSelection
      this.currentRange = newRangeContainer

      // empty selection or cursor
      if (lastSelection) {
        if (lastSelection.isCursor && !this.currentRange.isCursor) {
          this.dispatcher.notify('cursor', lastSelection.host)
        } else if (lastSelection.isSelection && !this.currentRange.isSelection) {
          this.dispatcher.notify('selection', lastSelection.host)
        }
      }

      // set new selection or cursor and fire event
      if (this.currentRange.isCursor) {
        this.currentSelection = new Cursor(this.currentRange.host, this.currentRange.range)
        this.dispatcher.notify('cursor', this.currentSelection.host, this.currentSelection)
      } else if (this.currentRange.isSelection) {
        this.currentSelection = new Selection(this.currentRange.host, this.currentRange.range)
        this.dispatcher.notify('selection', this.currentSelection.host, this.currentSelection)
      } else {
        this.currentSelection = undefined
      }
    }
  }
}

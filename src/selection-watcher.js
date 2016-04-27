import rangy from 'rangy'

import * as parser from './parser'
import RangeContainer from './range-container'
import Cursor from './cursor'
import Selection from './selection'

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
    this.rangySelection = undefined
    this.currentSelection = undefined
    this.currentRange = undefined
  }

  /**
  * Return a RangeContainer if the current selection is within an editable
  * otherwise return an empty RangeContainer
  */
  getRangeContainer () {
    this.rangySelection = rangy.getSelection(this.win)

    // rangeCount is 0 or 1 in all browsers except firefox
    // firefox can work with multiple ranges
    // (on a mac hold down the command key to select multiple ranges)
    if (this.rangySelection.rangeCount) {
      const range = this.rangySelection.getRangeAt(0)
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
    const range = this.getRangeContainer()

    return range.isCursor
      ? range.getCursor(this.win)
      : range.getSelection(this.win)
  }

  /**
  * Get the selection set by the last selectionChanged event.
  * Sometimes the event does not fire fast enough and the seleciton
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
    const range = this.getRangeContainer()
    return range.forceCursor()
  }

  selectionChanged () {
    const newRange = this.getRangeContainer()
    if (newRange.isDifferentFrom(this.currentRange)) {
      const lastSelection = this.currentSelection
      this.currentRange = newRange

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

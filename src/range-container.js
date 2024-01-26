import Cursor from './cursor.js'
import Selection from './selection.js'
import {rangesAreEqual} from './util/dom.js'

/** RangeContainer
 *
 * primarily used to compare ranges
 * its designed to work with undefined ranges as well
 * so we can easily compare them without checking for undefined
 * all the time
 */

export default class RangeContainer {
  constructor (editableHost, range) {
    this.host = editableHost && editableHost.jquery
      ? editableHost[0]
      : editableHost
    // Safari 17 seems to modify the range instance on the fly which breaks later comparisons.
    // We clone the range at the time of the RangeContainer creation.
    // https://developer.apple.com/documentation/safari-release-notes/safari-17-release-notes#New-Features
    this.range = range?.cloneRange()
    this.isAnythingSelected = (range !== undefined)
    this.isCursor = (this.isAnythingSelected && range.collapsed)
    this.isSelection = (this.isAnythingSelected && !this.isCursor)
  }

  getCursor () {
    if (this.isCursor) return new Cursor(this.host, this.range)
  }

  getSelection () {
    if (this.isSelection) return new Selection(this.host, this.range)
  }

  forceCursor () {
    if (!this.isSelection) return this.getCursor()
    return this.getSelection().deleteContent()
  }

  isDifferentFrom (otherRangeContainer = new RangeContainer()) {
    const self = this.range
    const other = otherRangeContainer.range
    if (self && other) return !rangesAreEqual(self, other)
    if (!self && !other) return false
    return true
  }
}

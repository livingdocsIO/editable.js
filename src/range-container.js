import Cursor from './cursor'
import Selection from './selection'

/** RangeContainer
 *
 * primarily used to compare ranges
 * its designed to work with undefined ranges as well
 * so we can easily compare them without checking for undefined
 * all the time
 */

export default class RangeContainer {
  constructor (editableHost, rangyRange) {
    this.host = editableHost && editableHost.jquery
      ? editableHost[0]
      : editableHost
    this.range = rangyRange
    this.isAnythingSelected = (rangyRange !== undefined)
    this.isCursor = (this.isAnythingSelected && rangyRange.collapsed)
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
    if (self && other) return !self.equals(other)
    if (!self && !other) return false
    return true
  }
}

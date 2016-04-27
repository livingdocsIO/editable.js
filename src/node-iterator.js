import * as nodeType from './node-type'

// A DOM node iterator.
//
// Has the ability to replace nodes on the fly and continue
// the iteration.
export default class NodeIterator {
  constructor (root) {
    this.current = this.next = this.root = root
  }

  getNextTextNode () {
    let next
    while ((next = this.getNext())) {
      if (next.nodeType === nodeType.textNode && next.data !== '') return next
    }
  }

  getNext () {
    let n = this.current = this.next
    let child = this.next = undefined
    if (this.current) {
      child = n.firstChild

      // Skip the children of elements with the attribute data-editable="remove"
      // This prevents text nodes that are not part of the content to be included.
      if (child && n.getAttribute('data-editable') !== 'remove') {
        this.next = child
      } else {
        while ((n !== this.root) && !(this.next = n.nextSibling)) {
          n = n.parentNode
        }
      }
    }
    return this.current
  }

  replaceCurrent (replacement) {
    this.current = replacement
    this.next = undefined
    let n = this.current
    while ((n !== this.root) && !(this.next = n.nextSibling)) {
      n = n.parentNode
    }
  }
}

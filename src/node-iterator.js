import {textNode} from './node-type.js'

// A DOM node iterator.
//
// Has the ability to replace nodes on the fly and continue
// the iteration.
export default class NodeIterator {

  constructor (root, method) {
    this.current = this.previous = this.nextNode = this.root = root
    this.iteratorFunc = this[method || 'getNext']
  }

  [Symbol.iterator] () {
    return this
  }

  getNextTextNode () {
    let next
    while ((next = this.getNext())) {
      if (next.nodeType === textNode && next.data !== '') return next
    }
  }

  getPreviousTextNode () {
    let prev
    while ((prev = this.getPrevious())) {
      if (prev.nodeType === textNode && prev.data !== '') return prev
    }
  }

  next () {
    const value = this.iteratorFunc()
    return value ? {value} : {done: true}
  }

  getNext () {
    let n = this.current = this.nextNode
    let child = this.nextNode = undefined
    if (this.current) {
      child = n.firstChild

      // Skip the children of elements with the attribute data-editable="remove"
      // This prevents text nodes that are not part of the content to be included.
      if (child && n.getAttribute('data-editable') !== 'remove') {
        this.nextNode = child
      } else {
        while ((n !== this.root) && !(this.nextNode = n.nextSibling)) {
          n = n.parentNode
        }
      }
    }
    return this.current
  }

  getPrevious () {
    let n = this.current = this.previous
    let child = this.previous = undefined
    if (this.current) {
      child = n.lastChild

      // Skip the children of elements with the attribute data-editable="remove"
      // This prevents text nodes that are not part of the content to be included.
      if (child && n.getAttribute('data-editable') !== 'remove') {
        this.previous = child
      } else {
        while ((n !== this.root) && !(this.previous = n.previousSibling)) {
          n = n.parentNode
        }
      }
    }
    return this.current
  }

  replaceCurrent (replacement) {
    this.current = replacement
    this.nextNode = undefined
    this.previous = undefined
    let n = this.current
    while ((n !== this.root) && !(this.nextNode = n.nextSibling)) {
      n = n.parentNode
    }
  }
}

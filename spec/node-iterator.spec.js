import {expect} from 'chai'
import {createElement} from '../src/util/dom'
import NodeIterator from '../src/node-iterator'
import highlightText from '../src/highlight-text'

describe('NodeIterator', function () {
  // Helper methods
  // --------------

  function callnTimes (object, methodName, count) {
    let returnValue
    while (count--) returnValue = object[methodName]()
    return returnValue
  }

  describe('constructor method', function () {
    beforeEach(function () {
      this.element = createElement('<div>a</div>')
      this.iterator = new NodeIterator(this.element)
    })

    it('sets its properties', function () {
      expect(this.iterator.root).to.equal(this.element)
      expect(this.iterator.current).to.equal(this.element)
      expect(this.iterator.nextNode).to.equal(this.element)
      expect(this.iterator.previous).to.equal(this.element)
    })
  })

  describe('getNext()', function () {

    beforeEach(function () {
      this.element = createElement('<div>a</div>')
      this.iterator = new NodeIterator(this.element)
    })

    it('returns the root on the first call', function () {
      const current = this.iterator.getNext()
      expect(current).to.equal(this.element)
    })

    it('returns the the first child on the second call', function () {
      const current = callnTimes(this.iterator, 'getNext', 2)
      expect(current).to.equal(this.element.firstChild)
    })

    it('returns undefined on the third call', function () {
      const current = callnTimes(this.iterator, 'getNext', 3)
      expect(current).to.equal(null)
    })
  })

  describe('replaceCurrent() after using highlightText.wrapPortion()', function () {

    it('replaces the text node', function () {
      this.element = createElement('<div>a</div>')
      this.iterator = new NodeIterator(this.element)
      const current = callnTimes(this.iterator, 'getNext', 2)
      const replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      }, createElement('<span>'))

      this.iterator.replaceCurrent(replacement)
      expect(this.iterator.current).to.equal(replacement)
      expect(this.iterator.nextNode).to.equal(null)
    })

    it('replaces the first character of longer a text node', function () {
      this.element = createElement('<div>word</div>')
      this.iterator = new NodeIterator(this.element)
      let current = callnTimes(this.iterator, 'getNext', 2)
      const replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      }, createElement('<span>'))

      this.iterator.replaceCurrent(replacement)
      current = this.iterator.getNext()
      expect(current.data).to.equal('ord')
    })
  })
})

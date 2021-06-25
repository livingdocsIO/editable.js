import $ from 'jquery'

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
      this.element = $('<div>a</div>')[0]
      this.iterator = new NodeIterator(this.element)
    })

    it('sets its properties', function () {
      expect(this.iterator.root).toEqual(this.element)
      expect(this.iterator.current).toEqual(this.element)
      expect(this.iterator.nextNode).toEqual(this.element)
      expect(this.iterator.previous).toEqual(this.element)
    })
  })

  describe('getNext()', function () {

    beforeEach(function () {
      this.element = $('<div>a</div>')[0]
      this.iterator = new NodeIterator(this.element)
    })

    it('returns the root on the first call', function () {
      const current = this.iterator.getNext()
      expect(current).toEqual(this.element)
    })

    it('returns the the first child on the second call', function () {
      const current = callnTimes(this.iterator, 'getNext', 2)
      expect(current).toEqual(this.element.firstChild)
    })

    it('returns undefined on the third call', function () {
      const current = callnTimes(this.iterator, 'getNext', 3)
      expect(current).toEqual(null)
    })
  })

  describe('replaceCurrent() after using highlightText.wrapPortion()', function () {

    it('replaces the text node', function () {
      this.element = $('<div>a</div>')[0]
      this.iterator = new NodeIterator(this.element)
      const current = callnTimes(this.iterator, 'getNext', 2)
      const replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      }, $('<span>')[0])

      this.iterator.replaceCurrent(replacement)
      expect(this.iterator.current).toEqual(replacement)
      expect(this.iterator.nextNode).toEqual(null)
    })

    it('replaces the first character of longer a text node', function () {
      this.element = $('<div>word</div>')[0]
      this.iterator = new NodeIterator(this.element)
      let current = callnTimes(this.iterator, 'getNext', 2)
      const replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      }, $('<span>')[0])

      this.iterator.replaceCurrent(replacement)
      current = this.iterator.getNext()
      expect(current.data).toEqual('ord')
    })
  })
})

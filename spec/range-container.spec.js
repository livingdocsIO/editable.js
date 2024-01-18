import {expect} from 'chai'
import {createElement, createRange} from '../src/util/dom.js'
import RangeContainer from '../src/range-container.js'

describe('RangeContainer', function () {
  describe('with no params', function () {

    beforeEach(function () {
      this.range = new RangeContainer()
    })

    it('has nothing selected', function () {
      expect(this.range.isAnythingSelected).to.equal(false)
    })

    it('is no Cursor', function () {
      expect(this.range.isCursor).to.equal(false)
    })

    it('is no Selection', function () {
      expect(this.range.isSelection).to.equal(false)
    })

    describe('getCursor()', function () {

      it('returns undefined', function () {
        expect(this.range.getCursor()).to.equal(undefined)
      })
    })

    describe('getSelection()', function () {

      it('returns undefined', function () {
        expect(this.range.getSelection()).to.equal(undefined)
      })
    })
  })

  describe('with a selection', function () {

    beforeEach(function () {
      const elem = createElement('<div>Text</div>')
      let range = createRange()
      range.selectNodeContents(elem)
      range = new RangeContainer(elem, range)
      this.range = range
    })

    it('has something selected', function () {
      expect(this.range.isAnythingSelected).to.equal(true)
    })

    it('is no Cursor', function () {
      expect(this.range.isCursor).to.equal(false)
    })

    it('is a Selection', function () {
      expect(this.range.isSelection).to.equal(true)
    })

    it('can force a cursor', function () {
      expect(this.range.host.innerHTML).to.equal('Text')

      const cursor = this.range.forceCursor()

      expect(cursor.isCursor).to.equal(true)
      expect(this.range.host.innerHTML).to.equal('')
    })
  })

  describe('with a cursor', function () {

    beforeEach(function () {
      const elem = createElement('<div>Text</div>')
      let range = createRange()
      range.selectNodeContents(elem)
      range.collapse(true)
      range = new RangeContainer(elem, range)
      this.range = range
    })

    it('has something selected', function () {
      expect(this.range.isAnythingSelected).to.equal(true)
    })

    it('is a Cursor', function () {
      expect(this.range.isCursor).to.equal(true)
    })

    it('is no Selection', function () {
      expect(this.range.isSelection).to.equal(false)
    })
  })
})

import $ from 'jquery'
import rangy from 'rangy'

import RangeContainer from '../src/range-container'

describe('RangeContainer', () => {
  describe('with no params', () => {
    let range
    beforeEach(() => {
      range = new RangeContainer()
    })

    it('has nothing selected', () => {
      expect(range.isAnythingSelected).toBe(false)
    })

    it('is no Cursor', () => {
      expect(range.isCursor).toBe(false)
    })

    it('is no Selection', () => {
      expect(range.isSelection).toBe(false)
    })

    describe('getCursor()', () => {
      it('returns undefined', () => {
        expect(range.getCursor()).toBe(undefined)
      })
    })

    describe('getSelection()', () => {
      it('returns undefined', () => {
        expect(range.getSelection()).toBe(undefined)
      })
    })
  })

  describe('with a selection', () => {
    let range
    beforeEach(() => {
      var elem = $('<div>Text</div>')
      range = rangy.createRange()
      range.selectNodeContents(elem[0])
      range = new RangeContainer(elem[0], range)
    })

    it('has something selected', () => {
      expect(range.isAnythingSelected).toBe(true)
    })

    it('is no Cursor', () => {
      expect(range.isCursor).toBe(false)
    })

    it('is a Selection', () => {
      expect(range.isSelection).toBe(true)
    })

    it('can force a cursor', () => {
      expect(range.host.innerHTML).toEqual('Text')

      const cursor = range.forceCursor()

      expect(cursor.isCursor).toBe(true)
      expect(range.host.innerHTML).toEqual('')
    })
  })

  describe('with a cursor', () => {
    let range
    beforeEach(() => {
      var elem = $('<div>Text</div>')
      range = rangy.createRange()
      range.selectNodeContents(elem[0])
      range.collapse(true)
      range = new RangeContainer(elem, range)
    })

    it('has something selected', () => {
      expect(range.isAnythingSelected).toBe(true)
    })

    it('is a Cursor', () => {
      expect(range.isCursor).toBe(true)
    })

    it('is no Selection', () => {
      expect(range.isSelection).toBe(false)
    })
  })
})

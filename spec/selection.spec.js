import $ from 'jquery'
import rangy from 'rangy'

import Selection from '../src/selection'
import Cursor from '../src/cursor'

describe('Selection', function () {
  it('should be defined', () => {
    expect(Selection).toBeDefined()
  })

  describe('with a range', () => {
    beforeEach(() => {
      this.oneWord = $('<div>foobar</div>')[0]
      const range = rangy.createRange()
      range.selectNodeContents(this.oneWord)
      this.selection = new Selection(this.oneWord, range)
    })

    it('sets a reference to window', () => {
      expect(this.selection.win).toEqual(window)
    })

    it('sets #isSelection to true', () => {
      expect(this.selection.isSelection).toBe(true)
    })

    describe('isAllSelected()', () => {
      it('returns true if all is selected', () => {
        expect(this.selection.isAllSelected()).toEqual(true)
      })

      it('returns true if all is selected', () => {
        const textNode = this.oneWord.firstChild
        let range = rangy.createRange()
        range.setStartBefore(textNode)
        range.setEnd(textNode, 6)
        let selection = new Selection(this.oneWord, range)
        expect(selection.isAllSelected()).toEqual(true)

        range = rangy.createRange()
        range.setStartBefore(textNode)
        range.setEnd(textNode, 5)
        selection = new Selection(this.oneWord, range)
        expect(selection.isAllSelected()).toEqual(false)
      })
    })
  })

  describe('inherits form Cursor', () => {
    it('has isAtEnd() method from Cursor in its protoype chain', () => {
      expect(Selection.prototype.hasOwnProperty('isAtEnd')).toEqual(false)
      expect(Cursor.prototype.hasOwnProperty('isAtEnd')).toEqual(true)
      expect('isAtEnd' in Selection.prototype).toEqual(true)
    })
  })
})

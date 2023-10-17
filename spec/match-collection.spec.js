import {expect} from 'chai'
import MatchCollection from '../src/plugins/highlighting/match-collection'


describe('MatchCollection', function () {

  describe('new MatchCollection()', function () {

    it('creates an instance', function () {
      const matches = new MatchCollection()
      expect(matches).to.be.an.instanceof(MatchCollection)
    })

  })

  describe('addMatches()', function () {

    beforeEach(function () {
      this.collection = new MatchCollection()
    })


    it('adds a match', function () {
      this.collection.addMatches([{
        startIndex: 0,
        endIndex: 1
      }])

      expect(this.collection.matches).to.deep.equal([{
        startIndex: 0,
        endIndex: 1
      }])
    })

    it('merges two matches', function () {
      this.collection.addMatches([{
        startIndex: 0,
        endIndex: 1
      }])

      this.collection.addMatches([{
        startIndex: 1,
        endIndex: 2
      }])

      expect(this.collection.matches).to.deep.equal([{
        startIndex: 0,
        endIndex: 1
      }, {
        startIndex: 1,
        endIndex: 2
      }])
    })


    it('prevents overlaps', function () {
      this.collection.addMatches([{
        startIndex: 0,
        endIndex: 2
      }])

      this.collection.addMatches([{
        startIndex: 1,
        endIndex: 2
      }])

      expect(this.collection.matches).to.deep.equal([{
        startIndex: 0,
        endIndex: 2
      }])
    })
  })

})

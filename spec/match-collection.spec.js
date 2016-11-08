import MatchCollection from '../src/plugins/highlighting/match-collection'


describe('MatchCollection', function () {

  // Specs

  describe('new MatchCollection()', () => {

    it('creates an instance', () => {
      const matches = new MatchCollection()
      expect(matches).toBeDefined()
    })

  })

  describe('addMatches()', () => {

    beforeEach(() => {
      this.collection = new MatchCollection()
    })


    it('adds a match', () => {
      this.collection.addMatches('test', [{
        startIndex: 0,
        endIndex: 1
      }])

      expect(this.collection.matches).toEqual([{
        startIndex: 0,
        endIndex: 1
      }])
    })

    it('merges two matches', () => {
      this.collection.addMatches('test', [{
        startIndex: 0,
        endIndex: 1
      }])

      this.collection.addMatches('second test', [{
        startIndex: 1,
        endIndex: 2
      }])

      expect(this.collection.matches).toEqual([{
        startIndex: 0,
        endIndex: 1
      }, {
        startIndex: 1,
        endIndex: 2
      }])
    })


    it('prevents overlaps', () => {
      this.collection.addMatches('test', [{
        startIndex: 0,
        endIndex: 2
      }])

      this.collection.addMatches('second test', [{
        startIndex: 1,
        endIndex: 2
      }])

      expect(this.collection.matches).toEqual([{
        startIndex: 0,
        endIndex: 2
      }])
    })
  })

})

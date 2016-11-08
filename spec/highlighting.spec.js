import Editable from '../src/core'
import Highlighting from '../src/highlighting'


describe('Highlighting', function () {

  // Specs

  beforeEach(() => {
    this.editable = new Editable()
  })

  describe('new Highlighting()', () => {

    it('creates an instance with a reference to editable', () => {
      const highlighting = new Highlighting(this.editable, {})
      expect(highlighting.editable).toEqual(this.editable)
    })

  })

})

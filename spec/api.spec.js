import {expect} from 'chai'
import {Editable} from '../src/core'

describe('Editable', function () {
  let editable, div

  afterEach(function () {
    if (!editable) return
    editable.unload()
    editable = undefined
  })

  describe('global variable', function () {

    it('is not defined', function () {
      expect(window.Editable).to.equal(undefined)
    })

    it('creates a new Editable instance', function () {
      editable = new Editable()
      expect(editable.on).to.be.a('function')
    })

    // Test no variables are leaking into global namespace
    it('does not define dispatcher globally', function () {
      expect(window.dispatcher).to.equal(undefined)
    })
  })

  describe('with an element added', function () {

    beforeEach(function () {
      div = document.createElement('div')
      document.body.appendChild(div)
      editable = new Editable()
      editable.add(div)
    })

    afterEach(function () {
      div.remove()
    })

    describe('getContent()', function () {
      it('getContent() returns its content', function () {
        div.innerHTML = 'a'
        const content = editable.getContent(div)

        // escape to show invisible characters
        expect(escape(content)).to.equal('a')
      })
    })

    describe('appendTo()', function () {

      it('appends a document fragment', function () {
        div.innerHTML = 'a'
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        editable.appendTo(div, frag)
        expect(div.innerHTML).to.equal('ab')
      })

      it('appends text from a string', function () {
        div.innerHTML = 'a'
        editable.appendTo(div, 'b')
        expect(div.innerHTML).to.equal('ab')
      })

      it('appends html from a string', function () {
        div.innerHTML = 'a'
        editable.appendTo(div, '<span>b</span>c')
        expect(div.innerHTML).to.equal('a<span>b</span>c')
      })

      it('returns a cursor a the right position', function () {
        div.innerHTML = 'a'
        const cursor = editable.appendTo(div, 'b')
        expect(cursor.beforeHtml()).to.equal('a')
        expect(cursor.afterHtml()).to.equal('b')
      })
    })

    describe('prependTo()', function () {

      it('prepends a document fragment', function () {
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        div.innerHTML = 'a'
        editable.prependTo(div, frag)
        expect(div.innerHTML).to.equal('ba')
      })

      it('prepends text from a string', function () {
        div.innerHTML = 'a'
        editable.prependTo(div, 'b')
        expect(div.innerHTML).to.equal('ba')
      })

      it('prepends html from a string', function () {
        div.innerHTML = 'A sentence.'
        editable.prependTo(div, '<span>So</span> be it. ')
        expect(div.innerHTML).to.equal('<span>So</span> be it. A sentence.')
      })

      it('returns a cursor a the right position', function () {
        div.innerHTML = 'a'
        const cursor = editable.prependTo(div, 'b')
        expect(cursor.beforeHtml()).to.equal('b')
        expect(cursor.afterHtml()).to.equal('a')
      })
    })

    describe('change event', function () {

      it('gets triggered after format change', (done) => {
        editable.change((element) => {
          expect(element).to.equal(div)
          done()
        })

        const cursor = editable.createCursorAtBeginning(div)
        cursor.triggerChange()
      })
    })

    describe('findClosestCursorOffset:', function () {
    /*
     * Cursor1:                     | (left: 130)
     * Comp 1:   Cristiano Ronaldo wurde 2018 mit grossem Tamtam nach Turin geholt.
     * Comp 2:   Der Spieler blieb bei fünf Champions-League-Titeln stehen.
     * Cursor 2:                    | (offset: 19 chars)
     */
      it('finds the index in a text node', function () {
        div.innerHTML = 'Der Spieler blieb bei fünf Champions-League-Titeln stehen.'
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: div,
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).to.equal(true)
        expect(offset).to.equal(19)
      })

      /*
       * Cursor1:                      | (left: 130)
       * Comp 1:   Cristiano Ronaldo wurde 2018 mit grossem Tamtam nach Turin geholt.
       * Comp 2:   <p>Der <em>Spieler</em> blieb bei fünf <span>Champions-League-Titeln</span> stehen.</p>
       * Cursor 2:                                   |
       */
      it('finds the index in a nested html tag structure', function () {
        div.innerHTML = '<p>Der <em>Spieler</em> blieb bei fünf <span>Champions-League-Titeln</span> stehen.</p>'
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: div,
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).to.equal(true)
        expect(offset).to.equal(19)
      })

      it('returns not found for empty nodes', function () {
        div.innerHTML = ''
        const {wasFound} = editable.findClosestCursorOffset({
          element: div,
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).to.equal(false)
      })

      /*
       * Cursor1:                                                   |
       * Comp 1:   Cristiano Ronaldo wurde 2018 mit grossem Tamtam nach Turin geholt.
       * Comp 2:   Foo
       * Cursor 2: not found
       */
      it('returns not found for coordinates that are out of the text area', function () {
        div.innerHTML = 'Foo'
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: div,
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).to.equal(true)
        expect(offset).to.equal(3)
      })
    })
  })
})

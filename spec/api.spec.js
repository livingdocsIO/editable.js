import $ from 'jquery'

import Editable from '../src/core'

describe('Editable', function () {
  let editable, $div

  afterEach(function () {
    if (editable) {
      editable.off()
      editable = undefined
    }
  })

  describe('global variable', function () {

    it('is not defined', function () {
      expect(window.Editable).toBeUndefined()
    })

    it('creates a new Editable instance', function () {
      editable = new Editable()
      expect(editable.on).toBeDefined()
    })

    // Test no variables are leaking into global namespace
    it('does not define dispatcher globally', function () {
      expect(window.dispatcher).not.toBeDefined()
    })
  })

  describe('with an element added', function () {

    beforeEach(function () {
      $div = $('<div>').appendTo(document.body)
      editable = new Editable()
      editable.add($div)
    })

    afterEach(function () {
      $div.remove()
    })

    describe('getContent()', function () {
      it('getContent() returns its content', function () {
        $div.html('a')
        const content = editable.getContent($div[0])

        // escape to show invisible characters
        expect(escape(content)).toEqual('a')
      })
    })

    describe('appendTo()', function () {

      it('appends a document fragment', function () {
        $div.html('a')
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        editable.appendTo($div[0], frag)
        expect($div[0].innerHTML).toEqual('ab')
      })

      it('appends text from a string', function () {
        $div.html('a')
        editable.appendTo($div[0], 'b')
        expect($div[0].innerHTML).toEqual('ab')
      })

      it('appends html from a string', function () {
        $div.html('a')
        editable.appendTo($div[0], '<span>b</span>c')
        expect($div[0].innerHTML).toEqual('a<span>b</span>c')
      })

      it('returns a curosr a the right position', function () {
        $div.html('a')
        const cursor = editable.appendTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('a')
        expect(cursor.afterHtml()).toEqual('b')
      })
    })

    describe('prependTo()', function () {

      it('prepends a document fragment', function () {
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        $div.html('a')
        editable.prependTo($div[0], frag)
        expect($div[0].innerHTML).toEqual('ba')
      })

      it('prepends text from a string', function () {
        $div.html('a')
        editable.prependTo($div[0], 'b')
        expect($div[0].innerHTML).toEqual('ba')
      })

      it('prepends html from a string', function () {
        $div.html('A sentence.')
        editable.prependTo($div[0], '<span>So</span> be it. ')
        expect($div[0].innerHTML).toEqual('<span>So</span> be it. A sentence.')
      })

      it('returns a curosr a the right position', function () {
        $div.html('a')
        const cursor = editable.prependTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('b')
        expect(cursor.afterHtml()).toEqual('a')
      })
    })

    describe('change event', function () {

      it('gets triggered after format change', (done) => {
        editable.change((element) => {
          expect(element).toEqual($div[0])
          done()
        })

        const cursor = editable.createCursorAtBeginning($div[0])
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
        $div.html('Der Spieler blieb bei fünf Champions-League-Titeln stehen.')
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: $div[0],
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).toEqual(true)
        expect(offset).toEqual(19)
      })

      /*
       * Cursor1:                      | (left: 130)
       * Comp 1:   Cristiano Ronaldo wurde 2018 mit grossem Tamtam nach Turin geholt.
       * Comp 2:   <p>Der <em>Spieler</em> blieb bei fünf <span>Champions-League-Titeln</span> stehen.</p>
       * Cursor 2:                                   |
       */
      it('finds the index in a nested html tag structure', function () {
        $div.html('<p>Der <em>Spieler</em> blieb bei fünf <span>Champions-League-Titeln</span> stehen.</p>')
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: $div[0],
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).toEqual(true)
        expect(offset).toEqual(19)
      })

      it('returns not found for empty nodes', function () {
        $div.html('')
        const {wasFound} = editable.findClosestCursorOffset({
          element: $div[0],
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).toEqual(false)
      })

      /*
       * Cursor1:                                                   |
       * Comp 1:   Cristiano Ronaldo wurde 2018 mit grossem Tamtam nach Turin geholt.
       * Comp 2:   Foo
       * Cursor 2: not found
       */
      it('returns not found for coordinates that are out of the text area', function () {
        $div.html('Foo')
        const {wasFound, offset} = editable.findClosestCursorOffset({
          element: $div[0],
          origCoordinates: {top: 0, left: 130}
        })
        expect(wasFound).toEqual(true)
        expect(offset).toEqual(3)
      })
    })
  })
})

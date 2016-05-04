import $ from 'jquery'

import Editable from '../src/core'

describe('Editable', () => {
  let editable, $div

  afterEach(() => {
    if (editable) {
      editable.off()
      editable = undefined
    }
  })

  describe('global variable', () => {
    it('is not defined', () => {
      expect(window.Editable).toBeUndefined()
    })

    it('creates a new Editable instance', () => {
      editable = new Editable()
      expect(editable.on).toBeDefined()
    })

    // Test no variables are leaking into global namespace
    it('does not define dispatcher globally', () => {
      expect(window.dispatcher).not.toBeDefined()
    })
  })

  describe('with an element added', () => {
    beforeEach(() => {
      $div = $('<div>').appendTo(document.body)
      editable = new Editable()
      editable.add($div)
    })

    afterEach(() => {
      $div.remove()
    })

    describe('getContent()', () => {
      it('getContent() returns its content', () => {
        $div.html('a')
        const content = editable.getContent($div[0])

        // escape to show invisible characters
        expect(escape(content)).toEqual('a')
      })
    })

    describe('appendTo()', () => {
      it('appends a document fragment', () => {
        $div.html('a')
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        editable.appendTo($div[0], frag)
        expect($div[0].innerHTML).toEqual('ab')
      })

      it('appends text from a string', () => {
        $div.html('a')
        editable.appendTo($div[0], 'b')
        expect($div[0].innerHTML).toEqual('ab')
      })

      it('appends html from a string', () => {
        $div.html('a')
        editable.appendTo($div[0], '<span>b</span>c')
        expect($div[0].innerHTML).toEqual('a<span>b</span>c')
      })

      it('returns a curosr a the right position', () => {
        $div.html('a')
        const cursor = editable.appendTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('a')
        expect(cursor.afterHtml()).toEqual('b')
      })
    })

    describe('prependTo()', () => {
      it('prepends a document fragment', () => {
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode('b'))
        $div.html('a')
        editable.prependTo($div[0], frag)
        expect($div[0].innerHTML).toEqual('ba')
      })

      it('prepends text from a string', () => {
        $div.html('a')
        editable.prependTo($div[0], 'b')
        expect($div[0].innerHTML).toEqual('ba')
      })

      it('prepends html from a string', () => {
        $div.html('A sentence.')
        editable.prependTo($div[0], '<span>So</span> be it. ')
        expect($div[0].innerHTML).toEqual('<span>So</span> be it. A sentence.')
      })

      it('returns a curosr a the right position', () => {
        $div.html('a')
        const cursor = editable.prependTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('b')
        expect(cursor.afterHtml()).toEqual('a')
      })
    })

    describe('change event', () => {
      it('gets triggered after format change', (done) => {
        editable.change((element) => {
          expect(element).toEqual($div[0])
          done()
        })

        const cursor = editable.createCursorAtBeginning($div[0])
        cursor.triggerChange()
      })
    })
  })
})

import $ from 'jquery'

import Editable from '../src/core'

describe('Editable', function () {
  var editable, $div

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
        var content = editable.getContent($div[0])

        // escape to show invisible characters
        expect(escape(content)).toEqual('a')
      })
    })

    describe('appendTo()', function () {
      it('appends a document fragment', function () {
        $div.html('a')
        var frag = document.createDocumentFragment()
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
        var cursor = editable.appendTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('a')
        expect(cursor.afterHtml()).toEqual('b')
      })
    })

    describe('prependTo()', function () {
      it('prepends a document fragment', function () {
        var frag = document.createDocumentFragment()
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
        var cursor = editable.prependTo($div[0], 'b')
        expect(cursor.beforeHtml()).toEqual('b')
        expect(cursor.afterHtml()).toEqual('a')
      })
    })

    describe('change event', function () {
      it('gets triggered after format change', function (done) {
        editable.change(function (element) {
          expect(element).toEqual($div[0])
          done()
        })

        var cursor = editable.createCursorAtBeginning($div[0])
        cursor.triggerChange()
      })
    })
  })
})

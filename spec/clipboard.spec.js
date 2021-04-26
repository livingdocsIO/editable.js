import {parseContent, updateConfig} from '../src/clipboard'
import cloneDeep from 'lodash.clonedeep'
import config from '../src/config'

describe('Clipboard', function () {

  describe('parseContent()', function () {

    afterEach(function () {
      updateConfig(config)
    })

    function extract (str) {
      const div = document.createElement('div')
      div.innerHTML = str
      return parseContent(div)
    }

    function extractSingleBlock (str) {
      return extract(str)[0]
    }

    // Copy Elements
    // -------------

    it('gets a plain text', function () {
      expect(extractSingleBlock('a')).toEqual('a')
    })

    it('trims text', function () {
      expect(extractSingleBlock(' a ')).toEqual('a')
    })

    it('keeps a <a> element with an href attribute with an absolute link', function () {
      expect(extractSingleBlock('<a href="http://link.com">a</a>')).toEqual('<a href="http://link.com">a</a>')
    })

    it('keeps a <a> element with an href attribute with an relative link', function () {
      expect(extractSingleBlock('<a href="/link/1337">a</a>')).toEqual('<a href="/link/1337">a</a>')
    })

    it('keeps a <a> element with an a list of whitelisted-attributes', function () {
      const updatedConfig = cloneDeep(config)
      updatedConfig.pastedHtmlRules.allowedElements = {a: {href: true, rel: true, target: true}}

      updateConfig(updatedConfig)
      expect(
        extractSingleBlock(
          '<a target="_blank" rel="nofollow" href="/link/1337">a</a>'
        )
      ).toEqual('<a target="_blank" rel="nofollow" href="/link/1337">a</a>')
    })

    it('removes attributes that arent whitelisted for an <a> element ', function () {
      const updatedConfig = cloneDeep(config)
      updatedConfig.pastedHtmlRules.allowedElements = {a: {href: true}}
      updateConfig(updatedConfig)
      expect(
        extractSingleBlock(
          '<a target="_blank" rel="nofollow" href="/link/1337">a</a>'
        )
      ).toEqual('<a href="/link/1337">a</a>')
    })

    it('keeps a <strong> element', function () {
      expect(extractSingleBlock('<strong>a</strong>')).toEqual('<strong>a</strong>')
    })

    it('keeps an <em> element', function () {
      expect(extractSingleBlock('<em>a</em>')).toEqual('<em>a</em>')
    })

    it('keeps a <br> element', function () {
      expect(extractSingleBlock('a<br>b')).toEqual('a<br>b')
    })

    // Split Blocks
    // ------------

    it('creates two blocks from two paragraphs', function () {
      const blocks = extract('<p>a</p><p>b</p>')
      expect(blocks[0]).toEqual('a')
      expect(blocks[1]).toEqual('b')
    })

    it('creates two blocks from an <h1> followed by an <h2>', function () {
      const blocks = extract('<h1>a</h1><h2>b</h2>')
      expect(blocks[0]).toEqual('a')
      expect(blocks[1]).toEqual('b')
    })

    // Clean Whitespace
    // ----------------

    function checkWhitespace (a, b) {
      expect(escape(extractSingleBlock(a))).toEqual(escape(b))
    }

    it('replaces a single &nbsp; character', function () {
      checkWhitespace('a&nbsp;b', 'a b')
    })

    it('replaces a series of &nbsp; with alternating whitespace and &nbsp;', function () {
      checkWhitespace('a&nbsp;&nbsp;&nbsp;&nbsp;b', 'a \u00A0 \u00A0b')
    })

    it('replaces a single &nbsp; character before a <span>', function () {
      checkWhitespace('a&nbsp;<span>b</span>', 'a b')
    })

    it('collapses multiple whitespaces', function () {
      checkWhitespace('A  B   C    D', 'A B C D')
    })

    it('removes newlines', function () {
      checkWhitespace('A\nB \n C', 'A B C')
    })

    // Remove Elements
    // ---------------

    it('removes a <span> element', function () {
      expect(extractSingleBlock('<span>a</span>')).toEqual('a')
    })

    it('removes an <a> element without an href attribute', function () {
      expect(extractSingleBlock('<a>a</a>')).toEqual('a')
    })


    it('removes an <a> element with an empty href attribute', function () {
      expect(extractSingleBlock('<a href>a</a>')).toEqual('a')
    })

    it('removes an <a> element with an empty href attribute', function () {
      expect(extractSingleBlock('<a href="">a</a>')).toEqual('a')
    })

    it('removes an empty <strong> element', function () {
      expect(extractSingleBlock('<strong></strong>')).toEqual(undefined)
    })

    it('removes a <strong> element with only whitespace', function () {
      expect(extractSingleBlock('<strong> </strong>')).toEqual(undefined)
    })

    it('removes an empty <strong> element but keeps its whitespace', function () {
      expect(extractSingleBlock('a<strong> </strong>b')).toEqual('a b')
    })

    it('removes an attribute from an <em> element', function () {
      expect(extractSingleBlock('<em data-something="x">a</em>')).toEqual('<em>a</em>')
    })

    // Transform Elements
    // ------------------

    it('transforms a <b> into a <strong>', function () {
      expect(extractSingleBlock('<b>a</b>')).toEqual('<strong>a</strong>')
    })

    it('changes absolute links to relative ones with the keepInternalRelativeLinks flag set to true', function () {
      const updatedConfig = cloneDeep(config)
      updatedConfig.pastedHtmlRules.keepInternalRelativeLinks = true
      updateConfig(updatedConfig)
      expect(extractSingleBlock(`<a href="${window.location.origin}/test123">a</a>`)).toEqual('<a href="/test123">a</a>')
    })

    // Escape Content
    // --------------

    it('escapes the string "<b>a</b>"', function () {
      // append the string to test as text node so the browser escapes it.
      const div = document.createElement('div')
      div.appendChild(document.createTextNode('<b>a</b>'))

      expect(parseContent(div)[0]).toEqual('&lt;b&gt;a&lt;/b&gt;')
    })

    it('removes blacklisted HTML elements (e.g. <style>)', function () {
      const div = document.createElement('div')
      div.innerHTML = `
        <style type="text/css">
          .foo { color: red; }
        </style>
        <p class="foo">
          bar
        </p>`

      expect(parseContent(div)[0]).toEqual('bar')
    })
  })
})

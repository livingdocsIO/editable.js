import {expect} from 'chai'
import {escapeHtml} from '../src/util/string'

describe('string util', function () {

  describe('escapeHtml()', function () {

    it('escapes <, > and &', function () {
      expect(escapeHtml('<>&')).to.equal('&lt;&gt;&amp;')
    })

    it('escapes <, >, &, " and \' for attributes', function () {
      expect(escapeHtml('<>&\'"', 'attribute')).to.equal('&lt;&gt;&amp;&#39;&quot;')
    })
  })
})

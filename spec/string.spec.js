import { escapeHtml } from '../src/util/string'

describe('string util', () => {
  describe('escapeHtml()', () => {
    it('escapes <, > and &', () => {
      expect(escapeHtml('<>&')).toEqual('&lt;&gt;&amp;')
    })

    it('escapes <, >, &, " and \' for attributes', () => {
      expect(escapeHtml('<>&\'"', 'attribute')).toEqual('&lt;&gt;&amp;&#39;&quot;')
    })
  })
})

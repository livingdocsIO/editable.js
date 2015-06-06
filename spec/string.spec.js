var string = require('../src/util/string');

describe('string util', function() {

  describe('escapeHtml()', function() {

    it('escapes <, > and &', function() {
      expect( string.escapeHtml('<>&') ).toEqual('&lt;&gt;&amp;');
    });

    it('escapes <, >, &, " and \' for attributes', function() {
      expect( string.escapeHtml('<>&\'\"', 'attribute') ).toEqual('&lt;&gt;&amp;&#39;&quot;');
    });

  });
});

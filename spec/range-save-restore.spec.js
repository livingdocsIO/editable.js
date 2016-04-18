var $ = require('jquery')
var rangy = require('rangy')

var rangeSaveRestore = require('../src/range-save-restore')

describe('RangeSaveRestore', function () {
  var range, host
  beforeEach(function () {
    range = rangy.createRange()
  })

  it('saves a range', function () {
    // <div>|a|</div>
    host = $('<div><div>a</div></div>')
    range.setStart(host[0].firstChild, 0)
    range.setEnd(host[0].firstChild, 1)
    rangeSaveRestore.save(range)
    expect(range.toHtml()).toEqual('a')
    expect(host[0].firstChild.childNodes[0].nodeName).toEqual('SPAN')
    expect(host[0].firstChild.childNodes[1].nodeValue).toEqual('a')
    expect(host[0].firstChild.childNodes[2].nodeName).toEqual('SPAN')
  })

  it('restores a range', function () {
    // <div>|a|</div>
    host = $('<div><div>a</div></div>')
    range.setStart(host[0].firstChild, 0)
    range.setEnd(host[0].firstChild, 1)
    var savedRange = rangeSaveRestore.save(range)
    var recoveredRange = rangeSaveRestore.restore(host[0].firstChild, savedRange)
    expect($(host[0].firstChild).html()).toEqual('a')
    expect(recoveredRange.toHtml()).toEqual('a')
  })
})

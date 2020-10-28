import $ from 'jquery'
import rangy from 'rangy'

import * as rangeSaveRestore from '../src/range-save-restore'

describe('RangeSaveRestore', function () {

  beforeEach(function () {
    this.range = rangy.createRange()
  })

  it('saves a range', function () {
    // <div>|a|</div>
    const host = $('<div><div>a</div></div>')
    this.range.setStart(host[0].firstChild, 0)
    this.range.setEnd(host[0].firstChild, 1)
    rangeSaveRestore.save(this.range)
    expect(this.range.toHtml()).toEqual('a')
    expect(host[0].firstChild.childNodes[0].nodeName).toEqual('SPAN')
    expect(host[0].firstChild.childNodes[1].nodeValue).toEqual('a')
    expect(host[0].firstChild.childNodes[2].nodeName).toEqual('SPAN')
  })

  it('restores a range', function () {
    // <div>|a|</div>
    const host = $('<div><div>a</div></div>')
    this.range.setStart(host[0].firstChild, 0)
    this.range.setEnd(host[0].firstChild, 1)
    const savedRange = rangeSaveRestore.save(this.range)
    const recoveredRange = rangeSaveRestore.restore(host[0].firstChild, savedRange)
    expect($(host[0].firstChild).html()).toEqual('a')
    expect(recoveredRange.toHtml()).toEqual('a')
  })
})

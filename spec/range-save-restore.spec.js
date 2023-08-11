import {expect} from 'chai'
import {createElement, createRange, rangeToHtml} from '../src/util/dom'
import * as rangeSaveRestore from '../src/range-save-restore'

describe('RangeSaveRestore', function () {

  beforeEach(function () {
    this.range = createRange()
  })

  it('saves a range', function () {
    // <div>|a|</div>
    const host = createElement('<div><div>a</div></div>')
    this.range.setStart(host.firstChild, 0)
    this.range.setEnd(host.firstChild, 1)
    rangeSaveRestore.save(this.range)
    expect(rangeToHtml(this.range)).to.equal('a')
    expect(host.firstChild.childNodes[0].nodeName).to.equal('SPAN')
    expect(host.firstChild.childNodes[1].nodeValue).to.equal('a')
    expect(host.firstChild.childNodes[2].nodeName).to.equal('SPAN')
  })

  it('restores a range', function () {
    // <div>|a|</div>
    const host = createElement('<div><div>a</div></div>')
    this.range.setStart(host.firstChild, 0)
    this.range.setEnd(host.firstChild, 1)
    const savedRange = rangeSaveRestore.save(this.range)
    const recoveredRange = rangeSaveRestore.restore(host.firstChild, savedRange)
    expect(host.firstChild.innerHTML).to.equal('a')
    expect(rangeToHtml(recoveredRange)).to.equal('a')
  })
})

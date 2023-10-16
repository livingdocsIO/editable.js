import {expect} from 'chai'
import {createElement, createRange, rangeToHtml} from '../src/util/dom'
import * as rangeSaveRestore from '../src/range-save-restore'

describe('RangeSaveRestore', function () {

  beforeEach(function () {
    this.range = createRange()
  })

  it('saves a range', function () {
    // <div>|a|</div>
    const host = createElement('<div><div>a</div></div>').firstChild
    this.range.setStart(host, 0)
    this.range.setEnd(host, 1)
    rangeSaveRestore.save(this.range)
    expect(rangeToHtml(this.range)).to.equal('a')
    expect(host.childNodes[0].nodeName).to.equal('SPAN')
    expect(host.childNodes[1].nodeValue).to.equal('a')
    expect(host.childNodes[2].nodeName).to.equal('SPAN')
  })

  it('restores a range', function () {
    // <div>|a|</div>
    const host = createElement('<div><div>a</div></div>').firstChild
    this.range.setStart(host, 0)
    this.range.setEnd(host, 1)
    const savedRange = rangeSaveRestore.save(this.range)

    const recoveredRange = rangeSaveRestore.restore(host, savedRange)
    expect(host.innerHTML).to.equal('a')
    expect(rangeToHtml(recoveredRange)).to.equal('a')
  })

  it('handles a range in two adjacent elements', function () {
    // <div><em>|a</em><em>b|</em></div>
    const host = createElement('<div><em>a</em><em>b</em></div>')
    this.range.setStart(host.querySelector('em:nth-child(1)'), 0)
    this.range.setEnd(host.querySelector('em:nth-child(2)'), 1)
    const savedRange = rangeSaveRestore.save(this.range)

    expect(host.innerHTML)
      .to.equal(`<em><span id="${savedRange.startMarkerId}" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span>a</em><em>b<span id="${savedRange.endMarkerId}" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span></em>`)

    rangeSaveRestore.restore(host, savedRange)

    expect(host.innerHTML)
      .to.equal('<em>a</em><em>b</em>', 'after restore')
  })

  it('handles a range in text nodes of two adjacent elements', function () {
    // <div><em>|a</em><em>b|</em></div>
    const host = createElement('<div><em>a</em><em>b</em></div>')
    this.range.setStart(host.querySelector('em:nth-child(1)').firstChild, 0)
    this.range.setEnd(host.querySelector('em:nth-child(2)').firstChild, 1)
    const savedRange = rangeSaveRestore.save(this.range)

    // Note this triggers the special behavior of insertRangeBoundaryMarker where
    // the range is added outside the element instead of inside where the text node is
    // (compare with the previous test).
    expect(host.innerHTML)
      .to.equal(`<span id="editable-range-boundary-35" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span><em>a</em><em>b</em><span id="editable-range-boundary-34" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span>`)

    rangeSaveRestore.restore(host, savedRange)

    expect(host.innerHTML)
      .to.equal('<em>a</em><em>b</em>', 'after restore')
  })

  it('handles a range around two adjacent elements', function () {
    // <div>|<em>a</em><em>b</em>|</div>
    const host = createElement('<div><em>a</em><em>b</em></div>')
    this.range.setStart(host, 0)
    this.range.setEnd(host, 2)
    const savedRange = rangeSaveRestore.save(this.range)

    expect(host.innerHTML)
      .to.equal(`<span id="${savedRange.startMarkerId}" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span><em>a</em><em>b</em><span id="${savedRange.endMarkerId}" data-editable="remove" style="line-height: 0; display: none;">\ufeff</span>`)

    rangeSaveRestore.restore(host, savedRange)

    expect(host.innerHTML)
      .to.equal('<em>a</em><em>b</em>', 'after restore')
  })
})

import {expect} from 'chai'

import {Editable} from '../src/core'
import MonitoredHighlighting from '../src/monitored-highlighting'

describe('MonitoredHighlighting:', function () {

  beforeEach(function () {
    this.editable = new Editable()
  })

  afterEach(function () {
    this.editable?.unload()
  })

  it('creates an instance with a reference to editable', function () {
    const highlighting = new MonitoredHighlighting(this.editable, {})
    expect(highlighting.editable).to.equal(this.editable)
  })
})

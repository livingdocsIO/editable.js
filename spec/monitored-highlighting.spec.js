import {expect} from 'chai'

import {Editable} from '../src/core.js'
import MonitoredHighlighting from '../src/monitored-highlighting.js'

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

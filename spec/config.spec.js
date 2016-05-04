import $ from 'jquery'

import * as config from '../src/config'
import Editable from '../src/core'

describe('Editable configuration', () => {
  describe('instance configuration', () => {
    let editable

    afterEach(() => {
      if (editable) {
        editable.off()
        editable = undefined
      }
    })

    it('has default values', () => {
      editable = new Editable()
      expect(editable.config.defaultBehavior).toEqual(true)
    })

    it('does not include the global configuration', () => {
      editable = new Editable()
      expect(editable.config.editableClass).toEqual(undefined)
    })

    it('overrides the default values', () => {
      editable = new Editable({
        defaultBehavior: false
      })
      expect(editable.config.defaultBehavior).toEqual(false)
    })
  })

  describe('globalConfig()', () => {
    const originalConfig = $.extend({}, config)

    afterEach(() => {
      Editable.globalConfig(originalConfig)
    })

    it('has a default value for "editableClass"', () => {
      expect(config.editableClass).toEqual('js-editable')
    })

    it('overrides "editableClass"', () => {
      Editable.globalConfig({
        editableClass: 'editable-instance'
      })
      expect(config.editableClass).toEqual('editable-instance')
    })

    // Safety check for the test setup
    it('resets the default after each spec', () => {
      expect(config.editableClass).toEqual('js-editable')
    })
  })
})

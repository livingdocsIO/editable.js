import cloneDeep from 'lodash.clonedeep'
import config from '../src/config'
import Editable from '../src/core'

describe('Editable configuration', function () {

  describe('instance configuration', function () {
    let editable

    afterEach(function () {
      if (editable) {
        editable.off()
        editable = undefined
      }
    })

    it('has default values', function () {
      editable = new Editable()
      expect(editable.config.defaultBehavior).toEqual(true)
    })

    it('does not include the global configuration', function () {
      editable = new Editable()
      expect(editable.config.editableClass).toEqual(undefined)
    })

    it('overrides the default values', function () {
      editable = new Editable({
        defaultBehavior: false
      })
      expect(editable.config.defaultBehavior).toEqual(false)
    })
  })

  describe('globalConfig()', function () {
    const originalConfig = cloneDeep(config)

    beforeAll(function () {
      Editable.globalConfig(originalConfig)
    })

    afterEach(function () {
      Editable.globalConfig(originalConfig)
    })

    it('retreives the config', function () {
      expect(originalConfig).toEqual(Editable.getGlobalConfig())
    })

    it('retrieves the current state of the config', function () {
      Editable.globalConfig({editableClass: 'editable-instance'})
      expect(originalConfig).not.toEqual(Editable.getGlobalConfig())
    })

    it('has a default value for "editableClass"', function () {
      expect(Editable.getGlobalConfig().editableClass).toEqual('js-editable')
    })

    it('overrides "editableClass"', function () {
      Editable.globalConfig({editableClass: 'editable-instance'})
      expect(Editable.getGlobalConfig().editableClass).toEqual('editable-instance')
    })

    // Safety check for the test setup
    it('resets the default after each spec', function () {
      expect(Editable.getGlobalConfig().editableClass).toEqual('js-editable')
    })
  })
})

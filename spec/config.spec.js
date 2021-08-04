import {expect} from 'chai'
import cloneDeep from 'lodash-es/cloneDeep'
import config from '../src/config'
import {Editable} from '../src/core'

describe('Editable configuration', function () {

  describe('instance configuration', function () {
    let editable

    afterEach(function () {
      if (!editable) return
      editable.unload()
      editable = undefined
    })

    it('has default values', function () {
      editable = new Editable()
      expect(editable.config.defaultBehavior).to.equal(true)
    })

    it('does not include the global configuration', function () {
      editable = new Editable()
      expect(editable.config.editableClass).to.equal(undefined)
    })

    it('overrides the default values', function () {
      editable = new Editable({
        defaultBehavior: false
      })
      expect(editable.config.defaultBehavior).to.equal(false)
    })
  })

  describe('globalConfig()', function () {
    const originalConfig = cloneDeep(config)

    beforeEach(function () {
      Editable.globalConfig(originalConfig)
    })

    afterEach(function () {
      Editable.globalConfig(originalConfig)
    })

    it('retreives the config', function () {
      expect(originalConfig).to.deep.equal(Editable.getGlobalConfig())
    })

    it('retrieves the current state of the config', function () {
      Editable.globalConfig({editableClass: 'editable-instance'})
      expect(originalConfig).not.to.equal(Editable.getGlobalConfig())
    })

    it('has a default value for "editableClass"', function () {
      expect(Editable.getGlobalConfig().editableClass).to.equal('js-editable')
    })

    it('overrides "editableClass"', function () {
      Editable.globalConfig({editableClass: 'editable-instance'})
      expect(Editable.getGlobalConfig().editableClass).to.equal('editable-instance')
    })

    // Safety check for the test setup
    it('resets the default after each spec', function () {
      expect(Editable.getGlobalConfig().editableClass).to.equal('js-editable')
    })
  })
})

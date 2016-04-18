var $ = require('jquery');

var config = require('../src/config');
var Editable = require('../src/core');

describe('Editable configuration', function() {

  describe('instance configuration', function() {
    var editable;

    afterEach(function() {
      if (editable) {
        editable.off();
        editable = undefined;
      }
    });

    it('has default values', function() {
      editable = new Editable();
      expect(editable.config.defaultBehavior).toEqual(true);
    });

    it('does not include the global configuration', function(){
      editable = new Editable();
      expect(editable.config.editableClass).toEqual(undefined);
    });

    it('overrides the default values', function() {
      editable = new Editable({
        defaultBehavior: false
      });
      expect(editable.config.defaultBehavior).toEqual(false);
    });
  });


  describe('globalConfig()', function() {
    var originalConfig = $.extend({}, config);

    afterEach(function() {
      Editable.globalConfig(originalConfig);
    });

    it('has a default value for "editableClass"', function() {
      expect(config.editableClass).toEqual('js-editable');
    });

    it('overrides "editableClass"', function() {
      Editable.globalConfig({
        editableClass: 'editable-instance'
      });
      expect(config.editableClass).toEqual('editable-instance');
    });

    // Safety check for the test setup
    it('resets the default after each spec', function() {
      expect(config.editableClass).toEqual('js-editable');
    });
  });

});

var $ = require('jquery');
var rangy = require('rangy');

var RangeContainer = require('../src/range-container');

describe('RangeContainer', function() {

  describe('with no params', function() {

    beforeEach(function(){
      this.range = new RangeContainer();
    });

    it('has nothing selected', function(){
      expect(this.range.isAnythingSelected).toBe(false);
    });

    it('is no Cursor', function(){
      expect(this.range.isCursor).toBe(false);
    });

    it('is no Selection', function(){
      expect(this.range.isSelection).toBe(false);
    });

    describe('getCursor()', function(){

      it('returns undefined', function(){
        expect(this.range.getCursor()).toBe(undefined);
      });
    });

    describe('getSelection()', function(){

      it('returns undefined', function(){
        expect(this.range.getSelection()).toBe(undefined);
      });
    });

  });

  describe('with a selection', function() {

    beforeEach(function(){
      var elem = $('<div>Text</div>');
      var range = rangy.createRange();
      range.selectNodeContents(elem[0]);
      this.range = new RangeContainer(elem[0], range);
    });

    it('has something selected', function(){
      expect(this.range.isAnythingSelected).toBe(true);
    });

    it('is no Cursor', function(){
      expect(this.range.isCursor).toBe(false);
    });

    it('is a Selection', function(){
      expect(this.range.isSelection).toBe(true);
    });

    it('can force a cursor', function(){
      expect(this.range.host.innerHTML).toEqual('Text');

      var cursor = this.range.forceCursor();

      expect(cursor.isCursor).toBe(true);
      expect(this.range.host.innerHTML).toEqual('');
    });
  });

  describe('with a cursor', function() {

    beforeEach(function(){
      var elem = $('<div>Text</div>');
      var range = rangy.createRange();
      range.selectNodeContents(elem[0]);
      range.collapse(true);
      this.range = new RangeContainer(elem, range);
    });

    it('has something selected', function(){
      expect(this.range.isAnythingSelected).toBe(true);
    });

    it('is a Cursor', function(){
      expect(this.range.isCursor).toBe(true);
    });

    it('is no Selection', function(){
      expect(this.range.isSelection).toBe(false);
    });
  });

});

var Selection = require('../src/selection');
var Cursor = require('../src/cursor');

describe('Selection', function() {

  it('should be defined', function() {
    expect(Selection).toBeDefined();
  });


  describe('with a range', function(){

    beforeEach(function(){
      this.oneWord = $('<div>foobar</div>')[0];
      var range = rangy.createRange();
      range.selectNodeContents(this.oneWord);
      this.selection = new Selection(this.oneWord, range);
    });

    it('sets a reference to window', function() {
      expect(this.selection.win).toEqual(window);
    });

    it('sets #isSelection to true', function(){
      expect(this.selection.isSelection).toBe(true);
    });


    describe('isAllSelected()', function(){

      it('returns true if all is selected', function() {
        expect(this.selection.isAllSelected()).toEqual(true);
      });

      it('returns true if all is selected', function() {
        var textNode = this.oneWord.firstChild;
        var range = rangy.createRange();
        range.setStartBefore(textNode);
        range.setEnd(textNode, 6);
        var selection = new Selection(this.oneWord, range);
        expect(selection.isAllSelected()).toEqual(true);

        range = rangy.createRange();
        range.setStartBefore(textNode);
        range.setEnd(textNode, 5);
        selection = new Selection(this.oneWord, range);
        expect(selection.isAllSelected()).toEqual(false);
      });
    });
  });


  describe('inherits form Cursor', function(){

    it('has isAtEnd() method from Cursor in its protoype chain', function() {
      expect( Selection.prototype.hasOwnProperty('isAtEnd') ).toEqual(false);
      expect( Cursor.prototype.hasOwnProperty('isAtEnd') ).toEqual(true);
      expect( 'isAtEnd' in Selection.prototype ).toEqual(true);
    });
  });

});

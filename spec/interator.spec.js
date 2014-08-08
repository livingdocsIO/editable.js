describe('Iterator', function() {

  // Helper methods
  // --------------

  var callnTimes = function(object, methodName, count) {
    var returnValue;
    while (count--) {
      returnValue = object[methodName]()
    }
    return returnValue;
  };


  describe('constructor method', function() {

    beforeEach(function() {
      this.element = $('<div>a</div>')[0];
      this.iterator = new Iterator(this.element);
    });

    it('sets its properties', function() {
      expect(this.iterator.root).toEqual(this.element);
      expect(this.iterator.current).toEqual(this.element);
      expect(this.iterator.next).toEqual(this.element);
    });
  });


  describe('getNext()', function() {

    beforeEach(function() {
      this.element = $('<div>a</div>')[0];
      this.iterator = new Iterator(this.element);
    });

    it('returns the root on the first call', function() {
      var current = this.iterator.getNext();
      expect(current).toEqual(this.element);
    });

    it('returns the the first child on the second call', function() {
      var current = callnTimes(this.iterator, 'getNext', 2);
      expect(current).toEqual(this.element.firstChild);
    });

    it('returns undefined on the third call', function() {
      var current = callnTimes(this.iterator, 'getNext', 3);
      expect(current).toEqual(null);
    });

  });


  describe('replaceCurrent() after using highlightText.wrapPortion()', function() {

    it('replaces the text node', function() {
      this.element = $('<div>a</div>')[0];
      this.iterator = new Iterator(this.element);
      var current = callnTimes(this.iterator, 'getNext', 2);
      var replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      });

      this.iterator.replaceCurrent(replacement);
      expect(this.iterator.current).toEqual(replacement);
      expect(this.iterator.next).toEqual(null);
    });

    it('replaces the first character of longer a text node', function() {
      this.element = $('<div>word</div>')[0];
      this.iterator = new Iterator(this.element);
      var current = callnTimes(this.iterator, 'getNext', 2);
      var replacement = highlightText.wrapPortion({
        element: current,
        offset: 0,
        length: 1
      });

      this.iterator.replaceCurrent(replacement);
      current = this.iterator.getNext();
      expect(current.data).toEqual('ord');
    });

  });
});

  /** RangeContainer
   *
   * primarily used to compare ranges
   * its designed to work with undefined ranges as well
   * so we can easily compare them without checking for undefined
   * all the time
   */
  var RangeContainer = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
    this.isAnythingSelected = (rangyRange !== undefined);
    this.isCursor = (this.isAnythingSelected && rangyRange.collapsed);
    this.isSelection = (this.isAnythingSelected && !this.isCursor);
  };

  RangeContainer.prototype.getCursor = function() {
    if (this.isCursor) {
      return new Cursor(this.host, this.range);
    }
  };

  RangeContainer.prototype.getSelection = function() {
    if (this.isSelection) {
      return new Selection(this.host, this.range);
    }
  };

  RangeContainer.prototype.forceCursor = function() {
    if (this.isSelection) {
      var selection = this.getSelection();
      return selection.deleteContent();
    } else {
      return this.getCursor();
    }
  };

  RangeContainer.prototype.isDifferentFrom = function(otherRangeContainer) {
    otherRangeContainer = otherRangeContainer || new RangeContainer()
    var self = this.range;
    var other = otherRangeContainer.range;
    if (self && other) {
      return !self.equals(other);
    } else if (!self && !other) {
      return false;
    } else {
      return true;
    }
  };


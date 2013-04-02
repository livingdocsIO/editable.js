jQuery.fn.editable = function(add) {
  'use strict';

  if (add === undefined || add) {
    Editable.add(this);
  } else {
    Editable.remove(this);
  }

  return this;
};

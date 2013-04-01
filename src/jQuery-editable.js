jQuery.fn.editable = function (add) {
  if (add === undefined || add) {
    Editable.add(this);
  } else {
    Editable.remove(this);
  }

  return this;
};
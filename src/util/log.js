var log, error;

// Allows for safe console logging
// If the last param is the string "trace" console.trace will be called
// configuration: disable with config.log = false
log = function() {
  if (Editable.config.log === false) { return }

  var args, _ref;
  args = Array.prototype.slice.call(arguments);
  if (args.length) {
    if (args[args.length - 1] === "trace") {
      args.pop();
      if ((_ref = window.console) != null ? _ref.trace : void 0) {
        console.trace();
      }
    }
  }

  if (args.length === 1) {
    args = args[0];
  }

  if (window.console) {
    return console.log(args);
  }
};

// Allows for safe error logging
// Falls back to console.log if console.error is not available
// configuration: disable with config.log = false
error = function() {
  if (Editable.config.log === false) { return }

  var args;
  args = Array.prototype.slice.call(arguments);
  if (args.length === 1) {
    args = args[0];
  }

  if (window.console && typeof window.console.error === "function") {
    return console.error(args);
  } else if (window.console) {
    return console.log(args);
  }
};

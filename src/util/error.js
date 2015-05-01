var config = require('../config');

// Allows for safe error logging
// Falls back to console.log if console.error is not available
module.exports = function() {
  if (config.logErrors === false) { return; }

  var args;
  args = Array.prototype.slice.call(arguments);
  if (args.length === 1) {
    args = args[0];
  }

  if (window.console && typeof window.console.error === 'function') {
    return console.error(args);
  } else if (window.console) {
    return console.log(args);
  }
};

var config = require('../config')

// Allows for safe console logging
// If the last param is the string "trace" console.trace will be called
// configuration: disable with config.log = false
module.exports = function () {
  if (config.log === false) return

  var args, _ref
  args = Array.prototype.slice.call(arguments)
  if (args.length) {
    if (args[args.length - 1] === 'trace') {
      args.pop()
      if ((_ref = window.console) ? _ref.trace : void 0) {
        console.trace()
      }
    }
  }

  if (args.length === 1) {
    args = args[0]
  }

  if (window.console) {
    return console.log(args)
  }
}

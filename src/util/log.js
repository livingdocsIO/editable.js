import * as config from '../config'

// Allows for safe console logging
// If the last param is the string "trace" console.trace will be called
// configuration: disable with config.log = false
export default function log () {
  if (config.log === false) return

  if (!global.console) return

  const args = arguments.length === 1 ? arguments[0] : Array.from(arguments)

  if (arguments.length !== 1 && args[args.length - 1] === 'trace') {
    args.pop()
    if (console.trace) console.trace()
  }

  return console.log(args)
}

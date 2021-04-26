import config from '../config'

// Allows for safe error logging
// Falls back to console.log if console.error is not available
export default function error () {
  if (config.logErrors === false) return

  const args = arguments.length === 1 ? arguments[0] : Array.from(arguments)

  if (!global.console) return

  if (typeof console.error === 'function') return console.error(args)

  console.log(args)
}

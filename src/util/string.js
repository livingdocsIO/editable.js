const toString = Object.prototype.toString
const htmlCharacters = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

// TODO: replace with lodash methods
export function trimRight (text) {
  return text.replace(/\s+$/, '')
}

export function trimLeft (text) {
  return text.replace(/^\s+/, '')
}

export function trim (text) {
  return text.replace(/^\s+|\s+$/g, '')
}

export function isString (obj) {
  return toString.call(obj) === '[object String]'
}

/**
 * Turn any string into a regular expression.
 * This can be used to search or replace a string conveniently.
 */

export function regexp (str, flags) {
  if (!flags) flags = 'g'
  const escapedStr = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  return new RegExp(escapedStr, flags)
}

/**
 * Escape HTML characters <, > and &
 * Usage: escapeHtml('<div>')
 *
 * @param { String }
 * @param { Boolean } Optional. If true " and ' will also be escaped.
 * @return { String } Escaped Html you can assign to innerHTML of an element.
 */

// TODO: replace with npm.im/he

export function escapeHtml (s, forAttribute) {
  return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function (c) { // "'
    return htmlCharacters[c]
  })
}

/**
 * Escape a string the browser way.
 */

export function browserEscapeHtml (str) {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(str))
  return div.innerHTML
}

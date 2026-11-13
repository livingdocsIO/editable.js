const toString = Object.prototype.toString
const htmlCharacters = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

// Zero width spaces (U+200B, U+FEFF). Editable inserts the no-break one, so the cursor
// can be shown in an empty editable and on an empty line after a <br>.
const internalCharacters = /[\uFEFF\u200B]/g

// Control characters, except tab, line feed and carriage return. The Livingdocs server
// deletes the same set when it saves a document (lib/db/query.js). If the editor kept
// them, the saved document would differ from the editor's copy, which shows as an
// editing conflict.
// eslint-disable-next-line no-control-regex
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

// The characters the cleanup removes from the content
export const removedCharacters = new RegExp(`${internalCharacters.source}|${controlCharacters.source}`, 'g')

export function removeControlCharacters (text) {
  return text.replace(controlCharacters, '')
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

export function replaceLast (text, searchValue, replaceValue) {
  if (!text) return ''
  text = `${text}`
  if (!searchValue || replaceValue == null) return text
  const lastOccurrenceIndex = text.lastIndexOf(searchValue)
  if (lastOccurrenceIndex === -1) return text
  return `${
    text.slice(0, lastOccurrenceIndex)
  }${
    replaceValue
  }${
    text.slice(lastOccurrenceIndex + searchValue.length)
  }`
}

export function endsWithSingleSpace (text) {
  return /\S+\s{1}$/.test(text)
}

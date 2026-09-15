import {trimEnd, trimStart, trim as lodashTrim, isString as lodashIsString} from 'lodash-es'

const htmlCharacters = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function trimRight (text) {
  return trimEnd(text)
}

export function trimLeft (text) {
  return trimStart(text)
}

export function trim (text) {
  return lodashTrim(text)
}

export function isString (obj) {
  return lodashIsString(obj)
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
  return /(?:[^\s]|^)\s$/.test(text)
}

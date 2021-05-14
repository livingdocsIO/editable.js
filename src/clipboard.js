import $ from 'jquery'

import config from './config'
import * as string from './util/string'
import * as nodeType from './node-type'

let allowedElements, requiredAttributes, transformElements, blockLevelElements, replaceQuotes
let splitIntoBlocks, blacklistedElements
const whitespaceOnly = /^\s*$/
const blockPlaceholder = '<!-- BLOCK -->'
let keepInternalRelativeLinks
const doubleQuotePairs = [
  ['«', '»'], // ch german, french
  ['»', '«'], // danish
  ['"', '"'], // danish, not specified
  ['“', '”'], // english US
  ['”', '”'], // swedish
  ['“', '“'], // chinese simplified
  ['„', '“'] // german
]
const quotesRegex = /(["'«»„“])(?![^<]*?>)/g

updateConfig(config)
export function updateConfig (conf) {
  const rules = conf.pastedHtmlRules
  allowedElements = rules.allowedElements || {}
  requiredAttributes = rules.requiredAttributes || {}
  transformElements = rules.transformElements || {}
  blacklistedElements = rules.blacklistedElements || []
  keepInternalRelativeLinks = rules.keepInternalRelativeLinks || false
  replaceQuotes = rules.replaceQuotes || {}

  blockLevelElements = {}
  rules.blockLevelElements.forEach((name) => { blockLevelElements[name] = true })
  splitIntoBlocks = {}
  rules.splitIntoBlocks.forEach((name) => { splitIntoBlocks[name] = true })
}

export function paste (element, cursor, callback) {
  const document = element.ownerDocument
  element.setAttribute(config.pastingAttribute, true)

  if (cursor.isSelection) cursor = cursor.deleteContent()

  // Create a placeholder and set the focus to the pasteholder
  // to redirect the browser pasting into the pasteholder.
  cursor.save()
  const pasteHolder = injectPasteholder(document)
  pasteHolder.focus()

  // Use a timeout to give the browser some time to paste the content.
  // After that grab the pasted content, filter it and restore the focus.
  setTimeout(() => {
    const blocks = parseContent(pasteHolder)
    $(pasteHolder).remove()
    element.removeAttribute(config.pastingAttribute)
    cursor.restore()
    callback(blocks, cursor)
  }, 0)
}

export function injectPasteholder (document) {
  const pasteHolder = $('<div>')
    .attr('contenteditable', true)
    .css({
      position: 'fixed',
      right: '5px',
      top: '50%',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      outline: 'none'
    })

  $(document.body).append(pasteHolder)
  return pasteHolder.get(0)
}

/**
 * - Parse pasted content
 * - Split it up into blocks
 * - clean and normalize every block
 * - optionally strip the host location an anchorTag-href
 *   www.livindocs.io/internalLink -> /internalLink
 *
 * @param {DOM node} A container where the pasted content is located.
 * @returns {Array of Strings} An array of cleaned innerHTML like strings.
 */
export function parseContent (element) {
  // Filter pasted content
  return filterHtmlElements(element)
  // Handle Blocks
    .split(blockPlaceholder)
    .map((entry) => string.trim(cleanWhitespace(replaceAllQuotes(entry))))
    .filter((entry) => !whitespaceOnly.test(entry))
}

export function filterHtmlElements (elem) {
  return Array.from(elem.childNodes).reduce((content, child) => {
    if (blacklistedElements.indexOf(child.nodeName.toLowerCase()) !== -1) {
      return ''
    }

    // Keep internal relative links relative (on paste).
    if (keepInternalRelativeLinks && child.nodeName === 'A' && child.href) {
      const stripInternalHost = child.getAttribute('href').replace(window.location.origin, '')
      child.setAttribute('href', stripInternalHost)
    }

    if (child.nodeType === nodeType.elementNode) {
      const childContent = filterHtmlElements(child)
      return content + conditionalNodeWrap(child, childContent)
    }

    // Escape HTML characters <, > and &
    if (child.nodeType === nodeType.textNode) return content + string.escapeHtml(child.nodeValue)
    return content
  }, '')
}

export function conditionalNodeWrap (child, content) {
  let nodeName = child.nodeName.toLowerCase()
  nodeName = transformNodeName(nodeName)

  if (shouldKeepNode(nodeName, child)) {
    const attributes = filterAttributes(nodeName, child)

    if (nodeName === 'br') return `<${nodeName + attributes}>`

    if (!whitespaceOnly.test(content)) {
      return `<${nodeName + attributes}>${content}</${nodeName}>`
    }

    return content
  }

  if (splitIntoBlocks[nodeName]) {
    return blockPlaceholder + content + blockPlaceholder
  }

  // prevent missing whitespace between text when block-level
  // elements are removed.
  if (blockLevelElements[nodeName]) return `${content} `

  return content
}

// returns string of concatenated attributes e.g. 'target="_blank" rel="nofollow" href="/test.com"'
export function filterAttributes (nodeName, node) {
  return Array.from(node.attributes).reduce((attributes, {name, value}) => {
    if (allowedElements[nodeName][name] && value) {
      return `${attributes} ${name}="${value}"`
    }
    return attributes
  }, '')
}

export function transformNodeName (nodeName) {
  return transformElements[nodeName] || nodeName
}

export function hasRequiredAttributes (nodeName, node) {
  const requiredAttrs = requiredAttributes[nodeName]
  if (!requiredAttrs) return true

  return !requiredAttrs.some((name) => !node.getAttribute(name))
}

export function shouldKeepNode (nodeName, node) {
  return allowedElements[nodeName] && hasRequiredAttributes(nodeName, node)
}

export function cleanWhitespace (str) {
  return str
    .replace(/\n/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/(.)\u00A0/g, (match, group) => group + (/[\u0020]/.test(group)
      ? '\u00A0'
      : ' '
    ))
}

export function replaceAllQuotes (str) {
  const quotes = getAllQuotes(str)
  if (quotes && quotes.length > 0) {
    const replacementQuotes = getReplacementArray(quotes, 0)
    return replaceExistingQuotes(str, replacementQuotes)
  }
  return str
}

function getReplacementArray (quotes, position) {
  const quotesArray = []
  if (quotes.length === 1) {
    return quotes
  }

  while (position < quotes.length) {
    const closingTagPosition = findClosingQuote(quotes, position)
    let nestedArray = []

    if (closingTagPosition !== position + 1 && closingTagPosition !== -1 && closingTagPosition !== undefined) {
      const nestedquotes = quotes.slice(position + 1, closingTagPosition)
      if (nestedquotes) {
        nestedArray = getReplacementArray(nestedquotes, 0)
      }
    }
    if (closingTagPosition) {
      position = closingTagPosition + 1
    }
    if (closingTagPosition === undefined || closingTagPosition === -1) {
      quotesArray.push(quotes[position])
      position++
    } else {
      quotesArray.push(...[replaceQuotes.quotes[0], ...nestedArray, replaceQuotes.quotes[1]])
    }
  }

  return quotesArray
}

function findClosingQuote (quotes, position) {
  const openingQuote = quotes[position]
  for (let i = position + 1; i < quotes.length; i++) {
    const isIncluded = getPossibleClosingQuotes(openingQuote).includes(quotes[i])
    if (isIncluded) {
      return i
    }
  }
}

function getPossibleClosingQuotes (openingQuote) {
  return doubleQuotePairs.filter(quotePair => quotePair[0] === openingQuote).map((quotePair) => quotePair[1])
}

function getAllQuotes (str) {
  return str.match(quotesRegex)
}

function replaceExistingQuotes (str, replacementQuotes) {
  let index = 0
  return str.replace(quotesRegex, (match) => {
    const replacement = replacementQuotes[index]
    index++
    return replacement
  })
}

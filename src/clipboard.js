import config from './config'
import * as string from './util/string'
import * as nodeType from './node-type'
import * as quotes from './quotes'

let allowedElements, requiredAttributes, transformElements, blockLevelElements, replaceQuotes
let splitIntoBlocks, blacklistedElements
const whitespaceOnly = /^\s*$/
const blockPlaceholder = '<!-- BLOCK -->'
let keepInternalRelativeLinks

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

export function paste (element, cursor, clipboardContent, callback) {
  const document = element.ownerDocument
  element.setAttribute(config.pastingAttribute, true)

  if (cursor.isSelection) cursor = cursor.deleteContent()

  // Create a placeholder to help parse HTML
  const pasteHolder = document.createElement('div')
  pasteHolder.innerHTML = clipboardContent

  const blocks = parseContent(pasteHolder)

  element.removeAttribute(config.pastingAttribute)
  callback(blocks, cursor)
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
  if (replaceQuotes.quotes || replaceQuotes.singleQuotes || replaceQuotes.apostrophe) {
    return quotes.replaceAllQuotes(str, replaceQuotes)
  }

  return str
}

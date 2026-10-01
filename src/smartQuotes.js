import * as nodeType from './node-type.js'
import NodeIterator from './node-iterator.js'

const isDoubleQuote = (char) => /^[«»"“”„]$/.test(char)
const isSingleQuote = (char) => /^[‘’‹›‚']$/.test(char)
const isApostrophe = (char) => /^[’']$/.test(char)
const isLetter = (char) => /^\p{L}$/u.test(char)
const isDigit = (char) => /^\p{N}$/u.test(char)

const isAtWordStart = (charBefore) => !charBefore || /^[\s([{/\-–—]$/.test(charBefore)
const isAtWordEnd = (charAfter) => !isLetter(charAfter) && !isDigit(charAfter)

const isSingleQuoteOpen = (text, index, openingQuote) =>
  [...text.slice(0, index)].findLast((char) => isSingleQuote(char) && !isApostrophe(char)) === openingQuote

// The rules for a typed character, in order. The first rule that matches
// writes its character at `writeAt`. An empty character leaves the text alone.
const rules = [
  {
    // ‹geht› + s → ‹geht’s
    when: (c) => isLetter(c.typed) && c.before === c.singleQuotes[1] && isLetter(c.beforeBefore) && c.apostrophe !== c.singleQuotes[1],
    write: (c) => c.apostrophe,
    writeAt: 'before'
  },
  {
    // Er sagte: ' → Er sagte: ‹
    // «' → «‹
    when: (c) => isSingleQuote(c.typed) && (isAtWordStart(c.before) || isDoubleQuote(c.before)),
    write: (c) => c.singleQuotes[0],
    writeAt: 'typed'
  },
  {
    // ‹geht + ' → ‹geht›
    when: (c) => isSingleQuote(c.typed) && !isAtWordStart(c.before) && isAtWordEnd(c.after) && isSingleQuoteOpen(c.text, c.index, c.singleQuotes[0]),
    write: (c) => c.singleQuotes[1],
    writeAt: 'typed'
  },
  {
    // Hans + ' → Hans’
    // geht + ' + s → geht’s (e.g. when correcting an existing word)
    when: (c) => isSingleQuote(c.typed) && !isAtWordStart(c.before),
    write: (c) => c.apostrophe,
    writeAt: 'typed'
  },
  {
    // Er sagte: " → Er sagte: «
    when: (c) => isDoubleQuote(c.typed) && isAtWordStart(c.before),
    write: (c) => c.quotes[0],
    writeAt: 'typed'
  },
  {
    // «Tor + " → «Tor»
    when: (c) => isDoubleQuote(c.typed) && !isAtWordStart(c.before),
    write: (c) => c.quotes[1],
    writeAt: 'typed'
  }
]

// Returns the index and the character to write for the character typed
// before `offset`, or undefined if the text should be left alone.
const getReplacement = (text, offset, {quotes, singleQuotes, apostrophe}) => {
  const index = offset - 1
  const context = {
    quotes,
    singleQuotes,
    apostrophe,
    text,
    index,
    typed: text[index],
    before: text[index - 1],
    beforeBefore: text[index - 2],
    after: text[index + 1]
  }
  const rule = rules.find((r) => r.when(context))
  const char = rule?.write(context)
  if (!char) return
  return {index: rule.writeAt === 'before' ? index - 1 : index, char}
}

// Reads the text of the host, so the rules also see the text in a link
// or in bold text. A <br> reads as a line break.
const readText = (host) => {
  let text = ''
  const nodes = []
  for (const node of new NodeIterator(host)) {
    if (node.nodeType !== nodeType.textNode && node.nodeName !== 'BR') continue
    nodes.push({node, start: text.length})
    text += node.nodeValue ?? '\n'
  }
  return {text, nodes}
}

// Returns the cursor offset in the text of the host,
// or undefined if the cursor is not in a text node of the host
const getCursorOffset = (nodes, {startContainer, startOffset}) => {
  if (startContainer.nodeType !== nodeType.textNode) return
  const cursorNode = nodes.find(({node}) => node === startContainer)
  if (cursorNode) return cursorNode.start + startOffset
}

// Inserts and deletes instead of replacing, so a highlight that ends
// right after the character keeps its end
const replaceChar = (nodes, index, char) => {
  const {node, start} = nodes.findLast((n) => n.start <= index)
  const offset = index - start
  node.insertData(offset, char)
  node.deleteData(offset + char.length, 1)
}

export const applySmartQuotes = (host, range, config, char) => {
  const {quotes, singleQuotes, apostrophe} = config
  if ([...quotes, ...singleQuotes, apostrophe].includes(char)) return
  if (!isSingleQuote(char) && !isDoubleQuote(char) && !(apostrophe && isLetter(char))) return

  const {text, nodes} = readText(host)
  const offset = getCursorOffset(nodes, range)

  // The typed character can be gone by now, e.g. when it was deleted right away
  if (offset === undefined || text[offset - 1] !== char) return

  const replacement = getReplacement(text, offset, config)
  if (replacement) replaceChar(nodes, replacement.index, replacement.char)
}

const isValidQuotePairConfig = (quotePair) => Array.isArray(quotePair) && quotePair.length === 2

export const shouldApplySmartQuotes = (config, target) => {
  const {smartQuotes, quotes, singleQuotes} = config
  return !!smartQuotes && isValidQuotePairConfig(quotes) && isValidQuotePairConfig(singleQuotes) && target.isContentEditable
}

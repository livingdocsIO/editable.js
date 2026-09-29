const isValidQuotePairConfig = (quotePair) => Array.isArray(quotePair) && quotePair.length === 2

export const shouldApplySmartQuotes = (config, target) => {
  const {smartQuotes, quotes, singleQuotes} = config
  return !!smartQuotes && isValidQuotePairConfig(quotes) && isValidQuotePairConfig(singleQuotes) && target.isContentEditable
}

export const isDoubleQuote = (char) => /^[«»"“”„]$/.test(char)
export const isSingleQuote = (char) => /^[‘’‹›‚']$/.test(char)
export const isApostrophe = (char) => /^[’']$/.test(char)
export const isWhitespace = (char) => /^\s$/.test(char)
export const isSeparatorOrWhitespace = (char) => /\s|[>\-–—]/.test(char)

const isAtWordStart = (text, indexCharBefore) => indexCharBefore < 0 || isSeparatorOrWhitespace(text[indexCharBefore])
const isInWord = (text, indexCharBefore) => !!text[indexCharBefore] && !isSeparatorOrWhitespace(text[indexCharBefore])
const hasCharAfter = (textArr, indexCharAfter) => !!textArr[indexCharAfter] && !isWhitespace(textArr[indexCharAfter])
const shouldBeSingleOpeningQuote = (text, indexCharBefore) => !!text[indexCharBefore] && isDoubleQuote(text[indexCharBefore])

const replaceQuote = (range, index, quoteType) => {
  const {startContainer} = range
  if (!startContainer.nodeValue) {
    return false
  }
  startContainer.insertData(index, quoteType)
  startContainer.deleteData(index + quoteType.length, 1)
  return true
}

const hasSingleOpeningQuote = (textArr, offset, singleOpeningQuote) => {
  if (offset <= 0) {
    return false
  }
  for (let i = offset - 1; i >= 0; i--) {
    if (isSingleQuote(textArr[i]) && (!isApostrophe(singleOpeningQuote) && !isApostrophe(textArr[i]))) {
      return textArr[i] === singleOpeningQuote
    }
  }
  return false
}

// Returns the quote to write in place of the typed one, or undefined if the
// typed character should be left alone.
const getQuote = (textArr, offset, isCharSingleQuote, {quotes, singleQuotes, apostrophe}) => {
  // Special case for a single quote following a double quote,
  // which should be transformed into a single opening quote
  if (isCharSingleQuote && shouldBeSingleOpeningQuote(textArr, offset - 2)) {
    return singleQuotes[0]
  }

  if (isInWord(textArr, offset - 2)) {
    if (isCharSingleQuote) {
      // An open single quote has precedence over the apostrophe,
      // unless a character follows, e.g. when correcting an existing word
      if (!hasCharAfter(textArr, offset) && hasSingleOpeningQuote(textArr, offset, singleQuotes[0])) {
        return singleQuotes[1]
      }
      // An empty or missing apostrophe config leaves the typed character alone
      return apostrophe || undefined
    }
    return quotes[1]
  }

  if (isAtWordStart(textArr, offset - 2)) {
    return isCharSingleQuote ? singleQuotes[0] : quotes[0]
  }
}

export const applySmartQuotes = (range, config, char, target, cursorOffset) => {
  const isCharSingleQuote = isSingleQuote(char)
  const isCharDoubleQuote = isDoubleQuote(char)

  if (!isCharDoubleQuote && !isCharSingleQuote) {
    return
  }

  const {quotes, singleQuotes, apostrophe} = config
  if (char === quotes[0] || char === quotes[1] || char === singleQuotes[0] || char === singleQuotes[1] || char === apostrophe) {
    return
  }

  const offset = range.startOffset
  const textArr = [...range.startContainer.textContent]

  const quote = getQuote(textArr, offset, isCharSingleQuote, config)
  if (!quote) {
    return
  }

  if (!replaceQuote(range, offset - 1, quote)) {
    return
  }

  // Resets the cursor to the currentPosition after applying the smart-quote
  const window = target.ownerDocument.defaultView
  const selection = window.getSelection()
  selection.collapse(range.startContainer, cursorOffset ?? offset)
}


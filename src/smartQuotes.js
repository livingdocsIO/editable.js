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

const shouldBeOpeningQuote = (text, indexCharBefore) => indexCharBefore < 0 || isSeparatorOrWhitespace(text[indexCharBefore])
const shouldBeClosingQuote = (text, indexCharBefore) => !!text[indexCharBefore] && !isSeparatorOrWhitespace(text[indexCharBefore])
const hasCharAfter = (textArr, indexCharAfter) => !!textArr[indexCharAfter] && !isWhitespace(textArr[indexCharAfter])
const shouldBeSingleOpeningQuote = (text, indexCharBefore) => !!text[indexCharBefore] && isDoubleQuote(text[indexCharBefore])

export const replaceQuote = (range, index, quoteType) => {
  const startContainer = range?.startContainer
  const nodeValue = startContainer?.nodeValue
  if (!nodeValue) {
    return false
  }
  const at = Math.min(index, nodeValue.length)
  startContainer.insertData(at, quoteType)
  startContainer.deleteData(at + quoteType.length, 1)
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
const getQuote = (textArr, offset, isCharSingleQuote, {quotes, singleQuotes}) => {
  // Special case for a single quote following a double quote,
  // which should be transformed into a single opening quote
  if (isCharSingleQuote && shouldBeSingleOpeningQuote(textArr, offset - 2)) {
    return singleQuotes[0]
  }

  if (shouldBeClosingQuote(textArr, offset - 2)) {
    if (isCharSingleQuote) {
      // Don't transform apostrophes
      if (hasCharAfter(textArr, offset)) {
        return
      }
      // Don't transform single-quote if there is no respective single-opening-quote
      if (!hasSingleOpeningQuote(textArr, offset, singleQuotes[0])) {
        return
      }
      return singleQuotes[1]
    }
    return quotes[1]
  }

  if (shouldBeOpeningQuote(textArr, offset - 2)) {
    return isCharSingleQuote ? singleQuotes[0] : quotes[0]
  }
}

export const applySmartQuotes = (range, config, char, target, cursorOffset) => {
  const isCharSingleQuote = isSingleQuote(char)
  const isCharDoubleQuote = isDoubleQuote(char)

  if (!isCharDoubleQuote && !isCharSingleQuote) {
    return
  }

  const {quotes, singleQuotes} = config
  if (char === quotes[0] || char === quotes[1] || char === singleQuotes[0] || char === singleQuotes[1]) {
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


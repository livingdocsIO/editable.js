const isValidQuotePairConfig = (quotePair) => Array.isArray(quotePair) && quotePair.length === 2

export const shouldApplySmartQuotes = (config, target) => {
  const {smartQuotes, quotes, singleQuotes} = config
  return !!smartQuotes && isValidQuotePairConfig(quotes) && isValidQuotePairConfig(singleQuotes) && target.isContentEditable
}

// export const isQuote = (char) => /^[‘’‹›‚'«»"“”„]$/.test(char)
const isDoubleQuote = (char) => /^[«»"“”„]$/.test(char)
const isSingleQuote = (char) => /^[‘’‹›‚']$/.test(char)

// Test: '>', ' ', no space & all kinds of dashes dash
const isOpeningQuote = (text, indexCharBefore) => indexCharBefore < 0 || /\s|[>\-–—]/.test(text[indexCharBefore])
const isClosingQuote = (text, indexCharBefore) => text[indexCharBefore] !== ' '

const applySmartQuote = (textArr, index, target, quoteType) => {
  if (index >= 0 && index < textArr.length) {
    textArr[index] = quoteType
    target.innerText = textArr.join('')
  }
}

export const applySmartQuotes = (config, char, wholeText, offset, target, resetCursor) => {
  const isCharSingleQuote = isSingleQuote(char)
  const isCharDoubleQuote = isDoubleQuote(char)

  if (!isCharDoubleQuote && !isCharSingleQuote) {
    return
  }

  const {quotes, singleQuotes} = config
  if (isClosingQuote(wholeText, offset - 2)) {
    const closingQuote = isCharSingleQuote ? singleQuotes[1] : quotes[1]
    applySmartQuote(wholeText, offset - 1, target, closingQuote)
  }

  if (isOpeningQuote(wholeText, offset - 2)) {
    const openingQuote = isCharSingleQuote ? singleQuotes[0] : quotes[0]
    applySmartQuote(wholeText, offset - 1, target, openingQuote)
  }

  resetCursor()
}

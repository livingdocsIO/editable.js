const isValidQuotePairConfig = (quotePair) => Array.isArray(quotePair) && quotePair.length === 2

export const shouldApplySmartQuotes = (config) => {
  const {smartQuotes, quotes, singleQuotes} = config
  return !!smartQuotes && isValidQuotePairConfig(quotes) && isValidQuotePairConfig(singleQuotes)
}

export const isQuote = (char) => /^[‘’‹›‚'«»"“”„]$/.test(char)
export const isDoubleQuote = (char) => /^[«»"“”„]$/.test(char)
export const isSingleQuote = (char) => /^[‘’‹›‚']$/.test(char)

// Test: '>', ' ', no space & all kinds of dashes dash
export const isOpeningQuote = (text, indexCharBefore) => indexCharBefore < 0 || /\s|[>\-–—]/.test(text[indexCharBefore])

export const isClosingQuote = (text, indexCharBefore) => text[indexCharBefore] !== ' '

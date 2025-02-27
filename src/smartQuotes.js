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

export const replaceQuote = (range, index, quoteType) => {
  const startContainer = range?.startContainer
  const nodeValue = startContainer?.nodeValue
  if (!nodeValue) {
    return null
  }
  const newText = `${nodeValue.substring(0, index)}${quoteType}${nodeValue.substring(index + 1)}`
  const newTextNode = document.createTextNode(newText)
  startContainer.replaceWith(newTextNode)
  return newTextNode
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
  let newTextNode

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
    }
    const closingQuote = isCharSingleQuote ? singleQuotes[1] : quotes[1]
    newTextNode = replaceQuote(range, offset - 1, closingQuote)
  } else if (shouldBeOpeningQuote(textArr, offset - 2)) {
    const openingQuote = isCharSingleQuote ? singleQuotes[0] : quotes[0]
    newTextNode = replaceQuote(range, offset - 1, openingQuote)
  }

  if (!newTextNode) {
    return
  }

  // Resets the cursor to the currentPosition after applying the smart-quote
  const window = target.ownerDocument.defaultView
  const selection = window.getSelection()
  selection.collapse(newTextNode, cursorOffset ?? offset)
}


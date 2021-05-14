const doubleQuotePairs = [
  ['«', '»'], // ch german, french
  ['»', '«'], // danish
  ['"', '"'], // danish, not specified
  ['“', '”'], // english US
  ['”', '”'], // swedish
  ['“', '“'], // chinese simplified
  ['„', '“'] // german
]
const singleQuotePairs = [
  ['‘', '’'], // english UK
  ['‹', '›'], // ch german, french
  ['‚', '‘'], // german
  ['’', '’'], // swedish
  ['›', '‹'], // danish
  [`'`, `'`], // danish, not specified
  [`‘`, `’`] // chinese simplified
]

const apostrophe = [
  '’', // german
  `'` // default
]
const quotesRegex = /([‘’‹›‚'«»"“”„])(?![^<]*?>)/g
let replaceQuotes

export function replaceAllQuotes (str, replaceQuotesRules) {
  replaceQuotes = replaceQuotesRules
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
    const replacedQuote = replaceApostrophe(quotes[0])
    return [replacedQuote]
  }

  while (position < quotes.length) {
    const closingTag = findClosingQuote(quotes, position)
    let nestedArray = []

    if (closingTag !== undefined && closingTag.position !== position + 1 && closingTag.position !== -1) {
      const nestedquotes = quotes.slice(position + 1, closingTag.position)
      if (nestedquotes) {
        nestedArray = getReplacementArray(nestedquotes, 0)
      }
    }

    if (closingTag === undefined || closingTag.position === -1) {
      const replacedQuote = replaceApostrophe(quotes[position])
      quotesArray.push(replacedQuote)
      position++
    } else {
      position = closingTag.position + 1
      if (closingTag.type === 'double') {
        quotesArray.push(...[replaceQuotes.quotes[0], ...nestedArray, replaceQuotes.quotes[1]])
      }
      if (closingTag.type === 'single') {
        quotesArray.push(...[replaceQuotes.singleQuotes[0], ...nestedArray, replaceQuotes.singleQuotes[1]])
      }
    }
  }

  return quotesArray
}

function findClosingQuote (quotes, position) {
  const openingQuote = quotes[position]
  const possibleClosingSingleQuotes = getPossibleClosingQuotes(openingQuote, singleQuotePairs)
  const possibleClosingDoubleQuotes = getPossibleClosingQuotes(openingQuote, doubleQuotePairs)
  for (let i = position + 1; i < quotes.length; i++) {
    if (possibleClosingSingleQuotes.includes(quotes[i])) {
      return {position: i, type: 'single'}
    }
    if (possibleClosingDoubleQuotes.includes(quotes[i])) {
      return {position: i, type: 'double'}
    }
  }
}

function getPossibleClosingQuotes (openingQuote, pairs) {
  return pairs.filter(quotePair => quotePair[0] === openingQuote).map((quotePair) => quotePair[1])
}

function replaceApostrophe (quote) {
  if (apostrophe.includes(quote)) {
    return replaceQuotes.apostrophe
  }

  return quote
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

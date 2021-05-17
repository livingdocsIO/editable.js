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
// whitespace end of tag, or any dash (normal, en or em-dash)
// or any opening double quote
const beforeOpeningQuote = /\s|[>\-–—«»”"“„]/

// whitespace begin of tag, or any dash (normal, en or em-dash)
// or any closing quote, or any punctuation
const afterClosingQuote = /\s|[<\-–—«»”"“‘’‹›'.;?:,]/
let replacements

export function replaceAllQuotes (str, replaceQuotesRules) {
  replacements = replaceQuotesRules || {}
  replacements.quotes = replacements.quotes || [undefined, undefined]
  replacements.singleQuotes = replacements.singleQuotes || [undefined, undefined]

  const matches = getAllQuotes(str)
  if (matches.length > 0) {
    replaceMatchedQuotes(matches, 0)
    return replaceExistingQuotes(str, matches)
  }

  return str
}

function replaceMatchedQuotes (matches, position) {

  while (position < matches.length) {
    const closingTag = findClosingQuote(matches, position)

    if (closingTag) {
      matches[position].replace = closingTag.type === 'double'
        ? replacements.quotes[0]
        : replacements.singleQuotes[0]

      matches[closingTag.position].replace = closingTag.type === 'double'
        ? replacements.quotes[1]
        : replacements.singleQuotes[1]

      if (closingTag.position !== position + 1) {
        const nestedMatches = matches.slice(position + 1, closingTag.position)
        if (nestedMatches) {
          replaceMatchedQuotes(nestedMatches, 0)
        }
      }

      position = closingTag.position + 1
    } else {
      matches[position].replace = replaceApostrophe(matches[position].char)
      position += 1
    }
  }
}

function findClosingQuote (matches, position) {
  if (position === matches.length - 1) return
  const current = matches[position]
  const openingQuote = current.char

  if (current.before && !beforeOpeningQuote.test(current.before)) return

  const possibleClosingSingleQuotes = getPossibleClosingQuotes(openingQuote, singleQuotePairs)
  const possibleClosingDoubleQuotes = getPossibleClosingQuotes(openingQuote, doubleQuotePairs)
  for (let i = position + 1; i < matches.length; i++) {
    if ((matches[i].after && afterClosingQuote.test(matches[i].after)) || !matches[i].after) {
      if (possibleClosingSingleQuotes.includes(matches[i].char)) {
        return {position: i, type: 'single'}
      }
      if (possibleClosingDoubleQuotes.includes(matches[i].char)) {
        return {position: i, type: 'double'}
      }
    }
  }
}

function getPossibleClosingQuotes (openingQuote, pairs) {
  return pairs.filter(quotePair => quotePair[0] === openingQuote).map((quotePair) => quotePair[1])
}

function replaceApostrophe (quote) {
  if (apostrophe.includes(quote)) {
    return replacements.apostrophe
  }
}

function getAllQuotes (str) {
  return [...str.matchAll(quotesRegex)].map((match) => {
    const index = match.index
    return {
      char: match[1],
      before: index > 0 ? str[index - 1] : '',
      after: (index + 1) < str.length ? str[index + 1] : ''
    }
  })
}

function replaceExistingQuotes (str, matches) {
  let index = 0
  return str.replace(quotesRegex, (match) => {
    const replacement = matches[index].replace || matches[index].char
    index += 1
    return replacement
  })
}

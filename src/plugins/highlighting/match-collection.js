export default class MatchCollection {

  constructor () {
    this.matches = []
  }

  addMatches (name, matches) {
    if (!matches) return

    this.matches = mergeMatches(this.matches, matches)
  }

}

// Private Helpers
// ---------------

function mergeMatches (matches1, matches2) {
  let next
  const length1 = matches1.length
  const length2 = matches2.length
  let lastEndIndex = -1
  const output = []

  const state = {
    a1: matches1,
    i1: 0,
    a2: matches2,
    i2: 0
  }

  while (state.i1 < length1 || state.i2 < length2) {
    next = pickNext(state)
    if (next.startIndex >= lastEndIndex) {
      output.push(next)
    }
    lastEndIndex = next.endIndex
  }

  return output
}

function pickNext (state) {
  const i1 = state.i1
  const i2 = state.i2
  const item1 = state.a1[i1]
  const item2 = state.a2[i2]

  if (item1 && item2 && item1.startIndex < item2.startIndex) {
    state.i1 = i1 + 1
    return item1
  } else if (item1 && item2) {
    state.i2 = i2 + 1
    return item2
  } else if (item1) {
    state.i1 = i1 + 1
    return item1
  } else if (item2) {
    state.i2 = i2 + 1
    return item2
  } else {
    return undefined
  }
}

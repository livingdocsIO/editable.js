'use strict'
function textNodesUnder (node) {
  let all = []
  for (node = node.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 3) {
      all.push(node)
      } else {
      all = all.concat(textNodesUnder(node))
      }
  }
  return all
}

function getTotalCharCount (element) {
  const textNodes = textNodesUnder(element)
  const reducer = (acc, node) => acc + node.textContent.length
  return textNodes.reduce(reducer, 0)
}

module.exports = {getTotalCharCount}
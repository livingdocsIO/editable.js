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

// NOTE: if there is only one text node, then just that node and
// the abs offset are returned
function getTextNodeAndRelativeOffset ({textNodes, absOffset}) {
  let cumulativeOffset = 0
  let relativeOffset = 0
  let targetNode
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i]
    if (absOffset <= cumulativeOffset + node.textContent.length) {
      targetNode = node
      relativeOffset = absOffset - cumulativeOffset
      break
    }
    cumulativeOffset += node.textContent.length
  }
  return {node: targetNode, relativeOffset}
}

function getTotalCharCount (element) {
  const textNodes = textNodesUnder(element)
  const reducer = (acc, node) => acc + node.textContent.length
  return textNodes.reduce(reducer, 0)
}

module.exports = {getTotalCharCount, textNodesUnder, getTextNodeAndRelativeOffset}

'use strict'
import NodeIterator from '../node-iterator'

export function textNodesUnder (node) {
  const iterator = new NodeIterator(node, 'getNextTextNode')
  return [...iterator]
}

// NOTE: if there is only one text node, then just that node and
// the abs offset are returned
export function getTextNodeAndRelativeOffset ({textNodes, absOffset}) {
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

export function getTotalCharCount (element) {
  const textNodes = textNodesUnder(element)
  const reducer = (acc, node) => acc + node.textContent.length
  return textNodes.reduce(reducer, 0)
}

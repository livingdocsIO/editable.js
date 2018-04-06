const nodeType = {
  elementNode: 1,
  attributeNode: 2,
  textNode: 3,
  cdataSectionNode: 4,
  entityReferenceNode: 5,
  entityNode: 6,
  processingInstructionNode: 7,
  commentNode: 8,
  documentNode: 9,
  documentTypeNode: 10,
  documentFragmentNode: 11,
  notationNode: 12
}

module.exports = function domToModel (content, element) {
  appendToModel(content, element)
  return content
}

function appendToModel (content, element) {
  var i, j, node, sibling
  for (i = 0; i < element.childNodes.length; i++) {
    node = element.childNodes[i]
    if (!node) continue

    // skip empty tags, so they'll get removed
    if (node.nodeName !== 'BR' && !node.textContent) continue

    if (node.nodeType === nodeType.elementNode && node.nodeName !== 'BR') {
      sibling = node
      while ((sibling = sibling.nextSibling) !== null) {
        if (!isSameNode(sibling, node)) break

        for (j = 0; j < sibling.childNodes.length; j++) {
          node.appendChild(sibling.childNodes[j].cloneNode(true))
        }

        sibling.parentNode.removeChild(sibling)
      }

      var nodeName = node.nodeName.toLowerCase()
      var openTag = content.appendOpenTag(nodeName)
      appendToModel(content, node)
      var closeTag = content.appendCloseTag(nodeName, openTag)
      openTag.close = closeTag.id
    } else if (node.nodeType === nodeType.textNode && node.textContent.trim()) {
      content.appendText(node.textContent)
    } else {
      content.append(node)
    }
  }
}

function isSameNode (target, source) {
  var i, len, attr

  if (target.nodeType !== source.nodeType) return false
  if (target.nodeName !== source.nodeName) return false

  for (i = 0, len = target.attributes.length; i < len; i++) {
    attr = target.attributes[i]
    if (source.getAttribute(attr.name) !== attr.value) return false
  }

  return true
}

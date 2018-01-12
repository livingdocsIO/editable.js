var nodeType = require('./node-type')
var parser = require('./parser')

module.exports = function domToModel (content, element) {
  // var content = []
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
        if (!parser.isSameNode(sibling, node))
          break

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
    } else if (node.nodeType === nodeType.textNode) {
      content.appendText(node.textContent)
    } else {
      content.append(node)
    }
  }
}

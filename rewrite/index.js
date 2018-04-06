const concat = require('concat-arrays')
const domToModel = require('./dom-to-model')
const nanoid = require('nanoid')

module.exports = EditableContent

// const serializedModel = {
//   text: 'Hello world',
//   enhancements: [{id: 1, type: 'highlight', start: 0, end: 5, value: 'spellcheck'}, {id: 2, type: 'tag', start: 2, end: 3, value: 'bold'}]
// }

// const parsedModel = {
//   content: [{id: 't1', type: 'highlightStart', value: 'spellcheck'}, {id: 't2', type: 'text', value: 'Hello'}, {id: 't1', type: 'highlightEnd'}, {id: 'c123', type: 'cursor'}, {id: 't4', type: 'text', value: ' World'}]
// }


function EditableContent (elem) {
  this.id = nanoid(10)
  this.content = []
  this.elem = elem
  domToModel(this, elem)
}

var p = EditableContent.prototype

p.split = function (id, pos) {
  var match = find(this.content, id)
  if (!match) return false

  var element = match.element
  var firstPart = element.value.slice(0, pos)
  var secondPart = element.value.slice(pos)
  element.value = firstPart

  var copy
  if (secondPart) copy = {id: nanoid(5), type: 'text', value: secondPart}
  this.content = concat(
    this.content.slice(0, match.index + 1),
    copy ? [copy] : undefined,
    this.content.slice(match.index + 1)
  )
  return true
}

p.insert = function (value, position) {
  this.content = concat(this.content.slice(position), [value], this.content.slice(position + 1))
  return value
}

p.append = function (value) {
  this.content.push(value)
  return value
}

p.replace = function (value) {
  this.content.push(value)
  return value
}

p.appendText = function (value) {
  return this.append({id: nanoid(5), type: 'text', value: value})
}

p.appendOpenTag = function (tag, attributes) {
  return this.append({id: nanoid(5), type: 'open', tag: tag, attributes: attributes})
}

p.appendCloseTag = function (tag, attributes) {
  return this.append({id: nanoid(5), type: 'close', tag: tag})
}

p.wrap = function (startId, endId, opts) {
  if (arguments.length === 2) {
    opts = endId
    endId = startId
  }

  var tag = opts.tag
  var attributes = opts.attributes
  var openTag = {id: nanoid(5), type: 'open', tag: tag}
  if (Object.keys(attributes || {}).length) openTag.attributes = attributes

  var closeTag = {id: nanoid(5), type: 'close', tag: tag, open: openTag.id}
  openTag.close = closeTag.id

  var startTag = find(this.content, startId)
  var endTag = find(this.content, endId)
  var startIndex = startTag ? startTag.index : 0
  var endIndex = endTag ? endTag.index : this.content.length

  this.content = concat(
    this.content.slice(0, startIndex),
    [openTag],
    this.content.slice(startIndex, endIndex + 1),
    [closeTag],
    this.content.slice(endIndex + 1)
  )

  return [startId, endId]
}

p.remove = function (id, ignoreReference) {
  var match = find(this.content, id)
  if (!match) return false

  this.content = concat(
    this.content.slice(0, match.index),
    this.content.slice(match.idnex + 1)
  )

  if (ignoreReference === true) return

  var ref = match.element.open || match.element.close
  if (ref) this.remove(ref, true)
  return true
}

p.update = function (id, value) {
  var match = find(this.content, id)
  if (!match) return

  match.element.value = value
  return match.element
}

p.mutationsToEvents = function (mutations) {
  for (var i = mutations.length - 1; i >= 0; i--) {
    const m = mutations[i]
    if (m.type === 'characterData') {
      // const parentNode = m.target.parentNode
      const str = m.target.previousSibling.nextSibling.data
      console.log(str)
      const id = m.target.parentNode.attributes['editable-id']
      const updated = this.update(id, str)
      console.log(updated, this.content)
      // // const textNode = document.createTextNode(m.target.data)
      // find(this.content, )
    } else if (m.type === 'childList') {
      if (!m.target.attributes['editable-id'] && m.addedNodes.length === 1) {
        const parentNode = m.target.parentNode
        const parentId = parentNode.attributes['editable-id']
        const previousSibling = m.target.previousSibling
        // const target = m.target.attributes['editable-id']
        // console.log(m)
        this.split(parentId, previousSibling.data.length)
      }
    }
    console.log(m)
  }
}

p.toText = function toText () {
  var string = ''
  each(this.content, function (elem) {
    if (elem.type === 'text') string += elem.value + ' '
  })
  return string.trim()
}

p.toHtml = function toHtml () {
  let string = ''
  each(this.content, function (elem) {
    if (elem.type === 'text') {
      string += '<span editable-id="' + elem.id + '">' + elem.value + '</span>'
    } else if (elem.type === 'open') {
      string += '<' + elem.tag + ' editable-id="' + elem.id + '"'
      for (const key in elem.attributes) { string += key + '="' + elem.attributes[key] + '"' }
      string += '>'
    } else if (elem.type === 'close') {
      string += '</' + elem.tag + '>'
    }
  })
  return string
}

p.toDom = function toDom () {
  const wrapper = document.createElement('div')
  let lastNode = wrapper
  each(this.content, function (elem) {
    if (elem.type === 'text') {
      const textNode = document.createElement('span')
      textNode.setAttribute('editable-id', elem.id)
      textNode.innerText = elem.value
      lastNode.appendChild(textNode)
    } else if (elem.type === 'open') {
      // depth = depth + 1
      const customNode = document.createElement(elem.tag)
      customNode.setAttribute('editable-id', elem.id)
      for (const key in elem.attributes) { customNode.setAttribute(key, elem.attributes[key]) }
      lastNode.appendChild(customNode)
      lastNode = customNode
    } else if (elem.type === 'close') {
      lastNode = lastNode.parentNode
    }
  })
  return wrapper
}

function find (arr, id) {
  var elem
  for (var i = arr.length - 1; i >= 0; i--) {
    elem = arr[i]
    if (elem.id === id) {
      return {
        index: i,
        element: elem
      }
    }
  }
}

function each (arr, func) {
  for (var i = 0; i < arr.length; ++i) {
    func(arr[i])
  }
}

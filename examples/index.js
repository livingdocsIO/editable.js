const $ = require('jquery')

// Paragraph Example
const Editable = require('../rewrite')
const EditableView = require('../rewrite/editable-view')

// Paragraph
// ---------

$(document).ready(function () {
  const elem = document.querySelector('#rewrite')
  const editable = new Editable(elem)
  const view = new EditableView(editable, elem, console.log)
  console.log('editable', editable)
  view.render(editable.toDom())
})

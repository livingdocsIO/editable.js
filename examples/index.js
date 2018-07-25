import $ from 'jquery'
import Prism from 'prismjs'

import Editable from '../src/core'
import eventList from './events.js'

// Paragraph Example
const editable = new Editable({
  browserSpellcheck: false
})

// Paragraph
// ---------

$(() => {
  editable.add('.paragraph-example p')
  eventList(editable)

  editable.add('.formatting-example p')
  setupTooltip()

  var secondExample = document.querySelector('.formatting-example p')
  updateCode(secondExample)

  editable.on('change', (elem) => {
    if (elem === secondExample) updateCode(elem)
  })

  // IFrame
  // ------

  $('.iframe-example').on('load', function () {
    const iframeWindow = this.contentWindow
    const iframeEditable = new Editable({
      window: iframeWindow
    })

    const iframeBody = this.contentDocument.body
    iframeEditable.add($('.is-editable', iframeBody))
  })
})

// Text Formatting
// ---------------

let currentSelection
function setupTooltip () {
  const tooltip = $('<div class="selection-tip" style="display:none;">' +
    '<button class="js-format js-format-bold"><i class="fa fa-bold"></i></button>' +
    '<button class="js-format js-format-italic"><i class="fa fa-italic"></i></button>' +
    '<button class="js-format js-format-underline"><i class="fa fa-underline"></i></button>' +
    '<button class="js-format js-format-link"><i class="fa fa-link"></i></button>' +
    '<button class="js-format js-format-quote"><i class="fa fa-quote-left"></i></button>' +
    '<button class="js-format js-format-emoji"><i class="fa fa-smile-o"></i></button>' +
    '<button class="js-format js-format-whitespace"><i class="fa fa-arrows-h"></i></button>' +
    '<button class="js-format js-format-clear"><i class="fa fa-eraser"></i></button>' +
    '</div>')
  $(document.body).append(tooltip)

  editable.selection((el, selection) => {
    currentSelection = selection
    if (!selection) return tooltip.hide()

    const coords = selection.getCoordinates()

    // position tooltip
    const top = coords.top - tooltip.outerHeight() - 15
    const left = coords.left + (coords.width / 2) - (tooltip.outerWidth() / 2)
    tooltip.css({top, left}).show()
  })
    .blur(() => tooltip.hide())

  setupTooltipListeners()
}

function setupTooltipListeners () {
  // prevent editable from loosing focus
  $(document)

    .on('mousedown', '.js-format', (event) => event.preventDefault())

    .on('click', '.js-format-bold', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.toggleBold()
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-italic', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.toggleEmphasis()
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-underline', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.toggleUnderline()
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-link', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.toggleLink('www.upfront.io')
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-quote', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.toggleSurround('«', '»')
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-emoji', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.insertCharacter('😍')
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-whitespace', (event) => {
      if (currentSelection.isSelection) {
      // insert a special whitespace 'em-space'
        currentSelection.insertCharacter(' ')
        currentSelection.triggerChange()
      }
    })

    .on('click', '.js-format-clear', (event) => {
      if (currentSelection.isSelection) {
        currentSelection.removeFormatting()
        currentSelection.triggerChange()
      }
    })
}

function updateCode (elem) {
  const content = editable.getContent(elem)
  const $codeBlock = $('.formatting-code-js')
  $codeBlock.text(content.trim())
  Prism.highlightElement($codeBlock[0])
}

// Highlighting
// ------------

function highlightService (text, callback) {
  callback(['happy'])
}

editable.setupHighlighting({
  checkOnInit: true,
  throttle: 0,
  spellcheck: {
    marker: '<span class="highlight-spellcheck"></span>',
    spellcheckService: highlightService
  },
  whitespace: {
    marker: '<span class="highlight-whitespace"></span>'
  }
})

const $highlightExample = $('.highlighting-example p')
editable.add($highlightExample)


// Whitespace Highlighting
// -----------------------

const $highlightExample2 = $('.whitespace-highlighting-example p')
editable.add($highlightExample2)


// Pasting
// -------

editable.add('.pasting-example p')

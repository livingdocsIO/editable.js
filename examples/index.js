import Prism from 'prismjs'

import {Editable} from '../src/core'
import eventList from './events.js'

// Paragraph Example
const editable = new Editable({browserSpellcheck: false})

// Paragraph
// ---------
editable.enable('.paragraph-example p', true)
eventList(editable)

// Text formatting toolbar
editable.enable('.formatting-example p', true)
setupTooltip()

editable.enable('.styling-example p', true)
const secondExample = document.querySelector('.formatting-example p')
updateCode(secondExample)

editable.on('change', (elem) => {
  if (elem === secondExample) updateCode(elem)
})

// Styling
// -------
document.querySelector('select[name="editable-styles"]')
  .addEventListener('change', (evt) => {
    for (const el of document.querySelectorAll('.styling-example p')) {
      el.classList.remove('example-style-default', 'example-style-dark')
      el.classList.add(`example-style-${evt.target.value}`)
    }
  })

// Inline element
editable.add('.inline-example span')

// IFrame
// ------
document.querySelector('.iframe-example')
  .addEventListener('load', function () {
    const iframeWindow = this.contentWindow
    const iframeEditable = new Editable({
      window: iframeWindow
    })

    const iframeBody = this.contentDocument.body
    iframeEditable.add(iframeBody.querySelectorAll('.is-editable'))
  })

// Text Formatting
// ---------------

let currentSelection
function setupTooltip () {
  const tooltipWrapper = document.createElement('div')
  tooltipWrapper.innerHTML = '<div class="selection-tip" style="display:none;">' +
    '<button class="js-format js-format-bold"><i class="fa fa-bold"></i></button>' +
    '<button class="js-format js-format-italic"><i class="fa fa-italic"></i></button>' +
    '<button class="js-format js-format-underline"><i class="fa fa-underline"></i></button>' +
    '<button class="js-format js-format-link"><i class="fa fa-link"></i></button>' +
    '<button class="js-format js-format-quote"><i class="fa fa-quote-left"></i></button>' +
    '<button class="js-format js-format-emoji"><i class="fa fa-smile-o"></i></button>' +
    '<button class="js-format js-format-whitespace"><i class="fa fa-arrows-h"></i></button>' +
    '<button class="js-format js-format-clear"><i class="fa fa-eraser"></i></button>' +
    '</div>'

  const tooltip = tooltipWrapper.firstElementChild
  document.body.appendChild(tooltip)

  editable
    .selection((el, selection) => {
      currentSelection = selection
      if (!selection) {
        tooltip.style.display = 'none'
        return
      }

      const coords = selection.getCoordinates()
      tooltip.style.display = 'block'

      // position tooltip
      const top = coords.top - tooltip.offsetHeight - 15
      // eslint-disable-next-line
      const left = coords.left + (coords.width / 2) - (tooltip.offsetWidth / 2)
      tooltip.style.top = `${top}px`
      tooltip.style.left = `${left}px`
    })
    .blur(() => {
      tooltip.style.display = 'none'
    })

  setupTooltipListeners(tooltip)
}

function setupTooltipListeners (tooltip) {
  // prevent editable from loosing focus
  // document
  //   .addEventListener('mousedown', (evt) => {})
  const on = (type, selector, func) => {
    for (const el of tooltip.querySelectorAll(selector)) {
      el.addEventListener(type, func)
    }
  }

  on('mousedown', '.js-format', (event) => event.preventDefault())

  on('click', '.js-format-bold', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.toggleBold()
    currentSelection.triggerChange()
  })

  on('click', '.js-format-italic', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.toggleEmphasis()
    currentSelection.triggerChange()
  })

  on('click', '.js-format-underline', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.toggleUnderline()
    currentSelection.triggerChange()
  })

  on('click', '.js-format-link', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.toggleLink('www.livingdocs.io')
    currentSelection.triggerChange()
  })

  on('click', '.js-format-quote', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.toggleSurround('«', '»')
    currentSelection.triggerChange()
  })

  on('click', '.js-format-emoji', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.insertCharacter('😍')
    currentSelection.triggerChange()
  })

  on('click', '.js-format-whitespace', (event) => {
    if (!currentSelection.isSelection) return

    // insert a special whitespace 'em-space'
    currentSelection.insertCharacter(' ')
    currentSelection.triggerChange()
  })

  on('click', '.js-format-clear', (event) => {
    if (!currentSelection.isSelection) return

    currentSelection.removeFormatting()
    currentSelection.triggerChange()
  })
}

function updateCode (elem) {
  const content = editable.getContent(elem)
  const codeBlock = document.querySelector('.formatting-code-js')
  codeBlock.textContent = content.trim()
  Prism.highlightElement(codeBlock)
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

const highlightExample = document.querySelector('.highlighting-example p')
editable.add(highlightExample)


// Whitespace Highlighting
// -----------------------

const highlightExample2 = document.querySelector('.whitespace-highlighting-example p')
editable.add(highlightExample2)


// Pasting
// -------

editable.add('.pasting-example p')

import Prism from 'prismjs'

import {Editable} from '../src/core'
import eventList from './events.js'
import {getSelectionCoordinates} from '../src/util/dom'

// Paragraph Example
const editable = new Editable({browserSpellcheck: false})

// Paragraph
// ---------
editable.enable('.paragraph-example p', {normalize: true})
eventList(editable)

// Text formatting toolbar
editable.enable('.formatting-example p', {normalize: true})
setupTooltip()

// Plain Text
editable.enable('.plain-text-example.example-sheet', {plainText: true})

editable.enable('.styling-example p', {normalize: true})
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
    `<button class="js-format js-format-bold"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-italic"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-underline"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-link"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-quote"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-emoji"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M15.5,8A1.5,1.5 0 0,1 17,9.5A1.5,1.5 0 0,1 15.5,11A1.5,1.5 0 0,1 14,9.5A1.5,1.5 0 0,1 15.5,8M8.5,8A1.5,1.5 0 0,1 10,9.5A1.5,1.5 0 0,1 8.5,11A1.5,1.5 0 0,1 7,9.5A1.5,1.5 0 0,1 8.5,8M12,17.5C9.67,17.5 7.69,16.04 6.89,14H17.11C16.3,16.04 14.33,17.5 12,17.5Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-whitespace"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M3 15H5V19H19V15H21V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15Z" /></svg>`)}"></button>` +
    `<button class="js-format js-format-clear"><img width="20" height=20" src="data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #eee"><path d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" /></svg>`)}"></button>` +
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

      const coords = getSelectionCoordinates(window.getSelection())?.[0]
      tooltip.style.display = 'block'
      tooltip.style.position = 'fixed'

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

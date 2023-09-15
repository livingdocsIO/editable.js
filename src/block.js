import config from './config'
import * as content from './content'

let nextBlockId = 1
const state = {}

export const next = getSibling('nextElementSibling')
export const previous = getSibling('previousElementSibling')

export function init (elem, {normalize, plainText, shouldSpellcheck}) {
  setBlockId(elem)

  elem.setAttribute('contenteditable', true)
  elem.setAttribute('spellcheck', Boolean(shouldSpellcheck))
  elem.setAttribute('data-plaintext', Boolean(plainText))

  elem.classList.remove(config.editableDisabledClass)
  elem.classList.add(config.editableClass)

  if (normalize) content.tidyHtml(elem)
}


export function disable (elem) {
  elem.removeAttribute('contenteditable')
  elem.removeAttribute('spellcheck')
  elem.removeAttribute('data-plaintext')

  setState(elem, undefined)

  elem.classList.remove(config.editableClass)
  elem.classList.add(config.editableDisabledClass)
}

export function isPlainTextBlock (elem) {
  return elem.getAttribute('data-plaintext') === 'true'
}

export function setBlockId (elem) {
  if (!elem.hasAttribute('data-editable')) {
    elem.setAttribute('data-editable', `id-${nextBlockId}`)
    nextBlockId += 1
  }
}


export function getState (elem) {
  if (elem.hasAttribute('data-editable')) {
    const id = elem.getAttribute('data-editable')
    return state[id]
  }
}


export function setState (elem, data) {
  if (elem.hasAttribute('data-editable')) {
    const id = elem.getAttribute('data-editable')
    state[id] = data
  }
}


// Helpers
// -------

function getSibling (type) {
  return function (element) {
    const sibling = element[type]
    return sibling && sibling.getAttribute('contenteditable')
      ? sibling
      : null
  }
}

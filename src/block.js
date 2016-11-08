import $ from 'jquery'

import * as config from './config'
import * as content from './content'

let nextBlockId = 1
const state = {}

export const next = getSibling('nextElementSibling')
export const previous = getSibling('previousElementSibling')

export function init (elem, {normalize, shouldSpellcheck}) {
  setBlockId(elem)

  elem.setAttribute('contenteditable', true)
  elem.setAttribute('spellcheck', Boolean(shouldSpellcheck))

  $(elem)
  .removeClass(config.editableDisabledClass)
  .addClass(config.editableClass)

  if (normalize) content.tidyHtml(elem)
}


export function disable (elem) {
  elem.removeAttribute('contenteditable')
  elem.removeAttribute('spellcheck')

  setState(elem, undefined)

  $(elem)
  .removeClass(config.editableClass)
  .addClass(config.editableDisabledClass)
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

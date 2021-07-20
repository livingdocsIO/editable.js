/**
 * @param {HTMLElement | Array | String} target
 * @param {Document} document
 */
export const domArray = (target, document) => {
  if (typeof target === 'string') return Array.from(document.querySelectorAll(target))
  if (target.tagName) return [target]
  if (Array.isArray(target)) return target
  // Support NodeList and jQuery arrays
  return Array.from(target)
}

/**
 * @param { HTMLElement | String } target
 * @param { Document } document
 * @returns { HTMLElement }
 */
export const domSelector = (target, document) => {
  if (typeof target === 'string') return document.querySelector(target)
  if (target.tagName) return target
  // Support NodeList and jQuery arrays
  if (target[0]) return target[0]
  return target
}

export const createElement = (html, win = window) => {
  const el = win.document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

/**
* Get the closest dom element matching a selector
* @description
*   - If a textNode is passed, it will still find the correct element
*   - If a document is passed, it will return undefined
* @param {Node} elem
* @param {String} selector
* @returns {HTMLElement|undefined}
*/
export const closest = (elem, selector) => {
  if (!elem.closest) elem = elem.parentNode
  if (elem && elem.closest) return elem.closest(selector)
}

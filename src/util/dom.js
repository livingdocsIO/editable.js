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

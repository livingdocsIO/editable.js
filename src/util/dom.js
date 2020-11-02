import { isString } from './string'

/**
 * @param {HTMLElement | Array | String} target
 * @param {Document} document
 */
export const domArray = (target, document) => {
  let targets = []
  switch (true) {
    case isString(target):
      targets = document.querySelectorAll(target)
      break
    case Array.isArray(target):
      targets = target
      break
    case target instanceof HTMLElement:
      targets.push(target)
      break
  }

  return targets
}

/**
 * @param { HTMLElement | String } target
 * @param { Document } document
 * @returns { HTMLElement }
 */
export const domSelector = (target, document) => {
  switch (true) {
    case isString(target):
      return document.querySelector(target)
    case target instanceof HTMLElement:
      return target
  }
  return target
}

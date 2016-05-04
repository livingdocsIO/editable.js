export const next = getSibling('nextElementSibling')
export const previous = getSibling('previousElementSibling')

function getSibling (type) {
  return function (element) {
    const sibling = element[type]
    return sibling && sibling.getAttribute('contenteditable')
      ? sibling
      : null
  }
}

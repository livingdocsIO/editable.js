/**
 * Defines all supported event types by Editable.JS and provides default
 * implementations for them defined in {{#crossLink "Behavior"}}{{/crossLink}}
 *
 * @type {Object}
 */
export const log = false
export const logErrors = true
export const editableClass = 'js-editable'
export const editableDisabledClass = 'js-editable-disabled'
export const pastingAttribute = 'data-editable-is-pasting'
export const boldTag = 'strong'
export const italicTag = 'em'

// Rules that are applied when filtering pasted content
export const pastedHtmlRules = {
  // Elements and their attributes to keep in pasted text
  allowedElements: {
    'a': {
      'href': true
    },
    'strong': {},
    'em': {},
    'br': {}
  },

  // Elements that have required attributes.
  // If these are not present the elements are filtered out.
  // Required attributes have to be present in the 'allowed' object
  // as well if they should not be filtered out.
  requiredAttributes: {
    'a': ['href']
  },

  // Elements that should be transformed into other elements
  transformElements: {
    'b': 'strong',
    'i': 'em'
  },

  // A list of elements which should be split into paragraphs.
  splitIntoBlocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'],

  // A list of HTML block level elements.
  blockLevelElements: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'pre', 'hr', 'blockquote',
    'article', 'figure', 'header', 'footer', 'ul', 'ol', 'li', 'section', 'table', 'video'
  ]
}

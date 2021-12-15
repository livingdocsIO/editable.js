/**
 * Defines all supported event types by Editable.JS and provides default
 * implementations for them defined in {{#crossLink "Behavior"}}{{/crossLink}}
 *
 * @type {Object}
 */
export default {
  log: false,
  logErrors: true,
  editableClass: 'js-editable',
  editableDisabledClass: 'js-editable-disabled',
  pastingAttribute: 'data-editable-is-pasting',
  boldMarkup: {
    type: 'tag',
    name: 'strong',
    attribs: {},
    trim: true
  },
  italicMarkup: {
    type: 'tag',
    name: 'em',
    attribs: {},
    trim: true
  },
  underlineMarkup: {
    type: 'tag',
    name: 'u',
    attribs: {},
    trim: false
  },
  linkMarkup: {
    type: 'tag',
    name: 'a',
    attribs: {},
    trim: true
  },

  // Rules that are applied when filtering pasted content
  pastedHtmlRules: {
    // Elements and their attributes to keep in pasted text
    // Note that elements not explicitly allowed here will not be removed, their
    // tags will get stripped but their content will be kept. Use `blacklistedElements`
    // to get rid of a whole element (tag+content)
    allowedElements: {
      'a': {
        'href': true,
        'rel': true,
        'target': true
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
    ],

    // A list of elements that will get completely removed when pasted. Their tags
    // and content (text content and child elements) will get removed.
    blacklistedElements: ['style', 'script'],

    keepInternalRelativeLinks: false,

    // Replace quotes in a pasted content with quotes from config.
    replaceQuotes: {
      // quotes: ['“', '”'],
      // singleQuotes: ['‘', '’'],
      // apostrophe: '’'
    }
  }
}

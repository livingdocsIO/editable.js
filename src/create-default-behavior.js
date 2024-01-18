import * as parser from './parser.js'
import * as content from './content.js'
import log from './util/log.js'
import * as block from './block.js'
import * as nodeType from './node-type.js'

/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with Editable.init() or on
 * Editable.add() per element.
 *
 * @module core
 * @submodule behavior
 */

export default function createDefaultBehavior (editable) {
  const document = editable.win.document
  /**
  * Factory for the default behavior.
  * Provides default behavior of the Editable.JS API.
  *
  * @static
  */

  return {
    /** @param {HTMLElement} element */
    focus (element) {
      if (!parser.isVoid(element)) return

      // Add an zero width space if the editable is empty to force it to have a height
      // E.g. Firefox does not render empty block elements
      //   and most browsers do not render empty inline elements.
      element.appendChild(document.createTextNode('\uFEFF'))
    },

    blur (element) {
      // Note: there is a special case when the tab is changed where
      // we can get a blur event even if the cursor is still in the editable.
      // This blur would cause us to loose the cursor position (cause of cleanInternals()).
      // To prevent this we check if the activeElement is still the editable.
      // (Note: document.getSelection() did not work reliably in this case.)
      if (document.activeElement === element) return

      content.cleanInternals(element)
    },

    selection (element, selection) {
      log(selection ? 'Default selection behavior' : 'Default selection empty behavior')
    },

    cursor (element, cursor) {
      log(cursor ? 'Default cursor behavior' : 'Default cursor empty behavior')
    },

    newline (element, cursor) {
      // When the cursor is at the text end, we'll need to add an empty text node
      // after the br tag to ensure that the cursor shows up on the next line
      if (cursor.isAtTextEnd()) {
        const br = document.createElement('br')
        cursor.insertBefore(br)

        // Only append a zero width space if there's none after the br tag
        // We don't need to remove them as they get cleaned up on blur
        if (
          br.nextSibling?.nodeType !== nodeType.textNode ||
          br.nextSibling.textContent[0] !== '\uFEFF'
        ) {
          cursor.insertAfter(document.createTextNode('\uFEFF'))
        }
      } else {
        cursor.insertBefore(document.createElement('br'))
      }

      cursor.setVisibleSelection()
    },

    insert (element, direction, cursor) {
      const parent = element.parentNode
      const newElement = element.cloneNode(false)
      if (newElement.id) newElement.removeAttribute('id')

      switch (direction) {
        case 'before':
          parent.insertBefore(newElement, element)
          element.focus()
          break
        case 'after':
          parent.insertBefore(newElement, element.nextSibling)
          newElement.focus()
          break
      }
    },

    split (element, before, after, cursor) {
      const newNode = element.cloneNode(false)
      newNode.appendChild(before)

      const parent = element.parentNode
      parent.insertBefore(newNode, element)

      while (element.firstChild) element.removeChild(element.firstChild)

      element.appendChild(after)
      content.tidyHtml(newNode)
      content.tidyHtml(element)
      element.focus()
    },

    merge (element, direction, cursor) {
      let container, merger

      switch (direction) {
        case 'before':
          container = block.previous(element)
          merger = element
          break
        case 'after':
          container = element
          merger = block.next(element)
          break
      }

      if (!(container && merger)) return

      cursor = container.childNodes.length > 0
        ? editable.appendTo(container, merger.innerHTML)
        : editable.prependTo(container, merger.innerHTML)

      // remove merged node
      merger.remove()

      cursor.save()
      content.tidyHtml(container)
      cursor.restore()
      cursor.setVisibleSelection()
    },

    empty (element) {
      log('Default empty behavior')
    },

    switch (element, direction, cursor) {
      switch (direction) {
        case 'before':
          const previous = block.previous(element)
          if (previous) {
            cursor.moveAtTextEnd(previous)
            cursor.setVisibleSelection()
          }
          break
        case 'after':
          const next = block.next(element)
          if (next) {
            cursor.moveAtBeginning(next)
            cursor.setVisibleSelection()
          }
          break
      }
    },

    move (element, selection, direction) {
      log('Default move behavior')
    },

    paste (element, blocks, cursor) {
      if (blocks.length === 0) return

      cursor.insertBefore(blocks.shift())
      if (blocks.length === 0) return cursor.setVisibleSelection()

      const parent = element.parentNode
      let currentElement = element

      blocks.forEach((str) => {
        const newElement = element.cloneNode(false)
        if (newElement.id) newElement.removeAttribute('id')
        const fragment = content.createFragmentFromString(str)
        newElement.appendChild(fragment)
        parent.insertBefore(newElement, currentElement.nextSibling)
        currentElement = newElement
      })

      // focus last element
      editable.createCursorAtEnd(currentElement)
        .setVisibleSelection()
    },

    clipboard (element, action, cursor) {
      log('Default clipboard behavior')
    },

    toggleBold (selection) {
      selection.toggleBold()
    },

    toggleEmphasis (selection) {
      selection.toggleEmphasis()
    }
  }
}

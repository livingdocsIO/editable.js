import * as parser from './parser'
import * as content from './content'
import log from './util/log'
import * as block from './block'

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
        // We need to wrap the newline, so it can get deleted
        // together with the null escape character
        const spanWithTextNode = document.createElement('span')
        spanWithTextNode.setAttribute('data-editable', 'unwrap')

        // The null escape character gets wrapped in another span,
        // so it gets removed automatically.
        // contenteditable=false prevents a focus of the span
        // and therefore also prevents content from getting written into it.
        // If this attribute is defined on the parent wrapper element,
        // the cursor positioning behaves weird with deletion of the newline
        const spacer = document.createElement('span')
        spacer.setAttribute('data-editable', 'remove')
        spacer.setAttribute('contenteditable', 'false')
        spacer.appendChild(document.createTextNode('\uFEFF'))

        spanWithTextNode.appendChild(document.createElement('br'))
        spanWithTextNode.appendChild(spacer)

        cursor.insertBefore(spanWithTextNode)
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

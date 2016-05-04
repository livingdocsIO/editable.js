import $ from 'jquery'

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
    focus (element) {
      // Add a <br> element if the editable is empty to force it to have height
      // E.g. Firefox does not render empty block elements and most browsers do
      // not render  empty inline elements.
      if (!parser.isVoid(element)) return
      const br = document.createElement('br')
      br.setAttribute('data-editable', 'remove')
      element.appendChild(br)
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
      cursor.insertBefore(document.createElement('br'))

      if (cursor.isAtEnd()) {
        log('at the end')

        const noWidthSpace = document.createTextNode('\u200B')
        cursor.insertAfter(noWidthSpace)

        // var trailingBr = document.createElement('br')
        // trailingBr.setAttribute('type', '-editablejs')
        // cursor.insertAfter(trailingBr)
      } else {
        log('not at the end')
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
      const newNode = element.cloneNode()
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
      merger.parentNode.removeChild(merger)

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
      cursor.insertBefore(blocks[0])

      if (blocks.length <= 1) return cursor.setVisibleSelection()

      var parent = element.parentNode
      var currentElement = element

      blocks.forEach((block) => {
        const newElement = element.cloneNode(false)
        if (newElement.id) newElement.removeAttribute('id')
        const fragment = content.createFragmentFromString(block)
        $(newElement).append(fragment)
        parent.insertBefore(newElement, currentElement.nextSibling)
        currentElement = newElement
      })

      // focus last element
      editable.createCursorAtEnd(currentElement)
      .setVisibleSelection()
    },

    clipboard (element, action, cursor) {
      log('Default clipboard behavior')
    }
  }
}

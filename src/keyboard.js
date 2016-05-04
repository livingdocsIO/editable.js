var rangy = require('rangy')

import { contenteditableSpanBug } from './feature-detection'
import * as nodeType from './node-type'
import eventable from './eventable'

/**
 * The Keyboard module defines an event API for key events.
 */

export default class Keyboard {
  constructor (selectionWatcher) {
    eventable(this)
    this.selectionWatcher = selectionWatcher
  }

  dispatchKeyEvent (event, target, notifyCharacterEvent) {
    switch (event.keyCode) {
      case this.key.left:
        return this.notify(target, 'left', event)

      case this.key.right:
        return this.notify(target, 'right', event)

      case this.key.up:
        return this.notify(target, 'up', event)

      case this.key.down:
        return this.notify(target, 'down', event)

      case this.key.tab:
        if (event.shiftKey) return this.notify(target, 'shiftTab', event)
        return this.notify(target, 'tab', event)

      case this.key.esc:
        return this.notify(target, 'esc', event)

      case this.key.backspace:
        this.preventContenteditableBug(target, event)
        return this.notify(target, 'backspace', event)

      case this.key.delete:
        this.preventContenteditableBug(target, event)
        return this.notify(target, 'delete', event)

      case this.key.enter:
        if (event.shiftKey) return this.notify(target, 'shiftEnter', event)
        return this.notify(target, 'enter', event)
      case this.key.ctrl:
      case this.key.shift:
      case this.key.alt:
        return
      // Metakey
      case 224: // Firefox: 224
      case 17: // Opera: 17
      case 91: // Chrome/Safari: 91 (Left)
      case 93: // Chrome/Safari: 93 (Right)
        return
      default:
        this.preventContenteditableBug(target, event)
        if (!notifyCharacterEvent) return
        // Don't notify character events as long as either the ctrl or
        // meta key are pressed.
        // see: https://github.com/upfrontIO/editable.js/pull/125
        if (!event.ctrlKey && !event.metaKey) return this.notify(target, 'character', event)
    }
  }

  preventContenteditableBug (target, event) {
    if (!contenteditableSpanBug) return
    if (event.ctrlKey || event.metaKey) return

    // This fixes a strange webkit bug that can be reproduced as follows:
    //
    // 1. A node used within a contenteditable has some style, e.g through the
    //    following CSS:
    //
    //      strong {
    //        color: red
    //      }
    //
    // 2. A selection starts with the first character of a styled node and ends
    //    outside of that node, e.g: "big beautiful" is selected in the folloing
    //    html:
    //
    //      <p contenteditable="true">
    //        Hello <strong>big</strong> beautiful world
    //      </p>
    //
    // 3. The user types a letter character to replace "big beautiful", e.g. "x"
    //
    // Result: Webkits adds <font> and <b> tags:
    //
    //    <p contenteditable="true">
    //      Hello
    //      <font color="#ff0000">
    //        <b>f</b>
    //      </font>
    //      world
    //    </p>
    //
    // This bug ONLY happens, if the first character of the node is selected and
    // the selection goes further than the node.
    //
    // Solution:
    //
    // Manually remove the element that would be removed anyway before inserting
    // the new letter.
    const rangyInstance = this.selectionWatcher.getFreshRange()
    if (!rangyInstance.isSelection) return

    const nodeToRemove = Keyboard.getNodeToRemove(rangyInstance.range, target)
    if (nodeToRemove) nodeToRemove.remove()
  }

  static getNodeToRemove (selectionRange, target) {
    // This function is only used by preventContenteditableBug. It is exposed on
    // the Keyboard constructor for testing purpose only.

    // Let's make sure we are in the edge-case, in which the bug happens.
    // The selection does not start at the beginning of a node. We have
    // nothing to do.
    if (selectionRange.startOffset !== 0) return

    let startNodeElement = selectionRange.startContainer

    // If the node is a textNode, we select its parent.
    if (startNodeElement.nodeType === nodeType.textNode) startNodeElement = startNodeElement.parentNode

    // The target is the contenteditable element, which we do not want to replace
    if (startNodeElement === target) return

    // We get a range that contains everything within the sartNodeElement to test
    // if the selectionRange is within the startNode, we have nothing to do.
    const startNodeRange = rangy.createRange()
    startNodeRange.setStartBefore(startNodeElement.firstChild)
    startNodeRange.setEndAfter(startNodeElement.lastChild)
    if (startNodeRange.containsRange(selectionRange)) return

    // If the selectionRange.startContainer was a textNode, we have to make sure
    // that its parent's content starts with this node. Content is either a
    // text node or an element. This is done to avoid false positives like the
    // following one:
    // <strong>foo<em>bar</em>|baz</strong>quux|
    if (selectionRange.startContainer.nodeType === nodeType.textNode) {
      const contentNodeTypes = [nodeType.textNode, nodeType.elementNode]
      let firstContentNode = startNodeElement.firstChild

      do {
        if (contentNodeTypes.indexOf(firstContentNode.nodeType) !== -1) break
      } while ((firstContentNode = firstContentNode.nextSibling))

      if (firstContentNode !== selectionRange.startContainer) return
    }

    // Now we know, that we have to return at lease the startNodeElement for
    // removal. But it could be, that we also need to remove its parent, e.g.
    // we need to remove <strong> in the following example:
    // <strong><em>|foo</em>bar</strong>baz|
    const rangeStatingBeforeCurrentElement = selectionRange.cloneRange()
    rangeStatingBeforeCurrentElement.setStartBefore(startNodeElement)

    return Keyboard.getNodeToRemove(
      rangeStatingBeforeCurrentElement,
      target
    ) || startNodeElement
  }
}

Keyboard.key = Keyboard.prototype.key = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  tab: 9,
  esc: 27,
  backspace: 8,
  delete: 46,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18
}

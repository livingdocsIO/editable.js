var rangy = require('rangy')

var browserFeatures = require('./feature-detection')
var nodeType = require('./node-type')
var eventable = require('./eventable')

/**
 * The Keyboard module defines an event API for key events.
 */
var Keyboard = function (selectionWatcher) {
  eventable(this)
  this.selectionWatcher = selectionWatcher
}

module.exports = Keyboard

Keyboard.prototype.dispatchKeyEvent = function (event, target, notifyCharacterEvent) {
  switch (event.keyCode) {
    case this.key.left:
      this.notify(target, 'left', event)
      break

    case this.key.right:
      this.notify(target, 'right', event)
      break

    case this.key.up:
      this.notify(target, 'up', event)
      break

    case this.key.down:
      this.notify(target, 'down', event)
      break

    case this.key.tab:
      if (event.shiftKey) {
        this.notify(target, 'shiftTab', event)
      } else {
        this.notify(target, 'tab', event)
      }
      break

    case this.key.esc:
      this.notify(target, 'esc', event)
      break

    case this.key.backspace:
      this.preventContenteditableBug(target, event)
      this.notify(target, 'backspace', event)
      break

    case this.key['delete']:
      this.preventContenteditableBug(target, event)
      this.notify(target, 'delete', event)
      break

    case this.key.enter:
      if (event.shiftKey) {
        this.notify(target, 'shiftEnter', event)
      } else {
        this.notify(target, 'enter', event)
      }
      break
    case this.key.ctrl:
    case this.key.shift:
    case this.key.alt:
      break
    // Metakey
    case 224: // Firefox: 224
    case 17: // Opera: 17
    case 91: // Chrome/Safari: 91 (Left)
    case 93: // Chrome/Safari: 93 (Right)
      break
    default:
      this.preventContenteditableBug(target, event)
      if (notifyCharacterEvent) {
        // Don't notify character events as long as either the ctrl or
        // meta key are pressed.
        // see: https://github.com/upfrontIO/editable.js/pull/125
        if (!event.ctrlKey && !event.metaKey) {
          this.notify(target, 'character', event)
        }
      }
  }
}

Keyboard.prototype.preventContenteditableBug = function (target, event) {
  if (browserFeatures.contenteditableSpanBug) {
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
    var rangyInstance = this.selectionWatcher.getFreshRange()
    if (!rangyInstance.isSelection) {
      return
    }

    var nodeToRemove = Keyboard.getNodeToRemove(rangyInstance.range, target)

    if (nodeToRemove) {
      nodeToRemove.remove()
    }
  }
}

Keyboard.prototype.key = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  tab: 9,
  esc: 27,
  backspace: 8,
  'delete': 46,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18
}

Keyboard.key = Keyboard.prototype.key

Keyboard.getNodeToRemove = function (selectionRange, target) {
  // This function is only used by preventContenteditableBug. It is exposed on
  // the Keyboard constructor for testing purpose only.

  // Let's make sure we are in the edge-case, in which the bug happens.
  if (selectionRange.startOffset !== 0) {
    // The selection does not start at the beginning of a node. We have
    // nothing to do.
    return
  }

  var startNodeElement = selectionRange.startContainer

  // If the node is a textNode, we select its parent.
  if (startNodeElement.nodeType === nodeType.textNode) {
    startNodeElement = startNodeElement.parentNode
  }

  // The target is the contenteditable element, which we do not want to replace
  if (startNodeElement === target) {
    return
  }

  // We get a range that contains everything within the sartNodeElement to test
  // if the selectionRange is within the startNode, we have nothing to do.
  var startNodeRange = rangy.createRange()
  startNodeRange.setStartBefore(startNodeElement.firstChild)
  startNodeRange.setEndAfter(startNodeElement.lastChild)
  if (startNodeRange.containsRange(selectionRange)) {
    return
  }

  // If the selectionRange.startContainer was a textNode, we have to make sure
  // that its parent's content starts with this node. Content is either a
  // text node or an element. This is done to avoid false positives like the
  // following one:
  // <strong>foo<em>bar</em>|baz</strong>quux|
  if (selectionRange.startContainer.nodeType === nodeType.textNode) {
    var contentNodeTypes = [nodeType.textNode, nodeType.elementNode]
    var firstContentNode = startNodeElement.firstChild
    do {
      if (contentNodeTypes.indexOf(firstContentNode.nodeType) !== -1) {
        break
      }
    } while ((firstContentNode = firstContentNode.nextSibling))

    if (firstContentNode !== selectionRange.startContainer) {
      return
    }
  }

  // Now we know, that we have to return at lease the startNodeElement for
  // removal. But it could be, that we also need to remove its parent, e.g.
  // we need to remove <strong> in the following example:
  // <strong><em>|foo</em>bar</strong>baz|
  var rangeStatingBeforeCurrentElement = selectionRange.cloneRange()
  rangeStatingBeforeCurrentElement.setStartBefore(startNodeElement)

  return Keyboard.getNodeToRemove(
    rangeStatingBeforeCurrentElement,
    target
  ) || startNodeElement
}

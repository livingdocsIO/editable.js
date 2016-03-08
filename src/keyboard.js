var browserFeatures = require('./feature-detection');
var nodeType = require('./node-type');
var eventable = require('./eventable');

/**
 * The Keyboard module defines an event API for key events.
 */
var Keyboard = function(selectionWatcher) {
  eventable(this);
  this.selectionWatcher = selectionWatcher;
};

module.exports = Keyboard;

Keyboard.prototype.dispatchKeyEvent = function(event, target, notifyCharacterEvent) {
  switch (event.keyCode) {

  case this.key.left:
    this.notify(target, 'left', event);
    break;

  case this.key.right:
    this.notify(target, 'right', event);
    break;

  case this.key.up:
    this.notify(target, 'up', event);
    break;

  case this.key.down:
    this.notify(target, 'down', event);
    break;

  case this.key.tab:
    if (event.shiftKey) {
      this.notify(target, 'shiftTab', event);
    } else {
      this.notify(target, 'tab', event);
    }
    break;

  case this.key.esc:
    this.notify(target, 'esc', event);
    break;

  case this.key.backspace:
    this.preventContenteditableBug(target, event);
    this.notify(target, 'backspace', event);
    break;

  case this.key['delete']:
    this.preventContenteditableBug(target, event);
    this.notify(target, 'delete', event);
    break;

  case this.key.enter:
    if (event.shiftKey) {
      this.notify(target, 'shiftEnter', event);
    } else {
      this.notify(target, 'enter', event);
    }
    break;
  case this.key.ctrl:
  case this.key.shift:
  case this.key.alt:
    break;
  // Metakey
  case 224: // Firefox: 224
  case 17: // Opera: 17
  case 91: // Chrome/Safari: 91 (Left)
  case 93: // Chrome/Safari: 93 (Right)
    break;
  default:
    this.preventContenteditableBug(target, event);
    if (notifyCharacterEvent) {

      // Don't notify character events as long as either the ctrl or
      // meta key are pressed.
      // see: https://github.com/upfrontIO/editable.js/pull/125
      if (!event.ctrlKey && !event.metaKey) {
        this.notify(target, 'character', event);
      }
    }
  }
};

Keyboard.prototype.preventContenteditableBug = function(target, event) {
  if (browserFeatures.contenteditableSpanBug) {
    if (event.ctrlKey || event.metaKey) return;

    // This fixes a strange webkit bug that can be reproduced as follows:
    //
    // 1. A node used within a contenteditable has some style, e.g through the
    //    following CSS:
    //
    //      strong {
    //        color: red;
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
    // We insert a &nbsp; in front of the node and select it before the
    // key-pressed event is applied by the editor.
    var range = this.selectionWatcher.getFreshRange();

    if (range.isSelection) {
      var startNode, endNode, rangyRange = range.range;

      // Let's make sure we are in the edge-case, in which the bug happens.
      if (rangyRange.startOffset !== 0) {
        // The selection does not start at the beginning of a node. We have
        // nothing to do.
        return;
      }

      // Lets get the node in which the selection starts.
      if (rangyRange.startContainer.nodeType === nodeType.textNode) {
        startNode = rangyRange.startContainer.parentNode;
      } else if (rangyRange.startContainer.nodeType === nodeType.elementNode) {
        startNode = rangyRange.startContainer;
      }

      if (!startNode || startNode === target) {
        // The node is the contenteditable node. We have nothing to do.
        return;
      }

      // Lets get the node in which the selection ends.
      if (rangyRange.endContainer.nodeType === nodeType.textNode) {
        endNode = rangyRange.endContainer.parentNode;
      } else if (rangyRange.endContainer.nodeType === nodeType.elementNode) {
        endNode = rangyRange.endContainer;
      } else {
        // This should not happen.
        return;
      }

      if (endNode && endNode === startNode) {
        // The selection ends within the node it started, we have nothing to do.
        return;
      }

      // Let's see if the endNode is within the startNode
      var endNodeContainer = $(endNode).closest([target, startNode]);
      if (endNodeContainer[0] === startNode) {
        // The endNode is within the startNode, we have nothing to do.
        return;
      }

      // Now we are sure, we are in the edge case, in which Webkit behaves
      // strangely. We can simply remove the startNode.
      var parentNode = startNode.parentNode;
      startNode.remove();

      // We recursively call the bugfix in case our &nbsp; now is the first
      // character of a styled element, e.g.
      //    <p contenteditable="true">
      //      Hello <em>&nbsp;<strong>very</strong>big</em> beautiful world
      //    </p>
      this.preventContenteditableBug(target, event);
    }
  }
};

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
};

Keyboard.key = Keyboard.prototype.key;

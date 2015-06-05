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
    this.preventContenteditableBug(target);
    this.notify(target, 'backspace', event);
    break;

  case this.key['delete']:
    this.preventContenteditableBug(target);
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
    this.preventContenteditableBug(target);
    if (notifyCharacterEvent) {
      this.notify(target, 'character', event);
    }
  }
};

Keyboard.prototype.preventContenteditableBug = function(target) {
  if (browserFeatures.contenteditableSpanBug) {
    var range = this.selectionWatcher.getFreshRange();
    if (range.isSelection) {
      var nodeToCheck, rangyRange = range.range;

      // Webkits contenteditable inserts spans when there is a
      // styled node that starts just outside of the selection and
      // is contained in the selection and followed by other textNodes.
      // So first we check if we have a node just at the beginning of the
      // selection. And if so we delete it before Chrome can do its magic.
      if (rangyRange.startOffset === 0) {
        if (rangyRange.startContainer.nodeType === nodeType.textNode) {
          nodeToCheck = rangyRange.startContainer.parentNode;
        } else if (rangyRange.startContainer.nodeType === nodeType.elementNode) {
          nodeToCheck = rangyRange.startContainer;
        }
      }

      if (nodeToCheck && nodeToCheck !== target && rangyRange.containsNode(nodeToCheck, true)) {
        nodeToCheck.remove();
      }
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

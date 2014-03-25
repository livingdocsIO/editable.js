/**
 * The Keyboard module defines an event API for key events.
 * @module core
 * @submodule keyboard
 */

var Keyboard = function() {
  eventable(this);
};

Keyboard.prototype.dispatchKeyEvent = function(event, target) {
  switch (event.keyCode) {

  case this.key.left:
    this.notify('left', target, event);
    break;

  case this.key.right:
    this.notify('right', target, event);
    break;

  case this.key.up:
    this.notify('up', target, event);
    break;

  case this.key.down:
    this.notify('down', target, event);
    break;

  case this.key.tab:
    if (event.shiftKey) {
      this.notify('shiftTab', target, event);
    } else {
      this.notify('tab', target, event);
    }
    break;

  case this.key.esc:
    this.notify('esc', target, event);
    break;

  case this.key.backspace:
    this.notify('backspace', target, event);
    break;

  case this.key['delete']:
    this.notify('delete', target, event);
    break;

  case this.key.enter:
    if (event.shiftKey) {
      this.notify('shiftEnter', target, event);
    } else {
      this.notify('enter', target, event);
    }
    break;

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
  enter: 13
};

Keyboard.key = Keyboard.prototype.key;

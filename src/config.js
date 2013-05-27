(function() {
  /**
   * Defines all supported event types by Editable.JS and provides default
   * implementations for them defined in {{#crossLink "Behavior"}}{{/crossLink}}
   *
   * @property config
   * @for  Editable
   * @type {Object}
   */
  Editable.config = {
    log: true,
    cssClass: '-js-editable',
    cssClassDisabled: '-js-editable-disabled',

    event: {
      /**
       * The focus event is triggered when an element gains focus.
       * The default behavior is to... TODO
       *
       * @event focus
       * @param {HTMLElement} element The element triggering the event.
       */
      focus: function(element) {
        behavior.focus(element);
      },

      /**
       * The blur event is triggered when an element looses focus.
       * The default behavior is to... TODO
       *
       * @event blur
       * @param {HTMLElement} element The element triggering the event.
       */
      blur: function(element) {
        behavior.blur(element);
      },

      /**
       * The flow event is triggered when the user starts typing or pause typing.
       * The default behavior is to... TODO
       *
       * @event flow
       * @param {HTMLElement} element The element triggering the event.
       * @param {String} action The flow action: "start" or "pause".
       */
      flow: function(element, action) {
        behavior.flow(element, action);
      },

      /**
       * The selection event is triggered after the user has selected some
       * content.
       * The default behavior is to... TODO
       *
       * @event selection
       * @param {HTMLElement} element The element triggering the event.
       * @param {Selection} selection The actual Selection object.
       */
      selection: function(element, selection) {
        behavior.selection(element, selection);
      },

      /**
       * The cursor event is triggered after cursor position has changed.
       * The default behavior is to... TODO
       *
       * @event cursor
       * @param {HTMLElement} element The element triggering the event.
       * @param {Cursor} cursor The actual Cursor object.
       */
      cursor: function(element, cursor) {
        behavior.cursor(element, cursor);
      },

      /**
       * The newline event is triggered when a newline should be inserted. This
       * happens when SHIFT+ENTER key is pressed.
       * The default behavior is to add a <br />
       *
       * @event newline
       * @param {HTMLElement} element The element triggering the event.
       * @param {Cursor} cursor The actual cursor object.
       */
      newline: function(element, cursor) {
        behavior.newline(element, cursor);
      },

      /**
       * The insert event is triggered when a new block should be inserted. This
       * happens when ENTER key is pressed at the beginning of a block (should
       * insert before) or at the end of a block (should insert after).
       * The default behavior is to... TODO
       *
       * @event insert
       * @param {HTMLElement} element The element triggering the event.
       * @param {String} direction The insert direction: "before" or "after".
       */
      insert: function(element, direction) {
        behavior.insert(element, direction);
      },

      /**
       * The split event is triggered when a block should be splitted into two
       * blocks. This happens when ENTER is pressed within a non-empty block.
       * The default behavior is to... TODO
       *
       * @event split
       * @param {HTMLElement} element The element triggering the event.
       * @param {Cursor} cursor The actual cursor object.
       * @param {String} before The HTML string before the split.
       * @param {String} after The HTML string after the split.
       */
      split: function(element, cursor, before, after) {
        behavior.split(element, cursor, before, after);
      },

      /**
       * The merge event is triggered when two needs to be merged. This happens
       * when BACKSPACE is pressed at the beginning of a block (should merge with
       * the preceeding block) or DEL is pressed at the end of a block (should
       * merge with the following block).
       * The default behavior is to... TODO
       *
       * @event merge
       * @param {HTMLElement} element The element triggering the event.
       * @param {String} direction The merge direction: "before" or "after".
       */
      merge: function(element, direction) {
        behavior.merge(element, direction);
      },

      /**
       * The empty event is triggered when a block is emptied.
       * The default behavior is to... TODO
       *
       * @event empty
       * @param {HTMLElement} element The element triggering the event.
       */
      empty: function(element) {
        behavior.empty(element);
      },

      /**
       * The switch event is triggered when the user switches to another block.
       * This happens when TAB is pressed (move one block after) or SHIFT+TAB
       * is pressed (move one block before).
       * The default behavior is to... TODO
       *
       * @event switch
       * @param {HTMLElement} element The element triggering the event.
       * @param {String} direction The switch direction: "before" or "after".
       */
      'switch': function(element, direction) {
        behavior.switch(element, direction);
      },

      /**
       * The move event is triggered when the user moves a selection in a block.
       * This happens when the user selects some (or all) content in a block and
       * an ARROW key is pressed (up: drag before, down: drag after).
       * The default behavior is to... TODO
       *
       * @event move
       * @param {HTMLElement} element The element triggering the event.
       * @param {Selection} selection The actual Selection object.
       * @param {String} direction The move direction: "before" or "after".
       */
      move: function(element, selection, direction) {
        behavior.move(element, selection, direction);
      },

      /**
       * The clipboard event is triggered when the user copies, pastes or cuts
       * a selection within a block.
       * The default behavior is to... TODO
       *
       * @event clipboard
       * @param {HTMLElement} element The element triggering the event.
       * @param {Selection} selection The actual Selection object.
       * @param {String} action The clipboard action: "copy", "paste", "cut".
       */
      clipboard: function(element, selection, action) {
        behavior.move(element, selection, action);
      }
    }
  };
})();

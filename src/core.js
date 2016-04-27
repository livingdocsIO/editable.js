import $ from 'jquery'
import rangy from 'rangy'

import * as config from './config'
import error from './util/error'
import * as parser from './parser'
import * as content from './content'
import * as clipboard from './clipboard'
import Dispatcher from './dispatcher'
import Cursor from './cursor'
import Spellcheck from './spellcheck'
import createDefaultEvents from './create-default-events'
import { browser } from 'bowser'

/**
 * The Core module provides the Editable class that defines the Editable.JS
 * API and is the main entry point for Editable.JS.
 * It also provides the cursor module for cross-browser cursors, and the dom
 * submodule.
 *
 * @module core
 */

/**
 * Constructor for the Editable.JS API that is externally visible.
 *
 * @param {Object} configuration for this editable instance.
 *   window: The window where to attach the editable events.
 *   defaultBehavior: {Boolean} Load default-behavior.js.
 *   mouseMoveSelectionChanges: {Boolean} Whether to get cursor and selection events on mousemove.
 *   browserSpellcheck: {Boolean} Set the spellcheck attribute on editable elements
 *
 * @class Editable
 */

const Editable = module.exports = class Editable {
  constructor (instanceConfig) {
    const defaultInstanceConfig = {
      window: window,
      defaultBehavior: true,
      mouseMoveSelectionChanges: false,
      browserSpellcheck: true
    }

    this.config = $.extend(defaultInstanceConfig, instanceConfig)
    this.win = this.config.window
    this.editableSelector = '.' + config.editableClass

    if (!rangy.initialized) {
      rangy.init()
    }

    this.dispatcher = new Dispatcher(this)
    if (this.config.defaultBehavior === true) {
      this.dispatcher.on(createDefaultEvents(this))
    }
  }

  /**
  * Set configuration options that affect all editable
  * instances.
  *
  * @param {Object} global configuration options (defaults are defined in config.js)
  *   log: {Boolean}
  *   logErrors: {Boolean}
  *   editableClass: {String} e.g. 'js-editable'
  *   editableDisabledClass: {String} e.g. 'js-editable-disabled'
  *   pastingAttribute: {String} default: e.g. 'data-editable-is-pasting'
  *   boldTag: e.g. '<strong>'
  *   italicTag: e.g. '<em>'
  */
  static globalConfig (globalConfig) {
    $.extend(config, globalConfig)
    clipboard.updateConfig(config)
  }

  /**
   * Adds the Editable.JS API to the given target elements.
   * Opposite of {{#crossLink "Editable/remove"}}{{/crossLink}}.
   * Calls dispatcher.setup to setup all event listeners.
   *
   * @method add
   * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
   *    array of HTMLElement or a query selector representing the target where
   *    the API should be added on.
   * @chainable
   */
  add (target) {
    this.enable($(target))
    // todo: check css whitespace settings
    return this
  }

  /**
   * Removes the Editable.JS API from the given target elements.
   * Opposite of {{#crossLink "Editable/add"}}{{/crossLink}}.
   *
   * @method remove
   * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
   *    array of HTMLElement or a query selector representing the target where
   *    the API should be removed from.
   * @chainable
   */
  remove (target) {
    const $target = $(target)
    this.disable($target)
    $target.removeClass(config.editableDisabledClass)
    return this
  }

  /**
  * Removes the Editable.JS API from the given target elements.
  * The target elements are marked as disabled.
  *
  * @method disable
  * @param { jQuery element | undefined  } target editable root element(s)
  *    If no param is specified all editables are disabled.
  * @chainable
  */
  disable ($elem) {
    const body = this.win.document.body
    $elem = $elem || $('.' + config.editableClass, body)

    $elem
    .removeAttr('contenteditable spellcheck')
    .removeClass(config.editableClass)
    .addClass(config.editableDisabledClass)

    return this
  }

  /**
  * Adds the Editable.JS API to the given target elements.
  *
  * @method enable
  * @param { jQuery element | undefined } target editable root element(s)
  *    If no param is specified all editables marked as disabled are enabled.
  * @chainable
  */
  enable ($elem, normalize) {
    const body = this.win.document.body
    $elem = $elem || $('.' + config.editableDisabledClass, body)

    $elem
    .attr({
      contenteditable: true,
      spellcheck: this.config.browserSpellcheck
    })
    .removeClass(config.editableDisabledClass)
    .addClass(config.editableClass)

    if (normalize) $elem.each((i, el) => content.tidyHtml(el))

    return this
  }

  /**
  * Temporarily disable an editable.
  * Can be used to prevent text selction while dragging an element
  * for example.
  *
  * @method suspend
  * @param jQuery object
  */
  suspend ($elem) {
    const body = this.win.document.body
    $elem = $elem || $('.' + config.editableClass, body)

    $elem.removeAttr('contenteditable')
    return this
  }

  /**
  * Reverse the effects of suspend()
  *
  * @method continue
  * @param jQuery object
  */
  continue ($elem) {
    const body = this.win.document.body
    $elem = $elem || $('.' + config.editableClass, body)

    $elem.attr('contenteditable', true)
    return this
  }
  /**
   * Set the cursor inside of an editable block.
   *
   * @method createCursor
   * @param position 'beginning', 'end', 'before', 'after'
   */

  createCursor (element, position = 'beginning') {
    const $host = $(element).closest(this.editableSelector)

    if (!$host.length) return undefined

    const range = rangy.createRange()

    if (position === 'beginning' || position === 'end') {
      range.selectNodeContents(element)
      range.collapse(position === 'beginning')
    } else if (element !== $host[0]) {
      if (position === 'before') {
        range.setStartBefore(element)
        range.setEndBefore(element)
      } else if (position === 'after') {
        range.setStartAfter(element)
        range.setEndAfter(element)
      }
    } else {
      error('EditableJS: cannot create cursor outside of an editable block.')
    }

    return new Cursor($host[0], range)
  }

  createCursorAtBeginning (element) {
    return this.createCursor(element, 'beginning')
  }

  createCursorAtEnd (element) {
    return this.createCursor(element, 'end')
  }

  createCursorBefore (element) {
    return this.createCursor(element, 'before')
  }

  createCursorAfter (element) {
    return this.createCursor(element, 'after')
  }

  /**
   * Extract the content from an editable host or document fragment.
   * This method will remove all internal elements and ui-elements.
   *
   * @param {DOM node or Document Fragment} The innerHTML of this element or fragment will be extracted.
   * @returns {String} The cleaned innerHTML.
   */
  getContent (element) {
    return content.extractContent(element)
  }

  /**
   * @param {String | DocumentFragment} content to append.
   * @returns {Cursor} A new Cursor object just before the inserted content.
   */
  appendTo (inputElement, contentToAppend) {
    const element = content.adoptElement(inputElement, this.win.document)

    const cursor = this.createCursor(element, 'end')
    // todo: create content in the right window
    cursor.insertAfter(typeof contentToAppend === 'string'
      ? content.createFragmentFromString(contentToAppend)
      : contentToAppend
    )
    return cursor
  }

  /**
   * @param {String | DocumentFragment} content to prepend
   * @returns {Cursor} A new Cursor object just after the inserted content.
   */
  prependTo (inputElement, contentToPrepend) {
    const element = content.adoptElement(inputElement, this.win.document)

    const cursor = this.createCursor(element, 'beginning')
    // todo: create content in the right window
    cursor.insertBefore(typeof contentToPrepend === 'string'
      ? content.createFragmentFromString(contentToPrepend)
      : contentToPrepend
    )
    return cursor
  }

  /**
   * Get the current selection.
   * Only returns something if the selection is within an editable element.
   * If you pass an editable host as param it only returns something if the selection is inside this
   * very editable element.
   *
   * @param {DOMNode} Optional. An editable host where the selection needs to be contained.
   * @returns A Cursor or Selection object or undefined.
   */
  getSelection (editableHost) {
    let selection = this.dispatcher.selectionWatcher.getFreshSelection()
    if (!(editableHost && selection)) return selection

    var range = selection.range
    // Check if the selection is inside the editableHost
    // The try...catch is required if the editableHost was removed from the DOM.
    try {
      if (range.compareNode(editableHost) !== range.NODE_BEFORE_AND_AFTER) {
        selection = undefined
      }
    } catch (e) {
      selection = undefined
    }

    return selection
  }

  /**
   * Enable spellchecking
   *
   * @chainable
   */
  setupSpellcheck (spellcheckConfig) {
    this.spellcheck = new Spellcheck(this, spellcheckConfig)

    return this
  }

  /**
   * Subscribe a callback function to a custom event fired by the API.
   *
   * @param {String} event The name of the event.
   * @param {Function} handler The callback to execute in response to the
   *     event.
   *
   * @chainable
   */
  on (event, handler) {
    // TODO throw error if event is not one of EVENTS
    // TODO throw error if handler is not a function
    this.dispatcher.on(event, handler)
    return this
  }

  /**
   * Unsubscribe a callback function from a custom event fired by the API.
   * Opposite of {{#crossLink "Editable/on"}}{{/crossLink}}.
   *
   * @param {String} event The name of the event.
   * @param {Function} handler The callback to remove from the
   *     event or the special value false to remove all callbacks.
   *
   * @chainable
   */
  off (...args) {
    this.dispatcher.off.apply(this.dispatcher, args)
    return this
  }

  /**
   * Unsubscribe all callbacks and event listeners.
   *
   * @chainable
   */
  unload () {
    this.dispatcher.unload()
    return this
  }
}

// Expose modules and editable
Editable.parser = parser
Editable.content = content
Editable.browser = browser

// Set up callback functions for several events.
;['focus', 'blur', 'flow', 'selection', 'cursor', 'newline',
  'insert', 'split', 'merge', 'empty', 'change', 'switch',
  'move', 'clipboard', 'paste'
].forEach((name) => {
  // Generate a callback function to subscribe to an event.
  Editable.prototype[name] = function (handler) {
    return this.on(name, handler)
  }
})

var $ = require('jquery')

import Cursor from './cursor'
import * as content from './content'
import * as parser from './parser'
import * as config from './config'

/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */
/**
 * Class that represents a selection and provides functionality to access or
 * modify the selection.
 *
 * @class Selection
 * @constructor
 */

export default class Selection extends Cursor {
  constructor () {
    super(...arguments)
    delete this.isCursor
    this.isSelection = true
  }

  /**
  * Get the text inside the selection.
  *
  * @method text
  */
  text () {
    return this.range.toString()
  }

  /**
  * Get the html inside the selection.
  *
  * @method html
  */
  html () {
    return this.range.toHtml()
  }

  /**
  *
  * @method isAllSelected
  */
  isAllSelected () {
    return parser.isBeginningOfHost(
      this.host,
      this.range.startContainer,
      this.range.startOffset
    ) && parser.isTextEndOfHost(
      this.host,
      this.range.endContainer,
      this.range.endOffset
    )
  }

  /**
  * Get the ClientRects of this selection.
  * Use this if you want more precision than getBoundingClientRect can give.
  */
  getRects () {
    // todo: translate into absolute positions
    // just like Cursor#getCoordinates()
    return this.range.nativeRange.getClientRects()
  }

  /**
  *
  * @method link
  */
  link (href, attrs = {}) {
    const $link = $(this.createElement('a'))
    if (href) attrs.href = href
    $link.attr(attrs)
    this.forceWrap($link[0])
  }

  unlink () {
    this.removeFormatting('a')
  }

  toggleLink (href, attrs) {
    const links = this.getTagsByName('a')
    if (links.length >= 1) {
      const firstLink = links[0]
      if (this.isExactSelection(firstLink, 'visible')) {
        this.unlink()
      } else {
        this.expandTo(firstLink)
      }
    } else {
      this.link(href, attrs)
    }
  }

  toggle (elem) {
    elem = this.adoptElement(elem)
    this.range = content.toggleTag(this.host, this.range, elem)
    this.setSelection()
  }

  /**
  *
  * @method makeBold
  */
  makeBold () {
    const bold = this.createElement(config.boldTag)
    this.forceWrap(bold)
  }

  toggleBold () {
    const bold = this.createElement(config.boldTag)
    this.toggle(bold)
  }

  /**
  *
  * @method giveEmphasis
  */
  giveEmphasis () {
    const em = this.createElement(config.italicTag)
    this.forceWrap(em)
  }

  toggleEmphasis () {
    const em = this.createElement(config.italicTag)
    this.toggle(em)
  }

  /**
  * Surround the selection with characters like quotes.
  *
  * @method surround
  * @param {String} E.g. '«'
  * @param {String} E.g. '»'
  */
  surround (startCharacter, endCharacter) {
    this.range = content.surround(this.host, this.range, startCharacter, endCharacter)
    this.setSelection()
  }

  removeSurround (startCharacter, endCharacter) {
    this.range = content.deleteCharacter(this.host, this.range, startCharacter)
    this.range = content.deleteCharacter(this.host, this.range, endCharacter)
    this.setSelection()
  }

  toggleSurround (startCharacter, endCharacter) {
    if (this.containsString(startCharacter) &&
    this.containsString(endCharacter)) {
      this.removeSurround(startCharacter, endCharacter)
    } else {
      this.surround(startCharacter, endCharacter)
    }
  }

  /**
  * @method removeFormatting
  * @param {String} tagName. E.g. 'a' to remove all links.
  */
  removeFormatting (tagName) {
    this.range = content.removeFormatting(this.host, this.range, tagName)
    this.setSelection()
  }

  /**
  * Delete the contents inside the range. After that the selection will be a
  * cursor.
  *
  * @method deleteContent
  * @return Cursor instance
  */
  deleteContent () {
    this.range.deleteContents()
    return new Cursor(this.host, this.range)
  }

  /**
  * Expand the current selection.
  *
  * @method expandTo
  * @param {DOM Node}
  */
  expandTo (elem) {
    this.range = content.expandTo(this.host, this.range, elem)
    this.setSelection()
  }

  /**
  *  Collapse the selection at the beginning of the selection
  *
  *  @return Cursor instance
  */
  collapseAtBeginning (elem) {
    this.range.collapse(true)
    this.setSelection()
    return new Cursor(this.host, this.range)
  }

  /**
  *  Collapse the selection at the end of the selection
  *
  *  @return Cursor instance
  */
  collapseAtEnd (elem) {
    this.range.collapse(false)
    this.setSelection()
    return new Cursor(this.host, this.range)
  }

  /**
  * Wrap the selection with the specified tag. If any other tag with
  * the same tagName is affecting the selection this tag will be
  * remove first.
  *
  * @method forceWrap
  */
  forceWrap (elem) {
    elem = this.adoptElement(elem)
    this.range = content.forceWrap(this.host, this.range, elem)
    this.setSelection()
  }

  /**
  * Get all tags that affect the current selection. Optionally pass a
  * method to filter the returned elements.
  *
  * @method getTags
  * @param {Function filter(node)} [Optional] Method to filter the returned
  *   DOM Nodes.
  * @return {Array of DOM Nodes}
  */
  getTags (filterFunc) {
    return content.getTags(this.host, this.range, filterFunc)
  }

  /**
  * Get all tags of the specified type that affect the current selection.
  *
  * @method getTagsByName
  * @param {String} tagName. E.g. 'a' to get all links.
  * @return {Array of DOM Nodes}
  */
  getTagsByName (tagName) {
    return content.getTagsByName(this.host, this.range, tagName)
  }

  /**
  * Check if the selection is the same as the elements contents.
  *
  * @method isExactSelection
  * @param {DOM Node}
  * @param {flag:  undefined or 'visible'} if 'visible' is passed
  *   whitespaces at the beginning or end of the selection will
  *   be ignored.
  * @return {Boolean}
  */
  isExactSelection (elem, onlyVisible) {
    return content.isExactSelection(this.range, elem, onlyVisible)
  }

  /**
  * Check if the selection contains the passed string.
  *
  * @method containsString
  * @return {Boolean}
  */
  containsString (str) {
    return content.containsString(this.range, str)
  }

  /**
  * Delete all occurences of the specified character from the
  * selection.
  *
  * @method deleteCharacter
  */
  deleteCharacter (character) {
    this.range = content.deleteCharacter(this.host, this.range, character)
    this.setSelection()
  }
}

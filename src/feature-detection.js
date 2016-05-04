import { browser } from 'bowser'

/**
* Check for contenteditable support
*
* (from Modernizr)
* this is known to false positive in some mobile browsers
* here is a whitelist of verified working browsers:
* https://github.com/NielsLeenheer/html5test/blob/549f6eac866aa861d9649a0707ff2c0157895706/scripts/engine.js#L2083
*/
export const contenteditable = typeof document.documentElement.contentEditable !== 'undefined'

/**
 * Check selectionchange event (currently supported in IE, Chrome and Safari)
 *
 * To handle selectionchange in firefox see CKEditor selection object
 * https://github.com/ckeditor/ckeditor-dev/blob/master/core/selection.js#L388
 */
 // not exactly feature detection... is it?
export const selectionchange = !(browser.gecko || browser.opera)

// See Keyboard.prototype.preventContenteditableBug for more information.
export const contenteditableSpanBug = !!browser.webkit

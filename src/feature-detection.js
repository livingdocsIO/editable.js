import browser from 'bowser'

/**
* Check for contenteditable support
*
* (from Modernizr)
* this is known to false positive in some mobile browsers
* here is a whitelist of verified working browsers:
* https://github.com/NielsLeenheer/html5test/blob/549f6eac866aa861d9649a0707ff2c0157895706/scripts/engine.js#L2083
*/
export const contenteditable = typeof document.documentElement.contentEditable !== 'undefined'

const parser = browser.getParser(window.navigator.userAgent)
const browserName = parser.getBrowser()
const browserEngine = parser.getEngineName()
const webKit = browserEngine === 'WebKit'

/**
 * Check selectionchange event (currently supported in IE, Chrome, Firefox and Safari)
 * Firefox supports it since version 52 (2017) so pretty sure this is fine.
 */
// not exactly feature detection... is it?
export const selectionchange = !(browserName === 'Opera')

// See Keyboard.prototype.preventContenteditableBug for more information.
export const contenteditableSpanBug = !!webKit

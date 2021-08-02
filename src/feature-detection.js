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
const browserEngine = parser.getEngineName()
const webKit = browserEngine === 'WebKit'

/**
 * Check selectionchange event (supported in IE, Chrome, Firefox and Safari)
 * Firefox supports it since version 52 (2017).
 * Opera has no support as of 2021.
 */
const hasNativeSelectionchangeSupport = (document) => {
  const doc = document
  const osc = doc.onselectionchange
  if (osc !== undefined) {
    try {
      doc.onselectionchange = 0
      return doc.onselectionchange === null
    } catch (e) {
    } finally {
      doc.onselectionchange = osc
    }
  }
  return false
}

export const selectionchange = hasNativeSelectionchangeSupport(document)

// See Keyboard.prototype.preventContenteditableBug for more information.
export const contenteditableSpanBug = !!webKit

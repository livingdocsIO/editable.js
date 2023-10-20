/**
* Check for contenteditable support
*
* (from Modernizr)
* this is known to false positive in some mobile browsers
* here is a whitelist of verified working browsers:
* https://github.com/NielsLeenheer/html5test/blob/549f6eac866aa861d9649a0707ff2c0157895706/scripts/engine.js#L2083
*/
export const contenteditable = typeof document.documentElement.contentEditable !== 'undefined'

// Detect webkit browser engine
// That way we can detect the contenteditable span bug on safari, but exclude chrome
// Regex taken from: https://github.com/lancedikson/bowser/blob/f09411489ced05811c91cc6670a8e4ca9cbe39a7/src/parser-engines.js#L93-L106
// Attention, this might be error prone as any engine version change breaks this.
const isBlink = /(apple)?webkit\/537\.36/i.test(window.navigator.userAgent)
const isWebkit = /(apple)?webkit/i.test(window.navigator.userAgent)
const webKit = !isBlink && isWebkit

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

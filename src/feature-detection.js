module.exports = (function() {
  /**
   * Check for contenteditable support
   *
   * (from Modernizr)
   * this is known to false positive in some mobile browsers
   * here is a whitelist of verified working browsers:
   * https://github.com/NielsLeenheer/html5test/blob/549f6eac866aa861d9649a0707ff2c0157895706/scripts/engine.js#L2083
   */
  var contenteditable = typeof document.documentElement.contentEditable !== 'undefined';

  /**
   * Check selectionchange event (currently supported in IE, Chrome and Safari)
   *
   * To handle selectionchange in firefox see CKEditor selection object
   * https://github.com/ckeditor/ckeditor-dev/blob/master/core/selection.js#L388
   */
  var selectionchange = (function() {

    // not exactly feature detection... is it?
    return !(bowser.gecko || bowser.opera);
  })();


  // Chrome contenteditable bug when inserting a character with a selection that:
  //  - starts at the beginning of the contenteditable
  //  - contains a styled span
  //  - and some unstyled text
  //
  // Example:
  // <p>|<span class="highlight">a</span>b|</p>
  //
  // For more details:
  // https://code.google.com/p/chromium/issues/detail?id=335955
  //
  // It seems it is a webkit bug as I could reproduce on Safari (LP).
  var contenteditableSpanBug = (function() {
    return !!bowser.webkit;
  })();


  return {
    contenteditable: contenteditable,
    selectionchange: selectionchange,
    contenteditableSpanBug: contenteditableSpanBug
  };

})();

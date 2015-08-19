(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2014
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports['browser'] = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
}('bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , edgeVersion = getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , result

    if (/opera|opr/i.test(ua)) {
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/windows phone/i.test(ua)) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    }
    else if (/chrome.+? edge/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (/sailfish/i.test(ua)) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (/silk/i.test(ua)) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
      , version: versionIdentifier
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/(web|hpw)os/i.test(ua)) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (/tizen/i.test(ua)) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/safari/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      , version: versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      result.name = result.name || "Webkit"
      result.webkit = t
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.msedge && (android || result.silk)) {
      result.android = t
    } else if (iosdevice) {
      result[iosdevice] = t
      result.ios = t
    }

    // OS version extraction
    var osVersion = '';
    if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = osVersion.split('.')[0];
    if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
      result.tablet = t
    } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.chrome && result.version >= 20) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});

},{}],2:[function(require,module,exports){
module.exports = (function() {

  var getSibling = function(type) {
    return function(element) {
      var sibling = element[type];
      if (sibling && sibling.getAttribute('contenteditable')) return sibling;
      return null;
    };
  };

  return {
    next: getSibling('nextElementSibling'),
    previous: getSibling('previousElementSibling'),
  };
})();

},{}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var config = require('./config');
var string = require('./util/string');
var nodeType = require('./node-type');

module.exports = (function() {
  var allowedElements, requiredAttributes, transformElements;
  var blockLevelElements, splitIntoBlocks;
  var whitespaceOnly = /^\s*$/;
  var blockPlaceholder = '<!-- BLOCK -->';

  var updateConfig = function (config) {
    var i, name, rules = config.pastedHtmlRules;
    allowedElements = rules.allowedElements || {};
    requiredAttributes = rules.requiredAttributes || {};
    transformElements = rules.transformElements || {};

    blockLevelElements = {};
    for (i = 0; i < rules.blockLevelElements.length; i++) {
      name = rules.blockLevelElements[i];
      blockLevelElements[name] = true;
    }
    splitIntoBlocks = {};
    for (i = 0; i < rules.splitIntoBlocks.length; i++) {
      name = rules.splitIntoBlocks[i];
      splitIntoBlocks[name] = true;
    }
  };

  updateConfig(config);

  return {

    updateConfig: updateConfig,

    paste: function(element, cursor, callback) {
      var document = element.ownerDocument;
      element.setAttribute(config.pastingAttribute, true);

      if (cursor.isSelection) {
        cursor = cursor.deleteContent();
      }

      // Create a placeholder and set the focus to the pasteholder
      // to redirect the browser pasting into the pasteholder.
      cursor.save();
      var pasteHolder = this.injectPasteholder(document);
      pasteHolder.focus();

      // Use a timeout to give the browser some time to paste the content.
      // After that grab the pasted content, filter it and restore the focus.
      var _this = this;
      setTimeout(function() {
        var blocks;

        blocks = _this.parseContent(pasteHolder);
        $(pasteHolder).remove();
        element.removeAttribute(config.pastingAttribute);

        cursor.restore();
        callback(blocks, cursor);

      }, 0);
    },

    injectPasteholder: function(document) {
      var pasteHolder = $(document.createElement('div'))
        .attr('contenteditable', true)
        .css({
          position: 'fixed',
          right: '5px',
          top: '50%',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          outline: 'none'
        })[0];

      $(document.body).append(pasteHolder);
      return pasteHolder;
    },

    /**
     * - Parse pasted content
     * - Split it up into blocks
     * - clean and normalize every block
     *
     * @param {DOM node} A container where the pasted content is located.
     * @returns {Array of Strings} An array of cleaned innerHTML like strings.
     */
    parseContent: function(element) {

      // Filter pasted content
      var pastedString = this.filterHtmlElements(element);

      // Handle Blocks
      var blocks = pastedString.split(blockPlaceholder);
      for (var i = 0; i < blocks.length; i++) {
        var entry = blocks[i];

        // Clean Whitesapce
        entry = this.cleanWhitespace(entry);

        // Trim pasted Text
        entry = string.trim(entry);

        blocks[i] = entry;
      }

      blocks = blocks.filter(function(entry) {
        return !whitespaceOnly.test(entry);
      });

      return blocks;
    },

    filterHtmlElements: function(elem, parents) {
      if (!parents) parents = [];

      var child, content = '';
      for (var i = 0; i < elem.childNodes.length; i++) {
        child = elem.childNodes[i];
        if (child.nodeType === nodeType.elementNode) {
          var childContent = this.filterHtmlElements(child, parents);
          content += this.conditionalNodeWrap(child, childContent);
        } else if (child.nodeType === nodeType.textNode) {
          // Escape HTML characters <, > and &
          content += string.escapeHtml(child.nodeValue);
        }
      }

      return content;
    },

    conditionalNodeWrap: function(child, content) {
      var nodeName = child.nodeName.toLowerCase();
      nodeName = this.transformNodeName(nodeName);

      if ( this.shouldKeepNode(nodeName, child) ) {
        var attributes = this.filterAttributes(nodeName, child);
        if (nodeName === 'br') {
          return '<'+ nodeName + attributes +'>';
        } else if ( !whitespaceOnly.test(content) ) {
          return '<'+ nodeName + attributes +'>'+ content +'</'+ nodeName +'>';
        } else {
          return content;
        }
      } else {
        if (splitIntoBlocks[nodeName]) {
          return blockPlaceholder + content + blockPlaceholder;
        } else if (blockLevelElements[nodeName]) {
          // prevent missing whitespace between text when block-level
          // elements are removed.
          return content + ' ';
        } else {
          return content;
        }
      }
    },

    filterAttributes: function(nodeName, node) {
      var attributes = '';

      for (var i=0, len=(node.attributes || []).length; i<len; i++) {
        var name  = node.attributes[i].name;
        var value = node.attributes[i].value;
        if ((allowedElements[nodeName][name]) && value) {
          attributes += ' ' + name + '="' + value + '"';
        }
      }
      return attributes;
    },

    transformNodeName: function(nodeName) {
      if (transformElements[nodeName]) {
        return transformElements[nodeName];
      } else {
        return nodeName;
      }
    },

    hasRequiredAttributes: function(nodeName, node) {
      var attrName, attrValue;
      var requiredAttrs = requiredAttributes[nodeName];
      if (requiredAttrs) {
        for (var i = 0; i < requiredAttrs.length; i++) {
          attrName = requiredAttrs[i];
          attrValue = node.getAttribute(attrName);
          if (!attrValue) {
            return false;
          }
        }
      }
      return true;
    },

    shouldKeepNode: function(nodeName, node) {
      return allowedElements[nodeName] && this.hasRequiredAttributes(nodeName, node);
    },

    cleanWhitespace: function(str) {
      var cleanedStr = str.replace(/(.)(\u00A0)/g, function(match, group1, group2, offset, string) {
        if ( /[\u0020]/.test(group1) ) {
          return group1 + '\u00A0';
        } else {
          return group1 + ' ';
        }
      });
      return cleanedStr;
    }

  };

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./config":4,"./node-type":16,"./util/string":25}],4:[function(require,module,exports){

/**
 * Defines all supported event types by Editable.JS and provides default
 * implementations for them defined in {{#crossLink "Behavior"}}{{/crossLink}}
 *
 * @type {Object}
 */
module.exports = {
  log: false,
  logErrors: true,
  editableClass: 'js-editable',
  editableDisabledClass: 'js-editable-disabled',
  pastingAttribute: 'data-editable-is-pasting',
  boldTag: 'strong',
  italicTag: 'em',

  // Rules that are applied when filtering pasted content
  pastedHtmlRules: {

    // Elements and their attributes to keep in pasted text
    allowedElements: {
      'a': {
        'href': true
      },
      'strong': {},
      'em': {},
      'br': {}
    },

    // Elements that have required attributes.
    // If these are not present the elements are filtered out.
    // Required attributes have to be present in the 'allowed' object
    // as well if they should not be filtered out.
    requiredAttributes: {
      'a': ['href']
    },

    // Elements that should be transformed into other elements
    transformElements: {
      'b': 'strong',
      'i': 'em'
    },

    // A list of elements which should be split into paragraphs.
    splitIntoBlocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'],

    // A list of HTML block level elements.
    blockLevelElements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'pre', 'hr', 'blockquote', 'article', 'figure', 'header', 'footer', 'ul', 'ol', 'li', 'section', 'table', 'video']
  }

};


},{}],5:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var nodeType = require('./node-type');
var rangeSaveRestore = require('./range-save-restore');
var parser = require('./parser');
var string = require('./util/string');

var content;
module.exports = content = (function() {

  var restoreRange = function(host, range, func) {
    range = rangeSaveRestore.save(range);
    func.call(content);
    return rangeSaveRestore.restore(host, range);
  };

  var zeroWidthSpace = /\u200B/g;
  var zeroWidthNonBreakingSpace = /\uFEFF/g;
  var whitespaceExceptSpace = /[^\S ]/g;

  return {

    /**
     * Clean up the Html.
     */
    tidyHtml: function(element) {
      // if (element.normalize) element.normalize();
      this.normalizeTags(element);
    },


    /**
     * Remove empty tags and merge consecutive tags (they must have the same
     * attributes).
     *
     * @method normalizeTags
     * @param  {HTMLElement} element The element to process.
     */
    normalizeTags: function(element) {
      var i, j, node, sibling;

      var fragment = document.createDocumentFragment();

      for (i = 0; i < element.childNodes.length; i++) {
        node = element.childNodes[i];
        if (!node) continue;

        // skip empty tags, so they'll get removed
        if (node.nodeName !== 'BR' && !node.textContent) continue;

        if (node.nodeType === nodeType.elementNode && node.nodeName !== 'BR') {
          sibling = node;
          while ((sibling = sibling.nextSibling) !== null) {
            if (!parser.isSameNode(sibling, node))
              break;

            for (j = 0; j < sibling.childNodes.length; j++) {
              node.appendChild(sibling.childNodes[j].cloneNode(true));
            }

            sibling.parentNode.removeChild(sibling);
          }

          this.normalizeTags(node);
        }

        fragment.appendChild(node.cloneNode(true));
      }

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(fragment);
    },

    normalizeWhitespace: function(text) {
      return text.replace(whitespaceExceptSpace, ' ');
    },

    /**
     * Clean the element from character, tags, etc... added by the plugin logic.
     *
     * @method cleanInternals
     * @param  {HTMLElement} element The element to process.
     */
    cleanInternals: function(element) {
      // Uses extract content for simplicity. A custom method
      // that does not clone the element could be faster if needed.
      element.innerHTML = this.extractContent(element, true);
    },

    /**
     * Extracts the content from a host element.
     * Does not touch or change the host. Just returns
     * the content and removes elements marked for removal by editable.
     *
     * @param {DOM node or document framgent} Element where to clean out the innerHTML. If you pass a document fragment it will be empty after this call.
     * @param {Boolean} Flag whether to keep ui elements like spellchecking highlights.
     * @returns {String} The cleaned innerHTML of the passed element or document fragment.
     */
    extractContent: function(element, keepUiElements) {
      var innerHtml;
      if (element.nodeType === nodeType.documentFragmentNode) {
        innerHtml = this.getInnerHtmlOfFragment(element);
      } else {
        innerHtml = element.innerHTML;
      }

      innerHtml = innerHtml.replace(zeroWidthNonBreakingSpace, ''); // Used for forcing inline elments to have a height
      innerHtml = innerHtml.replace(zeroWidthSpace, '<br>'); // Used for cross-browser newlines

      var clone = document.createElement('div');
      clone.innerHTML = innerHtml;
      this.unwrapInternalNodes(clone, keepUiElements);

      return clone.innerHTML;
    },

    getInnerHtmlOfFragment: function(documentFragment) {
      var div = document.createElement('div');
      div.appendChild(documentFragment);
      return div.innerHTML;
    },

    /**
     * Create a document fragment from an html string
     * @param {String} e.g. 'some html <span>text</span>.'
     */
    createFragmentFromString: function(htmlString) {
      var fragment = document.createDocumentFragment();
      var contents = $('<div>').html(htmlString).contents();
      for (var i = 0; i < contents.length; i++) {
        var el = contents[i];
        fragment.appendChild(el);
      }
      return fragment;
    },

    adoptElement: function(node, doc) {
      if (node.ownerDocument !== doc) {
        return doc.adoptNode(node);
      } else {
        return node;
      }
    },

    /**
     * This is a slight variation of the cloneContents method of a rangyRange.
     * It will return a fragment with the cloned contents of the range
     * without the commonAncestorElement.
     *
     * @param {rangyRange}
     * @return {DocumentFragment}
     */
    cloneRangeContents: function(range) {
      var rangeFragment = range.cloneContents();
      var parent = rangeFragment.childNodes[0];
      var fragment = document.createDocumentFragment();
      while (parent.childNodes.length) {
        fragment.appendChild(parent.childNodes[0]);
      }
      return fragment;
    },

    /**
     * Remove elements that were inserted for internal or user interface purposes
     *
     * @param {DOM node}
     * @param {Boolean} whether to keep ui elements like spellchecking highlights
     * Currently:
     * - Saved ranges
     */
    unwrapInternalNodes: function(sibling, keepUiElements) {
      while (sibling) {
        var nextSibling = sibling.nextSibling;

        if (sibling.nodeType === nodeType.elementNode) {
          var attr = sibling.getAttribute('data-editable');

          if (sibling.firstChild) {
            this.unwrapInternalNodes(sibling.firstChild, keepUiElements);
          }

          if (attr === 'remove') {
            $(sibling).remove();
          } else if (attr === 'unwrap') {
            this.unwrap(sibling);
          } else if (attr === 'ui-remove' && !keepUiElements) {
            $(sibling).remove();
          } else if (attr === 'ui-unwrap' && !keepUiElements) {
            this.unwrap(sibling);
          }
        }
        sibling = nextSibling;
      }
    },

    /**
     * Get all tags that start or end inside the range
     */
    getTags: function(host, range, filterFunc) {
      var tags = this.getInnerTags(range, filterFunc);

      // get all tags that surround the range
      var node = range.commonAncestorContainer;
      while (node !== host) {
        if (!filterFunc || filterFunc(node)) {
          tags.push(node);
        }
        node = node.parentNode;
      }
      return tags;
    },

    getTagsByName: function(host, range, tagName) {
      return this.getTags(host, range, function(node) {
        return node.nodeName === tagName.toUpperCase();
      });
    },

    /**
     * Get all tags that start or end inside the range
     */
    getInnerTags: function(range, filterFunc) {
      return range.getNodes([nodeType.elementNode], filterFunc);
    },

    /**
     * Transform an array of elements into a an array
     * of tagnames in uppercase
     *
     * @return example: ['STRONG', 'B']
     */
    getTagNames: function(elements) {
      var names = [];
      if (!elements) return names;

      for (var i = 0; i < elements.length; i++) {
        names.push(elements[i].nodeName);
      }
      return names;
    },

    isAffectedBy: function(host, range, tagName) {
      var elem;
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        elem = tags[i];
        if (elem.nodeName === tagName.toUpperCase()) {
          return true;
        }
      }

      return false;
    },

    /**
     * Check if the range selects all of the elements contents,
     * not less or more.
     *
     * @param visible: Only compare visible text. That way it does not
     *   matter if the user selects an additional whitespace or not.
     */
    isExactSelection: function(range, elem, visible) {
      var elemRange = rangy.createRange();
      elemRange.selectNodeContents(elem);
      if (range.intersectsRange(elemRange)) {
        var rangeText = range.toString();
        var elemText = $(elem).text();

        if (visible) {
          rangeText = string.trim(rangeText);
          elemText = string.trim(elemText);
        }

        return rangeText !== '' && rangeText === elemText;
      } else {
        return false;
      }
    },

    expandTo: function(host, range, elem) {
      range.selectNodeContents(elem);
      return range;
    },

    toggleTag: function(host, range, elem) {
      var elems = this.getTagsByName(host, range, elem.nodeName);

      if (elems.length === 1 &&
          this.isExactSelection(range, elems[0], 'visible')) {
        return this.removeFormatting(host, range, elem.nodeName);
      }

      return this.forceWrap(host, range, elem);
    },

    isWrappable: function(range) {
      return range.canSurroundContents();
    },

    forceWrap: function(host, range, elem) {
      range = restoreRange(host, range, function(){
        this.nuke(host, range, elem.nodeName);
      });

      // remove all tags if the range is not wrappable
      if (!this.isWrappable(range)) {
        range = restoreRange(host, range, function(){
          this.nuke(host, range);
        });
      }

      this.wrap(range, elem);
      return range;
    },

    wrap: function(range, elem) {
      elem = string.isString(elem) ?
        $(elem)[0] :
        elem;

      if (this.isWrappable(range)) {
        var a = range.surroundContents(elem);
      } else {
        console.log('content.wrap(): can not surround range');
      }
    },

    unwrap: function(elem) {
      var $elem = $(elem);
      var contents = $elem.contents();
      if (contents.length) {
        contents.unwrap();
      } else {
        $elem.remove();
      }
    },

    removeFormatting: function(host, range, tagName) {
      return restoreRange(host, range, function(){
        this.nuke(host, range, tagName);
      });
    },

    /**
     * Unwrap all tags this range is affected by.
     * Can also affect content outside of the range.
     */
    nuke: function(host, range, tagName) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        if ( elem.nodeName !== 'BR' && (!tagName || elem.nodeName === tagName.toUpperCase()) ) {
          this.unwrap(elem);
        }
      }
    },

    /**
     * Insert a single character (or string) before or after the
     * the range.
     */
    insertCharacter: function(range, character, atStart) {
      var insertEl = document.createTextNode(character);

      var boundaryRange = range.cloneRange();
      boundaryRange.collapse(atStart);
      boundaryRange.insertNode(insertEl);

      if (atStart) {
        range.setStartBefore(insertEl);
      } else {
        range.setEndAfter(insertEl);
      }
      range.normalizeBoundaries();
    },

    /**
     * Surround the range with characters like start and end quotes.
     *
     * @method surround
     */
    surround: function(host, range, startCharacter, endCharacter) {
      if (!endCharacter) endCharacter = startCharacter;
      this.insertCharacter(range, endCharacter, false);
      this.insertCharacter(range, startCharacter, true);
      return range;
    },

    /**
     * Removes a character from the text within a range.
     *
     * @method deleteCharacter
     */
    deleteCharacter: function(host, range, character) {
      if (this.containsString(range, character)) {
        range.splitBoundaries();
        range = restoreRange(host, range, function() {
          var charRegexp = string.regexp(character);

          var textNodes = range.getNodes([nodeType.textNode], function(node) {
            return node.nodeValue.search(charRegexp) >= 0;
          });

          for (var i = 0; i < textNodes.length; i++) {
            var node = textNodes[i];
            node.nodeValue = node.nodeValue.replace(charRegexp, '');
          }
        });
        range.normalizeBoundaries();
      }

      return range;
    },

    containsString: function(range, str) {
      var text = range.toString();
      return text.indexOf(str) >= 0;
    },

    /**
     * Unwrap all tags this range is affected by.
     * Can also affect content outside of the range.
     */
    nukeTag: function(host, range, tagName) {
      var tags = this.getTags(host, range);
      for (var i = 0; i < tags.length; i++) {
        var elem = tags[i];
        if (elem.nodeName === tagName)
          this.unwrap(elem);
      }
    }
  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./node-type":16,"./parser":17,"./range-save-restore":19,"./util/string":25}],6:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var config = require('./config');
var error = require('./util/error');
var parser = require('./parser');
var content = require('./content');
var clipboard = require('./clipboard');
var Dispatcher = require('./dispatcher');
var Cursor = require('./cursor');
var Spellcheck = require('./spellcheck');
var createDefaultEvents = require('./create-default-events');
var browser = require('bowser').browser;

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
var Editable = function(instanceConfig) {
  var defaultInstanceConfig = {
    window: window,
    defaultBehavior: true,
    mouseMoveSelectionChanges: false,
    browserSpellcheck: true
  };

  this.config = $.extend(defaultInstanceConfig, instanceConfig);
  this.win = this.config.window;
  this.editableSelector = '.' + config.editableClass;

  if (!rangy.initialized) {
    rangy.init();
  }

  this.dispatcher = new Dispatcher(this);
  if (this.config.defaultBehavior === true) {
    this.dispatcher.on(createDefaultEvents(this));
  }
};

// Expose modules and editable
Editable.parser = parser;
Editable.content = content;
Editable.browser = browser;
window.Editable = Editable;

module.exports = Editable;

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
Editable.globalConfig = function(globalConfig) {
  $.extend(config, globalConfig);
  clipboard.updateConfig(config);
};


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
Editable.prototype.add = function(target) {
  this.enable($(target));
  // todo: check css whitespace settings
  return this;
};


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
Editable.prototype.remove = function(target) {
  var $target = $(target);
  this.disable($target);
  $target.removeClass(config.editableDisabledClass);
  return this;
};


/**
 * Removes the Editable.JS API from the given target elements.
 * The target elements are marked as disabled.
 *
 * @method disable
 * @param { jQuery element | undefined  } target editable root element(s)
 *    If no param is specified all editables are disabled.
 * @chainable
 */
Editable.prototype.disable = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem
    .removeAttr('contenteditable')
    .removeAttr('spellcheck')
    .removeClass(config.editableClass)
    .addClass(config.editableDisabledClass);

  return this;
};



/**
 * Adds the Editable.JS API to the given target elements.
 *
 * @method enable
 * @param { jQuery element | undefined } target editable root element(s)
 *    If no param is specified all editables marked as disabled are enabled.
 * @chainable
 */
Editable.prototype.enable = function($elem, normalize) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableDisabledClass, body);
  $elem
    .attr('contenteditable', true)
    .attr('spellcheck', this.config.browserSpellcheck)
    .removeClass(config.editableDisabledClass)
    .addClass(config.editableClass);

  if (normalize) {
    $elem.each(function(index, el) {
      content.tidyHtml(el);
    });
  }

  return this;
};

/**
 * Temporarily disable an editable.
 * Can be used to prevent text selction while dragging an element
 * for example.
 *
 * @method suspend
 * @param jQuery object
 */
Editable.prototype.suspend = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem.removeAttr('contenteditable');
  return this;
};

/**
 * Reverse the effects of suspend()
 *
 * @method continue
 * @param jQuery object
 */
Editable.prototype.continue = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem.attr('contenteditable', true);
  return this;
};

/**
 * Set the cursor inside of an editable block.
 *
 * @method createCursor
 * @param position 'beginning', 'end', 'before', 'after'
 */
Editable.prototype.createCursor = function(element, position) {
  var cursor;
  var $host = $(element).closest(this.editableSelector);
  position = position || 'beginning';

  if ($host.length) {
    var range = rangy.createRange();

    if (position === 'beginning' || position === 'end') {
      range.selectNodeContents(element);
      range.collapse(position === 'beginning' ? true : false);
    } else if (element !== $host[0]) {
      if (position === 'before') {
        range.setStartBefore(element);
        range.setEndBefore(element);
      } else if (position === 'after') {
        range.setStartAfter(element);
        range.setEndAfter(element);
      }
    } else {
      error('EditableJS: cannot create cursor outside of an editable block.');
    }

    cursor = new Cursor($host[0], range);
  }

  return cursor;
};

Editable.prototype.createCursorAtBeginning = function(element) {
  return this.createCursor(element, 'beginning');
};

Editable.prototype.createCursorAtEnd = function(element) {
  return this.createCursor(element, 'end');
};

Editable.prototype.createCursorBefore = function(element) {
  return this.createCursor(element, 'before');
};

Editable.prototype.createCursorAfter = function(element) {
  return this.createCursor(element, 'after');
};

/**
 * Extract the content from an editable host or document fragment.
 * This method will remove all internal elements and ui-elements.
 *
 * @param {DOM node or Document Fragment} The innerHTML of this element or fragment will be extracted.
 * @returns {String} The cleaned innerHTML.
 */
Editable.prototype.getContent = function(element) {
  return content.extractContent(element);
};


/**
 * @param {String | DocumentFragment} content to append.
 * @returns {Cursor} A new Cursor object just before the inserted content.
 */
Editable.prototype.appendTo = function(element, contentToAppend) {
  element = content.adoptElement(element, this.win.document);

  if (typeof contentToAppend === 'string') {
    // todo: create content in the right window
    contentToAppend = content.createFragmentFromString(contentToAppend);
  }

  var cursor = this.createCursor(element, 'end');
  cursor.insertAfter(contentToAppend);
  return cursor;
};



/**
 * @param {String | DocumentFragment} content to prepend
 * @returns {Cursor} A new Cursor object just after the inserted content.
 */
Editable.prototype.prependTo = function(element, contentToPrepend) {
  element = content.adoptElement(element, this.win.document);

  if (typeof contentToPrepend === 'string') {
    // todo: create content in the right window
    contentToPrepend = content.createFragmentFromString(contentToPrepend);
  }

  var cursor = this.createCursor(element, 'beginning');
  cursor.insertBefore(contentToPrepend);
  return cursor;
};


/**
 * Get the current selection.
 * Only returns something if the selection is within an editable element.
 * If you pass an editable host as param it only returns something if the selection is inside this
 * very editable element.
 *
 * @param {DOMNode} Optional. An editable host where the selection needs to be contained.
 * @returns A Cursor or Selection object or undefined.
 */
Editable.prototype.getSelection = function(editableHost) {
  var selection = this.dispatcher.selectionWatcher.getFreshSelection();
  if (editableHost && selection) {
    var range = selection.range;
    // Check if the selection is inside the editableHost
    // The try...catch is required if the editableHost was removed from the DOM.
    try {
      if (range.compareNode(editableHost) !== range.NODE_BEFORE_AND_AFTER) {
        selection = undefined;
      }
    } catch (e) {
      selection = undefined;
    }
  }
  return selection;
};


/**
 * Enable spellchecking
 *
 * @chainable
 */
Editable.prototype.setupSpellcheck = function(spellcheckConfig) {
  this.spellcheck = new Spellcheck(this, spellcheckConfig);

  return this;
};


/**
 * Subscribe a callback function to a custom event fired by the API.
 *
 * @param {String} event The name of the event.
 * @param {Function} handler The callback to execute in response to the
 *     event.
 *
 * @chainable
 */
Editable.prototype.on = function(event, handler) {
  // TODO throw error if event is not one of EVENTS
  // TODO throw error if handler is not a function
  this.dispatcher.on(event, handler);
  return this;
};

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
Editable.prototype.off = function(event, handler) {
  var args = Array.prototype.slice.call(arguments);
  this.dispatcher.off.apply(this.dispatcher, args);
  return this;
};

/**
 * Unsubscribe all callbacks and event listeners.
 *
 * @chainable
 */
Editable.prototype.unload = function() {
  this.dispatcher.unload();
  return this;
};

/**
 * Generate a callback function to subscribe to an event.
 *
 * @method createEventSubscriber
 * @param {String} Event name
 */
var createEventSubscriber = function(name) {
  Editable.prototype[name] = function(handler) {
    return this.on(name, handler);
  };
};

/**
 * Set up callback functions for several events.
 */
var events = ['focus', 'blur', 'flow', 'selection', 'cursor', 'newline',
              'insert', 'split', 'merge', 'empty', 'change', 'switch', 'move',
              'clipboard', 'paste'];

for (var i = 0; i < events.length; ++i) {
  var eventName = events[i];
  createEventSubscriber(eventName);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./clipboard":3,"./config":4,"./content":5,"./create-default-events":8,"./cursor":9,"./dispatcher":10,"./parser":17,"./spellcheck":22,"./util/error":23,"bowser":1}],7:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var parser = require('./parser');
var content = require('./content');
var log = require('./util/log');
var block = require('./block');

/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with Editable.init() or on
 * Editable.add() per element.
 *
 * @module core
 * @submodule behavior
 */


module.exports = function(editable) {
  var document = editable.win.document;
  var selectionWatcher = editable.dispatcher.selectionWatcher;

  /**
    * Factory for the default behavior.
    * Provides default behavior of the Editable.JS API.
    *
    * @static
    */
  return {
    focus: function(element) {
      // Add a <br> element if the editable is empty to force it to have height
      // E.g. Firefox does not render empty block elements and most browsers do
      // not render  empty inline elements.
      if (parser.isVoid(element)) {
        var br = document.createElement('br');
        br.setAttribute('data-editable', 'remove');
        element.appendChild(br);
      }
    },

    blur: function(element) {
      content.cleanInternals(element);
    },

    selection: function(element, selection) {
      if (selection) {
        log('Default selection behavior');
      } else {
        log('Default selection empty behavior');
      }
    },

    cursor: function(element, cursor) {
      if (cursor) {
        log('Default cursor behavior');
      } else {
        log('Default cursor empty behavior');
      }
    },

    newline: function(element, cursor) {
      var atEnd = cursor.isAtEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if (atEnd) {
        log('at the end');

        var noWidthSpace = document.createTextNode('\u200B');
        cursor.insertAfter(noWidthSpace);

        // var trailingBr = document.createElement('br');
        // trailingBr.setAttribute('type', '-editablejs');
        // cursor.insertAfter(trailingBr);

      } else {
        log('not at the end');
      }

      cursor.setVisibleSelection();
    },

    insert: function(element, direction, cursor) {
      var parent = element.parentNode;
      var newElement = element.cloneNode(false);
      if (newElement.id) newElement.removeAttribute('id');

      switch (direction) {
      case 'before':
        parent.insertBefore(newElement, element);
        element.focus();
        break;
      case 'after':
        parent.insertBefore(newElement, element.nextSibling);
        newElement.focus();
        break;
      }
    },

    split: function(element, before, after, cursor) {
      var newNode = element.cloneNode();
      newNode.appendChild(before);

      var parent = element.parentNode;
      parent.insertBefore(newNode, element);

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(after);

      content.tidyHtml(newNode);
      content.tidyHtml(element);
      element.focus();
    },

    merge: function(element, direction, cursor) {
      var container, merger, fragment, chunks, i, newChild, range;

      switch (direction) {
      case 'before':
        container = block.previous(element);
        merger = element;
        break;
      case 'after':
        container = element;
        merger = block.next(element);
        break;
      }

      if (!(container && merger))
        return;

      if (container.childNodes.length > 0) {
        cursor = editable.appendTo(container, merger.innerHTML);
      } else {
        cursor = editable.prependTo(container, merger.innerHTML);
      }

      // remove merged node
      merger.parentNode.removeChild(merger);

      cursor.save();
      content.tidyHtml(container);
      cursor.restore();
      cursor.setVisibleSelection();
    },

    empty: function(element) {
      log('Default empty behavior');
    },

    'switch': function(element, direction, cursor) {
      var next, previous;

      switch (direction) {
      case 'before':
        previous = block.previous(element);
        if (previous) {
          cursor.moveAtTextEnd(previous);
          cursor.setVisibleSelection();
        }
        break;
      case 'after':
        next = block.next(element);
        if (next) {
          cursor.moveAtBeginning(next);
          cursor.setVisibleSelection();
        }
        break;
      }
    },

    move: function(element, selection, direction) {
      log('Default move behavior');
    },

    paste: function(element, blocks, cursor) {
      var fragment;

      var firstBlock = blocks[0];
      cursor.insertBefore(firstBlock);

      if (blocks.length <= 1) {
        cursor.setVisibleSelection();
      } else {
        var parent = element.parentNode;
        var currentElement = element;

        for (var i = 1; i < blocks.length; i++) {
          var newElement = element.cloneNode(false);
          if (newElement.id) newElement.removeAttribute('id');
          fragment = content.createFragmentFromString(blocks[i]);
          $(newElement).append(fragment);
          parent.insertBefore(newElement, currentElement.nextSibling);
          currentElement = newElement;
        }

        // focus last element
        cursor = editable.createCursorAtEnd(currentElement);
        cursor.setVisibleSelection();
      }
    },

    clipboard: function(element, action, cursor) {
      log('Default clipboard behavior');
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./block":2,"./content":5,"./parser":17,"./util/log":24}],8:[function(require,module,exports){
var createDefaultBehavior = require('./create-default-behavior');

module.exports = function (editable) {
  var behavior = createDefaultBehavior(editable);

  return {
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
    cursor: function(element, cursor) {
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
     * The split event is triggered when a block should be splitted into two
     * blocks. This happens when ENTER is pressed within a non-empty block.
     * The default behavior is to... TODO
     *
     * @event split
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} before The HTML string before the split.
     * @param {String} after The HTML string after the split.
     * @param {Cursor} cursor The actual cursor object.
     */
    split: function(element, before, after, cursor) {
      behavior.split(element, before, after, cursor);
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
     * @param {Cursor} cursor The actual cursor object.
     */
    insert: function(element, direction, cursor) {
      behavior.insert(element, direction, cursor);
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
     * @param {Cursor} cursor The actual cursor object.
     */
    merge: function(element, direction, cursor) {
      behavior.merge(element, direction, cursor);
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
     * This happens when an ARROW key is pressed near the boundaries of a block.
     * The default behavior is to... TODO
     *
     * @event switch
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} direction The switch direction: "before" or "after".
     * @param {Cursor} cursor The actual cursor object.*
     */
    'switch': function(element, direction, cursor) {
      behavior.switch(element, direction, cursor);
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
     * The clipboard event is triggered when the user copies or cuts
     * a selection within a block.
     *
     * @event clipboard
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} action The clipboard action: "copy" or "cut".
     * @param {Selection} selection A selection object around the copied content.
     */
    clipboard: function(element, action, selection) {
      behavior.clipboard(element, action, selection);
    },

    /**
     * The paste event is triggered when the user pastes text
     *
     * @event paste
     * @param {HTMLElement} The element triggering the event.
     * @param {Array of String} The pasted blocks
     * @param {Cursor} The cursor object.
     */
    paste: function(element, blocks, cursor) {
      behavior.paste(element, blocks, cursor);
    }
  };
};

},{"./create-default-behavior":7}],9:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var content = require('./content');
var parser = require('./parser');
var string = require('./util/string');
var nodeType = require('./node-type');
var error = require('./util/error');
var rangeSaveRestore = require('./range-save-restore');

/**
 * The Cursor module provides a cross-browser abstraction layer for cursor.
 *
 * @module core
 * @submodule cursor
 */

var Cursor;
module.exports = Cursor = (function() {

  /**
   * Class for the Cursor module.
   *
   * @class Cursor
   * @constructor
   */
  var Cursor = function(editableHost, rangyRange) {
    this.setHost(editableHost);
    this.range = rangyRange;
    this.isCursor = true;
  };

  Cursor.prototype = (function() {
    return {
      isAtEnd: function() {
        return parser.isEndOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
      },

      isAtTextEnd: function() {
        return parser.isTextEndOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
      },

      isAtBeginning: function() {
        return parser.isBeginningOfHost(
          this.host,
          this.range.startContainer,
          this.range.startOffset);
      },

      /**
       * Insert content before the cursor
       *
       * @param {String, DOM node or document fragment}
       */
      insertBefore: function(element) {
        if ( string.isString(element) ) {
          element = content.createFragmentFromString(element);
        }
        if (parser.isDocumentFragmentWithoutChildren(element)) return;
        element = this.adoptElement(element);

        var preceedingElement = element;
        if (element.nodeType === nodeType.documentFragmentNode) {
          var lastIndex = element.childNodes.length - 1;
          preceedingElement = element.childNodes[lastIndex];
        }

        this.range.insertNode(element);
        this.range.setStartAfter(preceedingElement);
        this.range.setEndAfter(preceedingElement);
      },

      /**
       * Insert content after the cursor
       *
       * @param {String, DOM node or document fragment}
       */
      insertAfter: function(element) {
        if ( string.isString(element) ) {
          element = content.createFragmentFromString(element);
        }
        if (parser.isDocumentFragmentWithoutChildren(element)) return;
        element = this.adoptElement(element);
        this.range.insertNode(element);
      },

      /**
       * Alias for #setVisibleSelection()
       */
      setSelection: function() {
        this.setVisibleSelection();
      },

      setVisibleSelection: function() {
        // Without setting focus() Firefox is not happy (seems setting a selection is not enough.
        // Probably because Firefox can handle multiple selections).
        if (this.win.document.activeElement !== this.host) {
          $(this.host).focus();
        }
        rangy.getSelection(this.win).setSingleRange(this.range);
      },

      /**
       * Take the following example:
       * (The character '|' represents the cursor position)
       *
       * <div contenteditable="true">fo|o</div>
       * before() will return a document frament containing a text node 'fo'.
       *
       * @returns {Document Fragment} content before the cursor or selection.
       */
      before: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setStartBefore(this.host);
        fragment = content.cloneRangeContents(range);
        return fragment;
      },

      /**
       * Same as before() but returns a string.
       */
      beforeHtml: function() {
        return content.getInnerHtmlOfFragment(this.before());
      },

      /**
       * Take the following example:
       * (The character '|' represents the cursor position)
       *
       * <div contenteditable="true">fo|o</div>
       * after() will return a document frament containing a text node 'o'.
       *
       * @returns {Document Fragment} content after the cursor or selection.
       */
      after: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setEndAfter(this.host);
        fragment = content.cloneRangeContents(range);
        return fragment;
      },

      /**
       * Same as after() but returns a string.
       */
      afterHtml: function() {
        return content.getInnerHtmlOfFragment(this.after());
      },

      /**
       * Get the BoundingClientRect of the cursor.
       * The returned values are transformed to be absolute
       # (relative to the document).
       */
      getCoordinates: function(positioning) {
        positioning = positioning || 'absolute';

        var coords = this.range.nativeRange.getBoundingClientRect();
        if (positioning === 'fixed') return coords;

        // code from mdn: https://developer.mozilla.org/en-US/docs/Web/API/window.scrollX
        var win = this.win;
        var x = (win.pageXOffset !== undefined) ? win.pageXOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollLeft;
        var y = (win.pageYOffset !== undefined) ? win.pageYOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollTop;

        // translate into absolute positions
        return {
          top: coords.top + y,
          bottom: coords.bottom + y,
          left: coords.left + x,
          right: coords.right + x,
          height: coords.height,
          width: coords.width
        };
      },

      moveBefore: function(element) {
        this.updateHost(element);
        this.range.setStartBefore(element);
        this.range.setEndBefore(element);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      moveAfter: function(element) {
        this.updateHost(element);
        this.range.setStartAfter(element);
        this.range.setEndAfter(element);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor to the beginning of the host.
       */
      moveAtBeginning: function(element) {
        if (!element) element = this.host;
        this.updateHost(element);
        this.range.selectNodeContents(element);
        this.range.collapse(true);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor to the end of the host.
       */
      moveAtEnd: function(element) {
        if (!element) element = this.host;
        this.updateHost(element);
        this.range.selectNodeContents(element);
        this.range.collapse(false);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor after the last visible character of the host.
       */
      moveAtTextEnd: function(element) {
        return this.moveAtEnd(parser.latestChild(element));
      },

      setHost: function(element) {
        if (element.jquery) element = element[0];
        this.host = element;
        this.win = (element === undefined || element === null) ? window : element.ownerDocument.defaultView;
      },

      updateHost: function(element) {
        var host = parser.getHost(element);
        if (!host) {
          error('Can not set cursor outside of an editable block');
        }
        this.setHost(host);
      },

      retainVisibleSelection: function(callback) {
        this.save();
        callback();
        this.restore();
        this.setVisibleSelection();
      },

      save: function() {
        this.savedRangeInfo = rangeSaveRestore.save(this.range);
        this.savedRangeInfo.host = this.host;
      },

      restore: function() {
        if (this.savedRangeInfo) {
          this.host = this.savedRangeInfo.host;
          this.range = rangeSaveRestore.restore(this.host, this.savedRangeInfo);
          this.savedRangeInfo = undefined;
        } else {
          error('Could not restore selection');
        }
      },

      equals: function(cursor) {
        if (!cursor) return false;

        if (!cursor.host) return false;
        if (!cursor.host.isEqualNode(this.host)) return false;

        if (!cursor.range) return false;
        if (!cursor.range.equals(this.range)) return false;

        return true;
      },

      // Create an element with the correct ownerWindow
      // (see: http://www.w3.org/DOM/faq.html#ownerdoc)
      createElement: function(tagName) {
        return this.win.document.createElement(tagName);
      },

      // Make sure a node has the correct ownerWindow
      // (see: https://developer.mozilla.org/en-US/docs/Web/API/Document/importNode)
      adoptElement: function(node) {
        return content.adoptElement(node, this.win.document);
      },

      // Currently we call triggerChange manually after format changes.
      // This is to prevent excessive triggering of the change event during
      // merge or split operations or other manipulations by scripts.
      triggerChange: function() {
        $(this.host).trigger('formatEditable');
      }
    };
  })();

  return Cursor;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./content":5,"./node-type":16,"./parser":17,"./range-save-restore":19,"./util/error":23,"./util/string":25}],10:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var browserFeatures = require('./feature-detection');
var clipboard = require('./clipboard');
var eventable = require('./eventable');
var SelectionWatcher = require('./selection-watcher');
var config = require('./config');
var Keyboard = require('./keyboard');

/**
 * The Dispatcher module is responsible for dealing with events and their handlers.
 *
 * @module core
 * @submodule dispatcher
 */

var Dispatcher = function(editable) {
  var win = editable.win;
  eventable(this, editable);
  this.supportsInputEvent = false;
  this.$document = $(win.document);
  this.config = editable.config;
  this.editable = editable;
  this.editableSelector = editable.editableSelector;
  this.selectionWatcher = new SelectionWatcher(this, win);
  this.keyboard = new Keyboard(this.selectionWatcher);
  this.setup();
};

module.exports = Dispatcher;

// This will be set to true once we detect the input event is working.
// Input event description on MDN:
// https://developer.mozilla.org/en-US/docs/Web/Reference/Events/input
var isInputEventSupported = false;

/**
 * Sets up all events that Editable.JS is catching.
 *
 * @method setup
 */
Dispatcher.prototype.setup = function() {
  // setup all events notifications
  this.setupElementEvents();
  this.setupKeyboardEvents();

  if (browserFeatures.selectionchange) {
    this.setupSelectionChangeEvents();
  } else {
    this.setupSelectionChangeFallback();
  }
};

Dispatcher.prototype.unload = function() {
  this.off();
  this.$document.off('.editable');
};

/**
 * Sets up events that are triggered on modifying an element.
 *
 * @method setupElementEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupElementEvents = function() {
  var _this = this;
  this.$document.on('focus.editable', _this.editableSelector, function(event) {
    if (this.getAttribute(config.pastingAttribute)) return;
    _this.notify('focus', this);
  }).on('blur.editable', _this.editableSelector, function(event) {
    if (this.getAttribute(config.pastingAttribute)) return;
    _this.notify('blur', this);
  }).on('copy.editable', _this.editableSelector, function(event) {
    var selection = _this.selectionWatcher.getFreshSelection();
    if (selection.isSelection) {
      _this.notify('clipboard', this, 'copy', selection);
    }
  }).on('cut.editable', _this.editableSelector, function(event) {
    var selection = _this.selectionWatcher.getFreshSelection();
    if (selection.isSelection) {
      _this.notify('clipboard', this, 'cut', selection);
      _this.triggerChangeEvent(this);
    }
  }).on('paste.editable', _this.editableSelector, function(event) {
    var element = this;
    var afterPaste = function (blocks, cursor) {
      if (blocks.length) {
        _this.notify('paste', element, blocks, cursor);

        // The input event does not fire when we process the content manually
        // and insert it via script
        _this.notify('change', element);
      } else {
        cursor.setVisibleSelection();
      }
    };

    var cursor = _this.selectionWatcher.getFreshSelection();
    clipboard.paste(this, cursor, afterPaste);


  }).on('input.editable', _this.editableSelector, function(event) {
    if (isInputEventSupported) {
      _this.notify('change', this);
    } else {
      // Most likely the event was already handled manually by
      // triggerChangeEvent so the first time we just switch the
      // isInputEventSupported flag without notifiying the change event.
      isInputEventSupported = true;
    }
  }).on('formatEditable.editable', _this.editableSelector, function(event) {
    _this.notify('change', this);
  });
};

/**
 * Trigger a change event
 *
 * This should be done in these cases:
 * - typing a letter
 * - delete (backspace and delete keys)
 * - cut
 * - paste
 * - copy and paste (not easily possible manually as far as I know)
 *
 * Preferrably this is done using the input event. But the input event is not
 * supported on all browsers for contenteditable elements.
 * To make things worse it is not detectable either. So instead of detecting
 * we set 'isInputEventSupported' when the input event fires the first time.
 */
Dispatcher.prototype.triggerChangeEvent = function(target){
  if (isInputEventSupported) return;
  this.notify('change', target);
};

Dispatcher.prototype.dispatchSwitchEvent = function(event, element, direction) {
  var cursor;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
    return;

  cursor = this.selectionWatcher.getSelection();
  if (!cursor || cursor.isSelection) return;
  // Detect if the browser moved the cursor in the next tick.
  // If the cursor stays at its position, fire the switch event.
  var dispatcher = this;
  setTimeout(function() {
    var newCursor = dispatcher.selectionWatcher.forceCursor();
    if (newCursor.equals(cursor)) {
      event.preventDefault();
      event.stopPropagation();
      dispatcher.notify('switch', element, direction, newCursor);
    }
  }, 1);
};

/**
 * Sets up events that are triggered on keyboard events.
 * Keyboard definitions are in {{#crossLink "Keyboard"}}{{/crossLink}}.
 *
 * @method setupKeyboardEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupKeyboardEvents = function() {
  var _this = this;

  this.$document.on('keydown.editable', this.editableSelector, function(event) {
    var notifyCharacterEvent = !isInputEventSupported;
    _this.keyboard.dispatchKeyEvent(event, this, notifyCharacterEvent);
  });

  this.keyboard.on('left', function(event) {
    _this.dispatchSwitchEvent(event, this, 'before');
  }).on('up', function(event) {
    _this.dispatchSwitchEvent(event, this, 'before');
  }).on('right', function(event) {
    _this.dispatchSwitchEvent(event, this, 'after');
  }).on('down', function(event) {
    _this.dispatchSwitchEvent(event, this, 'after');
  }).on('tab', function(event) {
  }).on('shiftTab', function(event) {
  }).on('esc', function(event) {
  }).on('backspace', function(event) {
    var range = _this.selectionWatcher.getFreshRange();
    if (range.isCursor) {
      var cursor = range.getCursor();
      if ( cursor.isAtBeginning() ) {
        event.preventDefault();
        event.stopPropagation();
        _this.notify('merge', this, 'before', cursor);
      } else {
        _this.triggerChangeEvent(this);
      }
    } else {
      _this.triggerChangeEvent(this);
    }
  }).on('delete', function(event) {
    var range = _this.selectionWatcher.getFreshRange();
    if (range.isCursor) {
      var cursor = range.getCursor();
      if (cursor.isAtTextEnd()) {
        event.preventDefault();
        event.stopPropagation();
        _this.notify('merge', this, 'after', cursor);
      } else {
        _this.triggerChangeEvent(this);
      }
    } else {
      _this.triggerChangeEvent(this);
    }
  }).on('enter', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var range = _this.selectionWatcher.getFreshRange();
    var cursor = range.forceCursor();

    if (cursor.isAtTextEnd()) {
      _this.notify('insert', this, 'after', cursor);
    } else if (cursor.isAtBeginning()) {
      _this.notify('insert', this, 'before', cursor);
    } else {
      _this.notify('split', this, cursor.before(), cursor.after(), cursor);
    }

  }).on('shiftEnter', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var cursor = _this.selectionWatcher.forceCursor();
    _this.notify('newline', this, cursor);
  }).on('character', function(event) {
    _this.notify('change', this);
  });
};

/**
 * Sets up events that are triggered on a selection change.
 *
 * @method setupSelectionChangeEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupSelectionChangeEvents = function() {
  var selectionDirty = false;
  var suppressSelectionChanges = false;
  var $document = this.$document;
  var selectionWatcher = this.selectionWatcher;
  var _this = this;

  // fires on mousemove (thats probably a bit too much)
  // catches changes like 'select all' from context menu
  $document.on('selectionchange.editable', function(event) {
    if (suppressSelectionChanges) {
      selectionDirty = true;
    } else {
      selectionWatcher.selectionChanged();
    }
  });

  // listen for selection changes by mouse so we can
  // suppress the selectionchange event and only fire the
  // change event on mouseup
  $document.on('mousedown.editable', this.editableSelector, function(event) {
    if (_this.config.mouseMoveSelectionChanges === false) {
      suppressSelectionChanges = true;

      // Without this timeout the previous selection is active
      // until the mouseup event (no. not good).
      setTimeout($.proxy(selectionWatcher, 'selectionChanged'), 0);
    }

    $document.on('mouseup.editableSelection', function(event) {
      $document.off('.editableSelection');
      suppressSelectionChanges = false;

      if (selectionDirty) {
        selectionDirty = false;
        selectionWatcher.selectionChanged();
      }
    });
  });
};


/**
 * Fallback solution to support selection change events on browsers that don't
 * support selectionChange.
 *
 * @method setupSelectionChangeFallback
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupSelectionChangeFallback = function() {
  var $document = this.$document;
  var selectionWatcher = this.selectionWatcher;

  // listen for selection changes by mouse
  $document.on('mouseup.editableSelection', function(event) {

    // In Opera when clicking outside of a block
    // it does not update the selection as it should
    // without the timeout
    setTimeout($.proxy(selectionWatcher, 'selectionChanged'), 0);
  });

  // listen for selection changes by keys
  $document.on('keyup.editable', this.editableSelector, function(event) {

    // when pressing Command + Shift + Left for example the keyup is only triggered
    // after at least two keys are released. Strange. The culprit seems to be the
    // Command key. Do we need a workaround?
    selectionWatcher.selectionChanged();
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./clipboard":3,"./config":4,"./eventable":11,"./feature-detection":12,"./keyboard":14,"./selection-watcher":20}],11:[function(require,module,exports){

// Eventable Mixin.
//
// Simple mixin to add event emitter methods to an object (Publish/Subscribe).
//
// Add on, off and notify methods to an object:
// eventable(obj);
//
// publish an event:
// obj.notify(context, 'action', param1, param2);
//
// Optionally pass a context that will be applied to every event:
// eventable(obj, context);
//
// With this publishing can omit the context argument:
// obj.notify('action', param1, param2);
//
// Subscribe to a 'channel'
// obj.on('action', funtion(param1, param2){ ... });
//
// Unsubscribe an individual listener:
// obj.off('action', method);
//
// Unsubscribe all listeners of a channel:
// obj.off('action');
//
// Unsubscribe all listeners of all channels:
// obj.off();
var getEventableModule = function(notifyContext) {
  var listeners = {};

  var addListener = function(event, listener) {
    if (listeners[event] === undefined) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  };

  var removeListener = function(event, listener) {
    var eventListeners = listeners[event];
    if (eventListeners === undefined) return;

    for (var i = 0, len = eventListeners.length; i < len; i++) {
      if (eventListeners[i] === listener) {
        eventListeners.splice(i, 1);
        break;
      }
    }
  };

  // Public Methods
  return {
    on: function(event, listener) {
      if (arguments.length === 2) {
        addListener(event, listener);
      } else if (arguments.length === 1) {
        var eventObj = event;
        for (var eventType in eventObj) {
          addListener(eventType, eventObj[eventType]);
        }
      }
      return this;
    },

    off: function(event, listener) {
      if (arguments.length === 2) {
        removeListener(event, listener);
      } else if (arguments.length === 1) {
        listeners[event] = [];
      } else {
        listeners = {};
      }
    },

    notify: function(context, event) {
      var args = Array.prototype.slice.call(arguments);
      if (notifyContext) {
        event = context;
        context = notifyContext;
        args = args.splice(1);
      } else {
        args = args.splice(2);
      }
      var eventListeners = listeners[event];
      if (eventListeners === undefined) return;

      // Traverse backwards and execute the newest listeners first.
      // Stop if a listener returns false.
      for (var i = eventListeners.length - 1; i >= 0; i--) {
        // debugger
        if (eventListeners[i].apply(context, args) === false)
          break;
      }
    }
  };

};

module.exports = function(obj, notifyContext) {
  var module = getEventableModule(notifyContext);
  for (var prop in module) {
    obj[prop] = module[prop];
  }
};

},{}],12:[function(require,module,exports){
var browser = require('bowser').browser;

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
    return !(browser.gecko || browser.opera);
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
    return !!browser.webkit;
  })();


  return {
    contenteditable: contenteditable,
    selectionchange: selectionchange,
    contenteditableSpanBug: contenteditableSpanBug
  };

})();

},{"bowser":1}],13:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var NodeIterator = require('./node-iterator');
var nodeType = require('./node-type');

module.exports = (function() {

  return {
    extractText: function(element) {
      var text = '';
      this.getText(element, function(part) {
        text += part;
      });
      return text;
    },

    // Extract the text of an element.
    // This has two notable behaviours:
    // - It uses a NodeIterator which will skip elements
    //   with data-editable="remove"
    // - It returns a space for <br> elements
    //   (The only block level element allowed inside of editables)
    getText: function(element, callback) {
      var iterator = new NodeIterator(element);
      var next;
      while ( (next = iterator.getNext()) ) {
        if (next.nodeType === nodeType.textNode && next.data !== '') {
          callback(next.data);
        } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
          callback(' ');
        }
      }
    },

    highlight: function(element, regex, stencilElement) {
      var matches = this.find(element, regex);
      this.highlightMatches(element, matches, stencilElement);
    },

    find: function(element, regex) {
      var text = this.extractText(element);
      var match;
      var matches = [];
      var matchIndex = 0;
      while ( (match = regex.exec(text)) ) {
        matches.push(this.prepareMatch(match, matchIndex));
        matchIndex += 1;
      }
      return matches;
    },

    highlightMatches: function(element, matches, stencilElement) {
      if (!matches || matches.length === 0) {
        return;
      }

      var next, textNode, length, offset, isFirstPortion, isLastPortion, wordId;
      var currentMatchIndex = 0;
      var currentMatch = matches[currentMatchIndex];
      var totalOffset = 0;
      var iterator = new NodeIterator(element);
      var portions = [];
      while ( (next = iterator.getNext()) ) {

        // Account for <br> elements
        if (next.nodeType === nodeType.textNode && next.data !== '') {
          textNode = next;
        } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
          totalOffset = totalOffset + 1;
          continue;
        } else {
          continue;
        }

        var nodeText = textNode.data;
        var nodeEndOffset = totalOffset + nodeText.length;
        if (currentMatch.startIndex < nodeEndOffset && totalOffset < currentMatch.endIndex) {

          // get portion position (fist, last or in the middle)
          isFirstPortion = isLastPortion = false;
          if (totalOffset <= currentMatch.startIndex) {
            isFirstPortion = true;
            wordId = currentMatch.startIndex;
          }
          if (nodeEndOffset >= currentMatch.endIndex) {
            isLastPortion = true;
          }

          // calculate offset and length
          if (isFirstPortion) {
            offset = currentMatch.startIndex - totalOffset;
          } else {
            offset = 0;
          }

          if (isLastPortion) {
            length = (currentMatch.endIndex - totalOffset) - offset;
          } else {
            length = nodeText.length - offset;
          }

          // create portion object
          var portion = {
            element: textNode,
            text: nodeText.substring(offset, offset + length),
            offset: offset,
            length: length,
            isLastPortion: isLastPortion,
            wordId: wordId
          };

          portions.push(portion);

          if (isLastPortion) {
            var lastNode = this.wrapWord(portions, stencilElement);
            iterator.replaceCurrent(lastNode);

            // recalculate nodeEndOffset if we have to replace the current node.
            nodeEndOffset = totalOffset + portion.length + portion.offset;

            portions = [];
            currentMatchIndex += 1;
            if (currentMatchIndex < matches.length) {
              currentMatch = matches[currentMatchIndex];
            }
          }
        }

        totalOffset = nodeEndOffset;
      }
    },

    getRange: function(element) {
      var range = rangy.createRange();
      range.selectNodeContents(element);
      return range;
    },

    // @return the last wrapped element
    wrapWord: function(portions, stencilElement) {
      var element;
      for (var i = 0; i < portions.length; i++) {
        var portion = portions[i];
        element = this.wrapPortion(portion, stencilElement);
      }

      return element;
    },

    wrapPortion: function(portion, stencilElement) {
      var range = rangy.createRange();
      range.setStart(portion.element, portion.offset);
      range.setEnd(portion.element, portion.offset + portion.length);
      var node = stencilElement.cloneNode(true);
      node.setAttribute('data-word-id', portion.wordId);
      range.surroundContents(node);

      // Fix a weird behaviour where an empty text node is inserted after the range
      if (node.nextSibling) {
        var next = node.nextSibling;
        if (next.nodeType === nodeType.textNode && next.data === '') {
          next.parentNode.removeChild(next);
        }
      }

      return node;
    },

    prepareMatch: function (match, matchIndex) {
      // Quickfix for the spellcheck regex where we need to match the second subgroup.
      if (match[2]) {
        return this.prepareMatchForSecondSubgroup(match, matchIndex);
      }

      return {
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchIndex: matchIndex,
        search: match[0]
      };
    },

    prepareMatchForSecondSubgroup: function (match, matchIndex) {
      var index = match.index;
      index += match[1].length;
      return {
        startIndex: index,
        endIndex: index + match[2].length,
        matchIndex: matchIndex,
        search: match[0]
      };
    }

  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./node-iterator":15,"./node-type":16}],14:[function(require,module,exports){
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
    this.preventContenteditableBug(target, event);
    this.notify(target, 'backspace', event);
    break;

  case this.key['delete']:
    this.preventContenteditableBug(target, event);
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
    this.preventContenteditableBug(target, event);
    if (notifyCharacterEvent) {
      this.notify(target, 'character', event);
    }
  }
};

Keyboard.prototype.preventContenteditableBug = function(target, event) {
  if (browserFeatures.contenteditableSpanBug) {
    if (event.ctrlKey || event.metaKey) return;

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

},{"./eventable":11,"./feature-detection":12,"./node-type":16}],15:[function(require,module,exports){
var nodeType = require('./node-type');

// A DOM node iterator.
//
// Has the ability to replace nodes on the fly and continue
// the iteration.
var NodeIterator;
module.exports = NodeIterator = (function() {

  var NodeIterator = function(root) {
    this.root = root;
    this.current = this.next = this.root;
  };

  NodeIterator.prototype.getNextTextNode = function() {
    var next;
    while ( (next = this.getNext()) ) {
      if (next.nodeType === nodeType.textNode && next.data !== '') {
        return next;
      }
    }
  };

  NodeIterator.prototype.getNext = function() {
    var child, n;
    n = this.current = this.next;
    child = this.next = undefined;
    if (this.current) {
      child = n.firstChild;

      // Skip the children of elements with the attribute data-editable="remove"
      // This prevents text nodes that are not part of the content to be included.
      if (child && n.getAttribute('data-editable') !== 'remove') {
        this.next = child;
      } else {
        while ((n !== this.root) && !(this.next = n.nextSibling)) {
          n = n.parentNode;
        }
      }
    }
    return this.current;
  };

  NodeIterator.prototype.replaceCurrent = function(replacement) {
    this.current = replacement;
    this.next = undefined;
    var n = this.current;
    while ((n !== this.root) && !(this.next = n.nextSibling)) {
      n = n.parentNode;
    }
  };

  return NodeIterator;
})();

},{"./node-type":16}],16:[function(require,module,exports){
// DOM node types
// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
module.exports = {
  elementNode: 1,
  attributeNode: 2,
  textNode: 3,
  cdataSectionNode: 4,
  entityReferenceNode: 5,
  entityNode: 6,
  processingInstructionNode: 7,
  commentNode: 8,
  documentNode: 9,
  documentTypeNode: 10,
  documentFragmentNode: 11,
  notationNode: 12
};

},{}],17:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var string = require('./util/string');
var nodeType = require('./node-type');
var config = require('./config');

/**
 * The parser module provides helper methods to parse html-chunks
 * manipulations and helpers for common tasks.
 *
 * @module core
 * @submodule parser
 */

module.exports = (function() {
  /**
   * Singleton that provides DOM lookup helpers.
   * @static
   */
  return {

    /**
     * Get the editableJS host block of a node.
     *
     * @method getHost
     * @param {DOM Node}
     * @return {DOM Node}
     */
    getHost: function(node) {
      var editableSelector = '.' + config.editableClass;
      var hostNode = $(node).closest(editableSelector);
      return hostNode.length ? hostNode[0] : undefined;
    },

    /**
     * Get the index of a node.
     * So that parent.childNodes[ getIndex(node) ] would return the node again
     *
     * @method getNodeIndex
     * @param {HTMLElement}
     */
    getNodeIndex: function(node) {
      var index = 0;
      while ((node = node.previousSibling) !== null) {
        index += 1;
      }
      return index;
    },

    /**
     * Check if node contains text or element nodes
     * whitespace counts too!
     *
     * @method isVoid
     * @param {HTMLElement}
     */
    isVoid: function(node) {
      var child, i, len;
      var childNodes = node.childNodes;

      for (i = 0, len = childNodes.length; i < len; i++) {
        child = childNodes[i];

        if (child.nodeType === nodeType.textNode && !this.isVoidTextNode(child)) {
          return false;
        } else if (child.nodeType === nodeType.elementNode) {
          return false;
        }
      }
      return true;
    },

    /**
     * Check if node is a text node and completely empty without any whitespace
     *
     * @method isVoidTextNode
     * @param {HTMLElement}
     */
    isVoidTextNode: function(node) {
      return node.nodeType === nodeType.textNode && !node.nodeValue;
    },

    /**
     * Check if node is a text node and contains nothing but whitespace
     *
     * @method isWhitespaceOnly
     * @param {HTMLElement}
     */
    isWhitespaceOnly: function(node) {
      return node.nodeType === nodeType.textNode && this.lastOffsetWithContent(node) === 0;
    },

    isLinebreak: function(node) {
      return node.nodeType === nodeType.elementNode && node.tagName === 'BR';
    },

    /**
     * Returns the last offset where the cursor can be positioned to
     * be at the visible end of its container.
     * Currently works only for empty text nodes (not empty tags)
     *
     * @method isWhitespaceOnly
     * @param {HTMLElement}
     */
    lastOffsetWithContent: function(node) {
      if (node.nodeType === nodeType.textNode) {
        return string.trimRight(node.nodeValue).length;
      } else {
        var i,
            childNodes = node.childNodes;

        for (i = childNodes.length - 1; i >= 0; i--) {
          node = childNodes[i];
          if (this.isWhitespaceOnly(node) || this.isLinebreak(node)) {
            continue;
          } else {
            // The offset starts at 0 before the first element
            // and ends with the length after the last element.
            return i + 1;
          }
        }
        return 0;
      }
    },

    isBeginningOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isStartOffset(container, offset);
      }

      if (this.isStartOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element simulates a range offset
        // right before the element.
        var offsetInParent = this.getNodeIndex(container);
        return this.isBeginningOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isEndOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isEndOffset(container, offset);
      }

      if (this.isEndOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element plus one simulates a range offset
        // right after the element.
        var offsetInParent = this.getNodeIndex(container) + 1;
        return this.isEndOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isStartOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        return offset === 0;
      } else {
        if (container.childNodes.length === 0)
          return true;
        else
          return container.childNodes[offset] === container.firstChild;
      }
    },

    isEndOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        return offset === container.length;
      } else {
        if (container.childNodes.length === 0)
          return true;
        else if (offset > 0)
          return container.childNodes[offset - 1] === container.lastChild;
        else
          return false;
      }
    },

    isTextEndOfHost: function(host, container, offset) {
      if (container === host) {
        return this.isTextEndOffset(container, offset);
      }

      if (this.isTextEndOffset(container, offset)) {
        var parentContainer = container.parentNode;

        // The index of the element plus one simulates a range offset
        // right after the element.
        var offsetInParent = this.getNodeIndex(container) + 1;
        return this.isTextEndOfHost(host, parentContainer, offsetInParent);
      } else {
        return false;
      }
    },

    isTextEndOffset: function(container, offset) {
      if (container.nodeType === nodeType.textNode) {
        var text = string.trimRight(container.nodeValue);
        return offset >= text.length;
      } else if (container.childNodes.length === 0) {
        return true;
      } else {
        var lastOffset = this.lastOffsetWithContent(container);
        return offset >= lastOffset;
      }
    },

    isSameNode: function(target, source) {
      var i, len, attr;

      if (target.nodeType !== source.nodeType)
        return false;

      if (target.nodeName !== source.nodeName)
        return false;

      for (i = 0, len = target.attributes.length; i < len; i++) {
        attr = target.attributes[i];
        if (source.getAttribute(attr.name) !== attr.value)
          return false;
      }

      return true;
    },

    /**
     * Return the deepest last child of a node.
     *
     * @method  latestChild
     * @param  {HTMLElement} container The container to iterate on.
     * @return {HTMLElement}           THe deepest last child in the container.
     */
    latestChild: function(container) {
      if (container.lastChild)
        return this.latestChild(container.lastChild);
      else
        return container;
    },

    /**
     * Checks if a documentFragment has no children.
     * Fragments without children can cause errors if inserted into ranges.
     *
     * @method  isDocumentFragmentWithoutChildren
     * @param  {HTMLElement} DOM node.
     * @return {Boolean}
     */
    isDocumentFragmentWithoutChildren: function(fragment) {
      if (fragment &&
          fragment.nodeType === nodeType.documentFragmentNode &&
          fragment.childNodes.length === 0) {
        return true;
      }
      return false;
    },

    /**
     * Determine if an element behaves like an inline element.
     */
    isInlineElement: function(window, element) {
      var styles = element.currentStyle || window.getComputedStyle(element, '');
      var display = styles.display;
      switch (display) {
      case 'inline':
      case 'inline-block':
        return true;
      default:
        return false;
      }
    }
  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./config":4,"./node-type":16,"./util/string":25}],18:[function(require,module,exports){
var Cursor = require('./cursor');
var Selection = require('./selection');

/** RangeContainer
 *
 * primarily used to compare ranges
 * its designed to work with undefined ranges as well
 * so we can easily compare them without checking for undefined
 * all the time
 */
var RangeContainer;
module.exports = RangeContainer = function(editableHost, rangyRange) {
  this.host = editableHost && editableHost.jquery ?
    editableHost[0] :
    editableHost;
  this.range = rangyRange;
  this.isAnythingSelected = (rangyRange !== undefined);
  this.isCursor = (this.isAnythingSelected && rangyRange.collapsed);
  this.isSelection = (this.isAnythingSelected && !this.isCursor);
};

RangeContainer.prototype.getCursor = function() {
  if (this.isCursor) {
    return new Cursor(this.host, this.range);
  }
};

RangeContainer.prototype.getSelection = function() {
  if (this.isSelection) {
    return new Selection(this.host, this.range);
  }
};

RangeContainer.prototype.forceCursor = function() {
  if (this.isSelection) {
    var selection = this.getSelection();
    return selection.deleteContent();
  } else {
    return this.getCursor();
  }
};

RangeContainer.prototype.isDifferentFrom = function(otherRangeContainer) {
  otherRangeContainer = otherRangeContainer || new RangeContainer();
  var self = this.range;
  var other = otherRangeContainer.range;
  if (self && other) {
    return !self.equals(other);
  } else if (!self && !other) {
    return false;
  } else {
    return true;
  }
};


},{"./cursor":9,"./selection":21}],19:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var error = require('./util/error');
var nodeType = require('./node-type');

/**
 * Inspired by the Selection save and restore module for Rangy by Tim Down
 * Saves and restores ranges using invisible marker elements in the DOM.
 */
module.exports = (function() {
  var boundaryMarkerId = 0;

  // (U+FEFF) zero width no-break space
  var markerTextChar = '\ufeff';

  var getMarker = function(host, id) {
    return host.querySelector('#'+ id);
  };

  return {

    insertRangeBoundaryMarker: function(range, atStart) {
      var markerId = 'editable-range-boundary-' + (boundaryMarkerId += 1);
      var markerEl;
      var container = range.commonAncestorContainer;

      // If ownerDocument is null the commonAncestorContainer is window.document
      if (container.ownerDocument === null || container.ownerDocument === undefined) {
        error('Cannot save range: range is emtpy');
      }
      var doc = container.ownerDocument.defaultView.document;

      // Clone the Range and collapse to the appropriate boundary point
      var boundaryRange = range.cloneRange();
      boundaryRange.collapse(atStart);

      // Create the marker element containing a single invisible character using DOM methods and insert it
      markerEl = doc.createElement('span');
      markerEl.id = markerId;
      markerEl.setAttribute('data-editable', 'remove');
      markerEl.style.lineHeight = '0';
      markerEl.style.display = 'none';
      markerEl.appendChild(doc.createTextNode(markerTextChar));

      boundaryRange.insertNode(markerEl);
      return markerEl;
    },

    setRangeBoundary: function(host, range, markerId, atStart) {
      var markerEl = getMarker(host, markerId);
      if (markerEl) {
        range[atStart ? 'setStartBefore' : 'setEndBefore'](markerEl);
        markerEl.parentNode.removeChild(markerEl);
      } else {
        console.log('Marker element has been removed. Cannot restore selection.');
      }
    },

    save: function(range) {
      var rangeInfo, startEl, endEl;

      // insert markers
      if (range.collapsed) {
        endEl = this.insertRangeBoundaryMarker(range, false);
        rangeInfo = {
          markerId: endEl.id,
          collapsed: true
        };
      } else {
        endEl = this.insertRangeBoundaryMarker(range, false);
        startEl = this.insertRangeBoundaryMarker(range, true);

        rangeInfo = {
          startMarkerId: startEl.id,
          endMarkerId: endEl.id,
          collapsed: false
        };
      }

      // Adjust each range's boundaries to lie between its markers
      if (range.collapsed) {
        range.collapseBefore(endEl);
      } else {
        range.setEndBefore(endEl);
        range.setStartAfter(startEl);
      }

      return rangeInfo;
    },

    restore: function(host, rangeInfo) {
      if (rangeInfo.restored) return;

      var range = rangy.createRange();
      if (rangeInfo.collapsed) {
        var markerEl = getMarker(host, rangeInfo.markerId);
        if (markerEl) {
          markerEl.style.display = 'inline';
          var previousNode = markerEl.previousSibling;

          // Workaround for rangy issue 17
          if (previousNode && previousNode.nodeType === nodeType.textNode) {
            markerEl.parentNode.removeChild(markerEl);
            range.collapseToPoint(previousNode, previousNode.length);
          } else {
            range.collapseBefore(markerEl);
            markerEl.parentNode.removeChild(markerEl);
          }
        } else {
          console.log('Marker element has been removed. Cannot restore selection.');
        }
      } else {
        this.setRangeBoundary(host, range, rangeInfo.startMarkerId, true);
        this.setRangeBoundary(host, range, rangeInfo.endMarkerId, false);
      }

      range.normalizeBoundaries();
      return range;
    }
  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./node-type":16,"./util/error":23}],20:[function(require,module,exports){
(function (global){
var rangy = (typeof window !== "undefined" ? window['rangy'] : typeof global !== "undefined" ? global['rangy'] : null);
var parser = require('./parser');
var RangeContainer = require('./range-container');
var Cursor = require('./cursor');
var Selection = require('./selection');

/**
 * The SelectionWatcher module watches for selection changes inside
 * of editable blocks.
 *
 * @module core
 * @submodule selectionWatcher
 */

var SelectionWatcher;
module.exports = SelectionWatcher = function(dispatcher, win) {
  this.dispatcher = dispatcher;
  this.win = win || window;
  this.rangySelection = undefined;
  this.currentSelection = undefined;
  this.currentRange = undefined;
};


/**
 * Return a RangeContainer if the current selection is within an editable
 * otherwise return an empty RangeContainer
 */
SelectionWatcher.prototype.getRangeContainer = function() {
  this.rangySelection = rangy.getSelection(this.win);

  // rangeCount is 0 or 1 in all browsers except firefox
  // firefox can work with multiple ranges
  // (on a mac hold down the command key to select multiple ranges)
  if (this.rangySelection.rangeCount) {
    var range = this.rangySelection.getRangeAt(0);
    var hostNode = parser.getHost(range.commonAncestorContainer);
    if (hostNode) {
      return new RangeContainer(hostNode, range);
    }
  }

  // return an empty range container
  return new RangeContainer();
};


/**
 * Gets a fresh RangeContainer with the current selection or cursor.
 *
 * @return RangeContainer instance
 */
SelectionWatcher.prototype.getFreshRange = function() {
  return this.getRangeContainer();
};


/**
 * Gets a fresh RangeContainer with the current selection or cursor.
 *
 * @return Either a Cursor or Selection instance or undefined if
 * there is neither a selection or cursor.
 */
SelectionWatcher.prototype.getFreshSelection = function() {
  var range = this.getRangeContainer();

  return range.isCursor ?
    range.getCursor(this.win) :
    range.getSelection(this.win);
};


/**
 * Get the selection set by the last selectionChanged event.
 * Sometimes the event does not fire fast enough and the seleciton
 * you get is not the one the user sees.
 * In those cases use #getFreshSelection()
 *
 * @return Either a Cursor or Selection instance or undefined if
 * there is neither a selection or cursor.
 */
SelectionWatcher.prototype.getSelection = function() {
  return this.currentSelection;
};


SelectionWatcher.prototype.forceCursor = function() {
  var range = this.getRangeContainer();
  return range.forceCursor();
};


SelectionWatcher.prototype.selectionChanged = function() {
  var newRange = this.getRangeContainer();
  if (newRange.isDifferentFrom(this.currentRange)) {
    var lastSelection = this.currentSelection;
    this.currentRange = newRange;

    // empty selection or cursor
    if (lastSelection) {
      if (lastSelection.isCursor && !this.currentRange.isCursor) {
        this.dispatcher.notify('cursor', lastSelection.host);
      } else if (lastSelection.isSelection && !this.currentRange.isSelection) {
        this.dispatcher.notify('selection', lastSelection.host);
      }
    }

    // set new selection or cursor and fire event
    if (this.currentRange.isCursor) {
      this.currentSelection = new Cursor(this.currentRange.host, this.currentRange.range);
      this.dispatcher.notify('cursor', this.currentSelection.host, this.currentSelection);
    } else if (this.currentRange.isSelection) {
      this.currentSelection = new Selection(this.currentRange.host, this.currentRange.range);
      this.dispatcher.notify('selection', this.currentSelection.host, this.currentSelection);
    } else {
      this.currentSelection = undefined;
    }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./cursor":9,"./parser":17,"./range-container":18,"./selection":21}],21:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Cursor = require('./cursor');
var content = require('./content');
var parser = require('./parser');
var config = require('./config');

/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */

module.exports = (function() {

  /**
   * Class that represents a selection and provides functionality to access or
   * modify the selection.
   *
   * @class Selection
   * @constructor
   */
  var Selection = function(editableHost, rangyRange) {
    this.setHost(editableHost);
    this.range = rangyRange;
    this.isSelection = true;
  };

  // add Cursor prototpye to Selection prototype chain
  var Base = function() {};
  Base.prototype = Cursor.prototype;
  Selection.prototype = $.extend(new Base(), {
    /**
     * Get the text inside the selection.
     *
     * @method text
     */
    text: function() {
      return this.range.toString();
    },

    /**
     * Get the html inside the selection.
     *
     * @method html
     */
    html: function() {
      return this.range.toHtml();
    },

    /**
     *
     * @method isAllSelected
     */
    isAllSelected: function() {
      return parser.isBeginningOfHost(
        this.host,
        this.range.startContainer,
        this.range.startOffset) &&
      parser.isTextEndOfHost(
        this.host,
        this.range.endContainer,
        this.range.endOffset);
    },

    /**
     * Get the ClientRects of this selection.
     * Use this if you want more precision than getBoundingClientRect can give.
     */
    getRects: function() {
      var coords = this.range.nativeRange.getClientRects();

      // todo: translate into absolute positions
      // just like Cursor#getCoordinates()
      return coords;
    },

    /**
     *
     * @method link
     */
    link: function(href, attrs) {
      var $link = $(this.createElement('a'));
      if (href) $link.attr('href', href);
      for (var name in attrs) {
        $link.attr(name, attrs[name]);
      }

      this.forceWrap($link[0]);
    },

    unlink: function() {
      this.removeFormatting('a');
    },

    toggleLink: function(href, attrs) {
      var links = this.getTagsByName('a');
      if (links.length >= 1) {
        var firstLink = links[0];
        if (this.isExactSelection(firstLink, 'visible')) {
          this.unlink();
        } else {
          this.expandTo(firstLink);
        }
      } else {
        this.link(href, attrs);
      }
    },

    toggle: function(elem) {
      elem = this.adoptElement(elem);
      this.range = content.toggleTag(this.host, this.range, elem);
      this.setSelection();
    },

    /**
     *
     * @method makeBold
     */
    makeBold: function() {
      var bold = this.createElement(config.boldTag);
      this.forceWrap(bold);
    },

    toggleBold: function() {
      var bold = this.createElement(config.boldTag);
      this.toggle(bold);
    },

    /**
     *
     * @method giveEmphasis
     */
    giveEmphasis: function() {
      var em = this.createElement(config.italicTag);
      this.forceWrap(em);
    },

    toggleEmphasis: function() {
      var em = this.createElement(config.italicTag);
      this.toggle(em);
    },

    /**
     * Surround the selection with characters like quotes.
     *
     * @method surround
     * @param {String} E.g. '«'
     * @param {String} E.g. '»'
     */
    surround: function(startCharacter, endCharacter) {
      this.range = content.surround(this.host, this.range, startCharacter, endCharacter);
      this.setSelection();
    },

    removeSurround: function(startCharacter, endCharacter) {
      this.range = content.deleteCharacter(this.host, this.range, startCharacter);
      this.range = content.deleteCharacter(this.host, this.range, endCharacter);
      this.setSelection();
    },

    toggleSurround: function(startCharacter, endCharacter) {
      if (this.containsString(startCharacter) &&
        this.containsString(endCharacter)) {
        this.removeSurround(startCharacter, endCharacter);
      } else {
        this.surround(startCharacter, endCharacter);
      }
    },

    /**
     * @method removeFormatting
     * @param {String} tagName. E.g. 'a' to remove all links.
     */
    removeFormatting: function(tagName) {
      this.range = content.removeFormatting(this.host, this.range, tagName);
      this.setSelection();
    },

    /**
     * Delete the contents inside the range. After that the selection will be a
     * cursor.
     *
     * @method deleteContent
     * @return Cursor instance
     */
    deleteContent: function() {
      this.range.deleteContents();
      return new Cursor(this.host, this.range);
    },

    /**
     * Expand the current selection.
     *
     * @method expandTo
     * @param {DOM Node}
     */
    expandTo: function(elem) {
      this.range = content.expandTo(this.host, this.range, elem);
      this.setSelection();
    },

    /**
     *  Collapse the selection at the beginning of the selection
     *
     *  @return Cursor instance
     */
    collapseAtBeginning: function(elem) {
      this.range.collapse(true);
      this.setSelection();
      return new Cursor(this.host, this.range);
    },

    /**
     *  Collapse the selection at the end of the selection
     *
     *  @return Cursor instance
     */
    collapseAtEnd: function(elem) {
      this.range.collapse(false);
      this.setSelection();
      return new Cursor(this.host, this.range);
    },

    /**
     * Wrap the selection with the specified tag. If any other tag with
     * the same tagName is affecting the selection this tag will be
     * remove first.
     *
     * @method forceWrap
     */
    forceWrap: function(elem) {
      elem = this.adoptElement(elem);
      this.range = content.forceWrap(this.host, this.range, elem);
      this.setSelection();
    },

    /**
     * Get all tags that affect the current selection. Optionally pass a
     * method to filter the returned elements.
     *
     * @method getTags
     * @param {Function filter(node)} [Optional] Method to filter the returned
     *   DOM Nodes.
     * @return {Array of DOM Nodes}
     */
    getTags: function(filterFunc) {
      return content.getTags(this.host, this.range, filterFunc);
    },

    /**
     * Get all tags of the specified type that affect the current selection.
     *
     * @method getTagsByName
     * @param {String} tagName. E.g. 'a' to get all links.
     * @return {Array of DOM Nodes}
     */
    getTagsByName: function(tagName) {
      return content.getTagsByName(this.host, this.range, tagName);
    },

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
    isExactSelection: function(elem, onlyVisible) {
      return content.isExactSelection(this.range, elem, onlyVisible);
    },

    /**
     * Check if the selection contains the passed string.
     *
     * @method containsString
     * @return {Boolean}
     */
    containsString: function(str) {
      return content.containsString(this.range, str);
    },

    /**
     * Delete all occurences of the specified character from the
     * selection.
     *
     * @method deleteCharacter
     */
    deleteCharacter: function(character) {
      this.range = content.deleteCharacter(this.host, this.range, character);
      this.setSelection();
    }
  });

  return Selection;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./config":4,"./content":5,"./cursor":9,"./parser":17}],22:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var content = require('./content');
var highlightText = require('./highlight-text');
var nodeType = require('./node-type');

module.exports = (function() {

  // Unicode character blocks for letters.
  // See: http://jrgraphix.net/research/unicode_blocks.php
  //
  // \\u0041-\\u005A    A-Z (Basic Latin)
  // \\u0061-\\u007A    a-z (Basic Latin)
  // \\u0030-\\u0039    0-9 (Basic Latin)
  // \\u00AA            ª   (Latin-1 Supplement)
  // \\u00B5            µ   (Latin-1 Supplement)
  // \\u00BA            º   (Latin-1 Supplement)
  // \\u00C0-\\u00D6    À-Ö (Latin-1 Supplement)
  // \\u00D8-\\u00F6    Ø-ö (Latin-1 Supplement)
  // \\u00F8-\\u00FF    ø-ÿ (Latin-1 Supplement)
  // \\u0100-\\u017F    Ā-ſ (Latin Extended-A)
  // \\u0180-\\u024F    ƀ-ɏ (Latin Extended-B)
  var letterChars = '\\u0041-\\u005A\\u0061-\\u007A\\u0030-\\u0039\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF\\u0100-\\u017F\\u0180-\\u024F';

  var escapeRegEx = function(s) {
    return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  };

  /**
   * Spellcheck class.
   *
   * @class Spellcheck
   * @constructor
   */
  var Spellcheck = function(editable, configuration) {
    var defaultConfig = {
      checkOnFocus: false, // check on focus
      checkOnChange: true, // check after changes
      throttle: 1000, // unbounce rate in ms before calling the spellcheck service after changes
      removeOnCorrection: true, // remove highlights after a change if the cursor is inside a highlight
      markerNode: $('<span class="spellcheck"></span>'),
      spellcheckService: undefined
    };

    this.editable = editable;
    this.win = editable.win;
    this.config = $.extend(defaultConfig, configuration);
    this.prepareMarkerNode();
    this.setup();
  };

  Spellcheck.prototype.setup = function(editable) {
    if (this.config.checkOnFocus) {
      this.editable.on('focus', $.proxy(this, 'onFocus'));
      this.editable.on('blur', $.proxy(this, 'onBlur'));
    }
    if (this.config.checkOnChange || this.config.removeOnCorrection) {
      this.editable.on('change', $.proxy(this, 'onChange'));
    }
  };

  Spellcheck.prototype.onFocus = function(editableHost) {
    if (this.focusedEditable !== editableHost) {
      this.focusedEditable = editableHost;
      this.editableHasChanged(editableHost);
    }
  };

  Spellcheck.prototype.onBlur = function(editableHost) {
    if (this.focusedEditable === editableHost) {
      this.focusedEditable = undefined;
    }
  };

  Spellcheck.prototype.onChange = function(editableHost) {
    if (this.config.checkOnChange) {
      this.editableHasChanged(editableHost, this.config.throttle);
    }
    if (this.config.removeOnCorrection) {
      this.removeHighlightsAtCursor(editableHost);
    }
  };

  Spellcheck.prototype.prepareMarkerNode = function() {
    var marker = this.config.markerNode;
    if (marker.jquery) {
      marker = marker[0];
    }
    marker = content.adoptElement(marker, this.win.document);
    this.config.markerNode = marker;

    marker.setAttribute('data-editable', 'ui-unwrap');
    marker.setAttribute('data-spellcheck', 'spellcheck');
  };

  Spellcheck.prototype.createMarkerNode = function() {
    return this.config.markerNode.cloneNode();
  };

  Spellcheck.prototype.removeHighlights = function(editableHost) {
    $(editableHost).find('[data-spellcheck=spellcheck]').each(function(index, elem) {
      content.unwrap(elem);
    });
  };

  Spellcheck.prototype.removeHighlightsAtCursor = function(editableHost) {
    var wordId;
    var selection = this.editable.getSelection(editableHost);
    if (selection && selection.isCursor) {
      var elementAtCursor = selection.range.startContainer;
      if (elementAtCursor.nodeType === nodeType.textNode) {
        elementAtCursor = elementAtCursor.parentNode;
      }

      do {
        if (elementAtCursor === editableHost) return;
        if ( elementAtCursor.hasAttribute('data-word-id') ) {
          wordId = elementAtCursor.getAttribute('data-word-id');
          break;
        }
      } while ( (elementAtCursor = elementAtCursor.parentNode) );

      if (wordId) {
        selection.retainVisibleSelection(function() {
          $(editableHost).find('[data-word-id='+ wordId +']').each(function(index, elem) {
            content.unwrap(elem);
          });
        });
      }
    }
  };

  Spellcheck.prototype.createRegex = function(words) {
    var escapedWords = $.map(words, function(word) {
      return escapeRegEx(word);
    });

    var regex = '';
    regex += '([^' + letterChars + ']|^)';
    regex += '(' + escapedWords.join('|') + ')';
    regex += '(?=[^' + letterChars + ']|$)';

    return new RegExp(regex, 'g');
  };

  Spellcheck.prototype.highlight = function(editableHost, misspelledWords) {

    // Remove old highlights
    this.removeHighlights(editableHost);

    // Create new highlights
    if (misspelledWords && misspelledWords.length > 0) {
      var regex = this.createRegex(misspelledWords);
      var span = this.createMarkerNode();
      highlightText.highlight(editableHost, regex, span);
    }
  };

  Spellcheck.prototype.editableHasChanged = function(editableHost, throttle) {
    if (this.timeoutId && this.currentEditableHost === editableHost) {
      clearTimeout(this.timeoutId);
    }

    var that = this;
    this.timeoutId = setTimeout(function() {
      that.checkSpelling(editableHost);
      that.currentEditableHost = undefined;
      that.timeoutId = undefined;
    }, throttle || 0);

    this.currentEditableHost = editableHost;
  };

  Spellcheck.prototype.checkSpelling = function(editableHost) {
    var that = this;
    var text = highlightText.extractText(editableHost);
    text = content.normalizeWhitespace(text);

    this.config.spellcheckService(text, function(misspelledWords) {
      var selection = that.editable.getSelection(editableHost);
      if (selection) {
        selection.retainVisibleSelection(function() {
          that.highlight(editableHost, misspelledWords);
        });
      } else {
        that.highlight(editableHost, misspelledWords);
      }
    });
  };

  return Spellcheck;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./content":5,"./highlight-text":13,"./node-type":16}],23:[function(require,module,exports){
var config = require('../config');

// Allows for safe error logging
// Falls back to console.log if console.error is not available
module.exports = function() {
  if (config.logErrors === false) { return; }

  var args;
  args = Array.prototype.slice.call(arguments);
  if (args.length === 1) {
    args = args[0];
  }

  if (window.console && typeof window.console.error === 'function') {
    return console.error(args);
  } else if (window.console) {
    return console.log(args);
  }
};

},{"../config":4}],24:[function(require,module,exports){
var config = require('../config');

// Allows for safe console logging
// If the last param is the string "trace" console.trace will be called
// configuration: disable with config.log = false
module.exports = function() {
  if (config.log === false) { return; }

  var args, _ref;
  args = Array.prototype.slice.call(arguments);
  if (args.length) {
    if (args[args.length - 1] === 'trace') {
      args.pop();
      if ((_ref = window.console) ? _ref.trace : void 0) {
        console.trace();
      }
    }
  }

  if (args.length === 1) {
    args = args[0];
  }

  if (window.console) {
    return console.log(args);
  }
};


},{"../config":4}],25:[function(require,module,exports){
module.exports = (function() {

  var toString = Object.prototype.toString;
  var htmlCharacters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
  };

  return {
    trimRight: function(text) {
      return text.replace(/\s+$/, '');
    },

    trimLeft: function(text) {
      return text.replace(/^\s+/, '');
    },

    trim: function(text) {
      return text.replace(/^\s+|\s+$/g, '');
    },

    isString: function(obj) {
      return toString.call(obj) === '[object String]';
    },

    /**
     * Turn any string into a regular expression.
     * This can be used to search or replace a string conveniently.
     */
    regexp: function(str, flags) {
      if (!flags) flags = 'g';
      var escapedStr = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      return new RegExp(escapedStr, flags);
    },

    /**
     * Escape HTML characters <, > and &
     * Usage: escapeHtml('<div>');
     *
     * @param { String }
     * @param { Boolean } Optional. If true " and ' will also be escaped.
     * @return { String } Escaped Html you can assign to innerHTML of an element.
     */
    escapeHtml: function(s, forAttribute) {
      return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function(c) { // "'
        return htmlCharacters[c];
      });
    },

    /**
     * Escape a string the browser way.
     */
    browserEscapeHtml: function(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }
  };
})();

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYm93c2VyL2Jvd3Nlci5qcyIsInNyYy9ibG9jay5qcyIsInNyYy9jbGlwYm9hcmQuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2NvbnRlbnQuanMiLCJzcmMvY29yZS5qcyIsInNyYy9jcmVhdGUtZGVmYXVsdC1iZWhhdmlvci5qcyIsInNyYy9jcmVhdGUtZGVmYXVsdC1ldmVudHMuanMiLCJzcmMvY3Vyc29yLmpzIiwic3JjL2Rpc3BhdGNoZXIuanMiLCJzcmMvZXZlbnRhYmxlLmpzIiwic3JjL2ZlYXR1cmUtZGV0ZWN0aW9uLmpzIiwic3JjL2hpZ2hsaWdodC10ZXh0LmpzIiwic3JjL2tleWJvYXJkLmpzIiwic3JjL25vZGUtaXRlcmF0b3IuanMiLCJzcmMvbm9kZS10eXBlLmpzIiwic3JjL3BhcnNlci5qcyIsInNyYy9yYW5nZS1jb250YWluZXIuanMiLCJzcmMvcmFuZ2Utc2F2ZS1yZXN0b3JlLmpzIiwic3JjL3NlbGVjdGlvbi13YXRjaGVyLmpzIiwic3JjL3NlbGVjdGlvbi5qcyIsInNyYy9zcGVsbGNoZWNrLmpzIiwic3JjL3V0aWwvZXJyb3IuanMiLCJzcmMvdXRpbC9sb2cuanMiLCJzcmMvdXRpbC9zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDelRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICAqIEJvd3NlciAtIGEgYnJvd3NlciBkZXRlY3RvclxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm93c2VyXG4gICogTUlUIExpY2Vuc2UgfCAoYykgRHVzdGluIERpYXogMjAxNFxuICAqL1xuXG4hZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzWydicm93c2VyJ10gPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0oJ2Jvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAgKiBTZWUgdXNlcmFnZW50cy5qcyBmb3IgZXhhbXBsZXMgb2YgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICovXG5cbiAgdmFyIHQgPSB0cnVlXG5cbiAgZnVuY3Rpb24gZGV0ZWN0KHVhKSB7XG5cbiAgICBmdW5jdGlvbiBnZXRGaXJzdE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNlY29uZE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMl0pIHx8ICcnO1xuICAgIH1cblxuICAgIHZhciBpb3NkZXZpY2UgPSBnZXRGaXJzdE1hdGNoKC8oaXBvZHxpcGhvbmV8aXBhZCkvaSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBsaWtlQW5kcm9pZCA9IC9saWtlIGFuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBhbmRyb2lkID0gIWxpa2VBbmRyb2lkICYmIC9hbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgZWRnZVZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9lZGdlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB2ZXJzaW9uSWRlbnRpZmllciA9IGdldEZpcnN0TWF0Y2goL3ZlcnNpb25cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHRhYmxldCA9IC90YWJsZXQvaS50ZXN0KHVhKVxuICAgICAgLCBtb2JpbGUgPSAhdGFibGV0ICYmIC9bXi1dbW9iaS9pLnRlc3QodWEpXG4gICAgICAsIHJlc3VsdFxuXG4gICAgaWYgKC9vcGVyYXxvcHIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAsIG9wZXJhOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/Om9wZXJhfG9wcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3dpbmRvd3MgcGhvbmUvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgd2luZG93c3Bob25lOiB0XG4gICAgICB9XG4gICAgICBpZiAoZWRnZVZlcnNpb24pIHtcbiAgICAgICAgcmVzdWx0Lm1zZWRnZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdC5tc2llID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2llbW9iaWxlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXNpZXx0cmlkZW50L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ludGVybmV0IEV4cGxvcmVyJ1xuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om1zaWUgfHJ2OikoXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWUuKz8gZWRnZS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNaWNyb3NvZnQgRWRnZSdcbiAgICAgICwgbXNlZGdlOiB0XG4gICAgICAsIHZlcnNpb246IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWV8Y3Jpb3N8Y3Jtby9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIGNocm9tZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lIDogaW9zZGV2aWNlID09ICdpcGhvbmUnID8gJ2lQaG9uZScgOiBpb3NkZXZpY2UgPT0gJ2lwYWQnID8gJ2lQYWQnIDogJ2lQb2QnXG4gICAgICB9XG4gICAgICAvLyBXVEY6IHZlcnNpb24gaXMgbm90IHBhcnQgb2YgdXNlciBhZ2VudCBpbiB3ZWIgYXBwc1xuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NhaWxmaXNoL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhaWxmaXNoJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWwpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zaWxrL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9ICB7XG4gICAgICAgIG5hbWU6ICdBbWF6b24gU2lsaydcbiAgICAgICwgc2lsazogdFxuICAgICAgLCB2ZXJzaW9uIDogZ2V0Rmlyc3RNYXRjaCgvc2lsa1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3BoYW50b20vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUGhhbnRvbUpTJ1xuICAgICAgLCBwaGFudG9tOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3BoYW50b21qc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2JsYWNrYmVycnl8XFxiYmJcXGQrL2kudGVzdCh1YSkgfHwgL3JpbVxcc3RhYmxldC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCbGFja0JlcnJ5J1xuICAgICAgLCBibGFja2JlcnJ5OiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL2JsYWNrYmVycnlbXFxkXStcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC8od2VifGhwdylvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXZWJPUydcbiAgICAgICwgd2Vib3M6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvdyg/OmViKT9vc2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgICAgL3RvdWNocGFkXFwvL2kudGVzdCh1YSkgJiYgKHJlc3VsdC50b3VjaHBhZCA9IHQpXG4gICAgfVxuICAgIGVsc2UgaWYgKC9iYWRhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JhZGEnXG4gICAgICAsIGJhZGE6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZG9sZmluXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL3RpemVuL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiBnZXRGaXJzdE1hdGNoKC9eKC4qKVxcLyguKikgLyksXG4gICAgICAgIHZlcnNpb246IGdldFNlY29uZE1hdGNoKC9eKC4qKVxcLyguKikgLylcbiAgICAgfTtcbiAgIH1cblxuICAgIC8vIHNldCB3ZWJraXQgb3IgZ2Vja28gZmxhZyBmb3IgYnJvd3NlcnMgYmFzZWQgb24gdGhlc2UgZW5naW5lc1xuICAgIGlmICghcmVzdWx0Lm1zZWRnZSAmJiAvKGFwcGxlKT93ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIldlYmtpdFwiXG4gICAgICByZXN1bHQud2Via2l0ID0gdFxuICAgICAgaWYgKCFyZXN1bHQudmVyc2lvbiAmJiB2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0Lm9wZXJhICYmIC9nZWNrb1xcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiR2Vja29cIlxuICAgICAgcmVzdWx0LmdlY2tvID0gdFxuICAgICAgcmVzdWx0LnZlcnNpb24gPSByZXN1bHQudmVyc2lvbiB8fCBnZXRGaXJzdE1hdGNoKC9nZWNrb1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICB9XG5cbiAgICAvLyBzZXQgT1MgZmxhZ3MgZm9yIHBsYXRmb3JtcyB0aGF0IGhhdmUgbXVsdGlwbGUgYnJvd3NlcnNcbiAgICBpZiAoIXJlc3VsdC5tc2VkZ2UgJiYgKGFuZHJvaWQgfHwgcmVzdWx0LnNpbGspKSB7XG4gICAgICByZXN1bHQuYW5kcm9pZCA9IHRcbiAgICB9IGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0W2lvc2RldmljZV0gPSB0XG4gICAgICByZXN1bHQuaW9zID0gdFxuICAgIH1cblxuICAgIC8vIE9TIHZlcnNpb24gZXh0cmFjdGlvblxuICAgIHZhciBvc1ZlcnNpb24gPSAnJztcbiAgICBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL29zIChcXGQrKFtfXFxzXVxcZCspKikgbGlrZSBtYWMgb3MgeC9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2FuZHJvaWRbIFxcLy1dKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53ZWJvcykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvKD86d2VifGhwdylvc1xcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmxhY2tiZXJyeSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvcmltXFxzdGFibGV0XFxzb3NcXHMoXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJhZGEpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2JhZGFcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LnRpemVuKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC90aXplbltcXC9cXHNdKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9XG4gICAgaWYgKG9zVmVyc2lvbikge1xuICAgICAgcmVzdWx0Lm9zdmVyc2lvbiA9IG9zVmVyc2lvbjtcbiAgICB9XG5cbiAgICAvLyBkZXZpY2UgdHlwZSBleHRyYWN0aW9uXG4gICAgdmFyIG9zTWFqb3JWZXJzaW9uID0gb3NWZXJzaW9uLnNwbGl0KCcuJylbMF07XG4gICAgaWYgKHRhYmxldCB8fCBpb3NkZXZpY2UgPT0gJ2lwYWQnIHx8IChhbmRyb2lkICYmIChvc01ham9yVmVyc2lvbiA9PSAzIHx8IChvc01ham9yVmVyc2lvbiA9PSA0ICYmICFtb2JpbGUpKSkgfHwgcmVzdWx0LnNpbGspIHtcbiAgICAgIHJlc3VsdC50YWJsZXQgPSB0XG4gICAgfSBlbHNlIGlmIChtb2JpbGUgfHwgaW9zZGV2aWNlID09ICdpcGhvbmUnIHx8IGlvc2RldmljZSA9PSAnaXBvZCcgfHwgYW5kcm9pZCB8fCByZXN1bHQuYmxhY2tiZXJyeSB8fCByZXN1bHQud2Vib3MgfHwgcmVzdWx0LmJhZGEpIHtcbiAgICAgIHJlc3VsdC5tb2JpbGUgPSB0XG4gICAgfVxuXG4gICAgLy8gR3JhZGVkIEJyb3dzZXIgU3VwcG9ydFxuICAgIC8vIGh0dHA6Ly9kZXZlbG9wZXIueWFob28uY29tL3l1aS9hcnRpY2xlcy9nYnNcbiAgICBpZiAocmVzdWx0Lm1zZWRnZSB8fFxuICAgICAgICAocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uID49IDIwKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPj0gMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQuYmxhY2tiZXJyeSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4xKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5hID0gdDtcbiAgICB9XG4gICAgZWxzZSBpZiAoKHJlc3VsdC5tc2llICYmIHJlc3VsdC52ZXJzaW9uIDwgMTApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uIDwgMjApIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA8IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uIDwgNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA8IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPCA2KVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5jID0gdFxuICAgIH0gZWxzZSByZXN1bHQueCA9IHRcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHZhciBib3dzZXIgPSBkZXRlY3QodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IDogJycpXG5cbiAgYm93c2VyLnRlc3QgPSBmdW5jdGlvbiAoYnJvd3Nlckxpc3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJyb3dzZXJMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYnJvd3Nlckl0ZW0gPSBicm93c2VyTGlzdFtpXTtcbiAgICAgIGlmICh0eXBlb2YgYnJvd3Nlckl0ZW09PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJJdGVtIGluIGJvd3Nlcikge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0IHNvIHdlIGNhblxuICAgKiByZXVzZSBpdCB0byB0ZXN0IG90aGVyIHVzZXIgYWdlbnRzLlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgZnV0dXJlIHRlc3RzLlxuICAgKi9cbiAgYm93c2VyLl9kZXRlY3QgPSBkZXRlY3Q7XG5cbiAgcmV0dXJuIGJvd3NlclxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgZ2V0U2libGluZyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHNpYmxpbmcgPSBlbGVtZW50W3R5cGVdO1xuICAgICAgaWYgKHNpYmxpbmcgJiYgc2libGluZy5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpKSByZXR1cm4gc2libGluZztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuZXh0OiBnZXRTaWJsaW5nKCduZXh0RWxlbWVudFNpYmxpbmcnKSxcbiAgICBwcmV2aW91czogZ2V0U2libGluZygncHJldmlvdXNFbGVtZW50U2libGluZycpLFxuICB9O1xufSkoKTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4vdXRpbC9zdHJpbmcnKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgYWxsb3dlZEVsZW1lbnRzLCByZXF1aXJlZEF0dHJpYnV0ZXMsIHRyYW5zZm9ybUVsZW1lbnRzO1xuICB2YXIgYmxvY2tMZXZlbEVsZW1lbnRzLCBzcGxpdEludG9CbG9ja3M7XG4gIHZhciB3aGl0ZXNwYWNlT25seSA9IC9eXFxzKiQvO1xuICB2YXIgYmxvY2tQbGFjZWhvbGRlciA9ICc8IS0tIEJMT0NLIC0tPic7XG5cbiAgdmFyIHVwZGF0ZUNvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgaSwgbmFtZSwgcnVsZXMgPSBjb25maWcucGFzdGVkSHRtbFJ1bGVzO1xuICAgIGFsbG93ZWRFbGVtZW50cyA9IHJ1bGVzLmFsbG93ZWRFbGVtZW50cyB8fCB7fTtcbiAgICByZXF1aXJlZEF0dHJpYnV0ZXMgPSBydWxlcy5yZXF1aXJlZEF0dHJpYnV0ZXMgfHwge307XG4gICAgdHJhbnNmb3JtRWxlbWVudHMgPSBydWxlcy50cmFuc2Zvcm1FbGVtZW50cyB8fCB7fTtcblxuICAgIGJsb2NrTGV2ZWxFbGVtZW50cyA9IHt9O1xuICAgIGZvciAoaSA9IDA7IGkgPCBydWxlcy5ibG9ja0xldmVsRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5hbWUgPSBydWxlcy5ibG9ja0xldmVsRWxlbWVudHNbaV07XG4gICAgICBibG9ja0xldmVsRWxlbWVudHNbbmFtZV0gPSB0cnVlO1xuICAgIH1cbiAgICBzcGxpdEludG9CbG9ja3MgPSB7fTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcnVsZXMuc3BsaXRJbnRvQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuYW1lID0gcnVsZXMuc3BsaXRJbnRvQmxvY2tzW2ldO1xuICAgICAgc3BsaXRJbnRvQmxvY2tzW25hbWVdID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgdXBkYXRlQ29uZmlnKGNvbmZpZyk7XG5cbiAgcmV0dXJuIHtcblxuICAgIHVwZGF0ZUNvbmZpZzogdXBkYXRlQ29uZmlnLFxuXG4gICAgcGFzdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvciwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb2N1bWVudCA9IGVsZW1lbnQub3duZXJEb2N1bWVudDtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGNvbmZpZy5wYXN0aW5nQXR0cmlidXRlLCB0cnVlKTtcblxuICAgICAgaWYgKGN1cnNvci5pc1NlbGVjdGlvbikge1xuICAgICAgICBjdXJzb3IgPSBjdXJzb3IuZGVsZXRlQ29udGVudCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBwbGFjZWhvbGRlciBhbmQgc2V0IHRoZSBmb2N1cyB0byB0aGUgcGFzdGVob2xkZXJcbiAgICAgIC8vIHRvIHJlZGlyZWN0IHRoZSBicm93c2VyIHBhc3RpbmcgaW50byB0aGUgcGFzdGVob2xkZXIuXG4gICAgICBjdXJzb3Iuc2F2ZSgpO1xuICAgICAgdmFyIHBhc3RlSG9sZGVyID0gdGhpcy5pbmplY3RQYXN0ZWhvbGRlcihkb2N1bWVudCk7XG4gICAgICBwYXN0ZUhvbGRlci5mb2N1cygpO1xuXG4gICAgICAvLyBVc2UgYSB0aW1lb3V0IHRvIGdpdmUgdGhlIGJyb3dzZXIgc29tZSB0aW1lIHRvIHBhc3RlIHRoZSBjb250ZW50LlxuICAgICAgLy8gQWZ0ZXIgdGhhdCBncmFiIHRoZSBwYXN0ZWQgY29udGVudCwgZmlsdGVyIGl0IGFuZCByZXN0b3JlIHRoZSBmb2N1cy5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmxvY2tzO1xuXG4gICAgICAgIGJsb2NrcyA9IF90aGlzLnBhcnNlQ29udGVudChwYXN0ZUhvbGRlcik7XG4gICAgICAgICQocGFzdGVIb2xkZXIpLnJlbW92ZSgpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShjb25maWcucGFzdGluZ0F0dHJpYnV0ZSk7XG5cbiAgICAgICAgY3Vyc29yLnJlc3RvcmUoKTtcbiAgICAgICAgY2FsbGJhY2soYmxvY2tzLCBjdXJzb3IpO1xuXG4gICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgaW5qZWN0UGFzdGVob2xkZXI6IGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gICAgICB2YXIgcGFzdGVIb2xkZXIgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxuICAgICAgICAuYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSlcbiAgICAgICAgLmNzcyh7XG4gICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgcmlnaHQ6ICc1cHgnLFxuICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgd2lkdGg6ICcxcHgnLFxuICAgICAgICAgIGhlaWdodDogJzFweCcsXG4gICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgIG91dGxpbmU6ICdub25lJ1xuICAgICAgICB9KVswXTtcblxuICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQocGFzdGVIb2xkZXIpO1xuICAgICAgcmV0dXJuIHBhc3RlSG9sZGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiAtIFBhcnNlIHBhc3RlZCBjb250ZW50XG4gICAgICogLSBTcGxpdCBpdCB1cCBpbnRvIGJsb2Nrc1xuICAgICAqIC0gY2xlYW4gYW5kIG5vcm1hbGl6ZSBldmVyeSBibG9ja1xuICAgICAqXG4gICAgICogQHBhcmFtIHtET00gbm9kZX0gQSBjb250YWluZXIgd2hlcmUgdGhlIHBhc3RlZCBjb250ZW50IGlzIGxvY2F0ZWQuXG4gICAgICogQHJldHVybnMge0FycmF5IG9mIFN0cmluZ3N9IEFuIGFycmF5IG9mIGNsZWFuZWQgaW5uZXJIVE1MIGxpa2Ugc3RyaW5ncy5cbiAgICAgKi9cbiAgICBwYXJzZUNvbnRlbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblxuICAgICAgLy8gRmlsdGVyIHBhc3RlZCBjb250ZW50XG4gICAgICB2YXIgcGFzdGVkU3RyaW5nID0gdGhpcy5maWx0ZXJIdG1sRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgIC8vIEhhbmRsZSBCbG9ja3NcbiAgICAgIHZhciBibG9ja3MgPSBwYXN0ZWRTdHJpbmcuc3BsaXQoYmxvY2tQbGFjZWhvbGRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBibG9ja3NbaV07XG5cbiAgICAgICAgLy8gQ2xlYW4gV2hpdGVzYXBjZVxuICAgICAgICBlbnRyeSA9IHRoaXMuY2xlYW5XaGl0ZXNwYWNlKGVudHJ5KTtcblxuICAgICAgICAvLyBUcmltIHBhc3RlZCBUZXh0XG4gICAgICAgIGVudHJ5ID0gc3RyaW5nLnRyaW0oZW50cnkpO1xuXG4gICAgICAgIGJsb2Nrc1tpXSA9IGVudHJ5O1xuICAgICAgfVxuXG4gICAgICBibG9ja3MgPSBibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiAhd2hpdGVzcGFjZU9ubHkudGVzdChlbnRyeSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9LFxuXG4gICAgZmlsdGVySHRtbEVsZW1lbnRzOiBmdW5jdGlvbihlbGVtLCBwYXJlbnRzKSB7XG4gICAgICBpZiAoIXBhcmVudHMpIHBhcmVudHMgPSBbXTtcblxuICAgICAgdmFyIGNoaWxkLCBjb250ZW50ID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW0uY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZCA9IGVsZW0uY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSkge1xuICAgICAgICAgIHZhciBjaGlsZENvbnRlbnQgPSB0aGlzLmZpbHRlckh0bWxFbGVtZW50cyhjaGlsZCwgcGFyZW50cyk7XG4gICAgICAgICAgY29udGVudCArPSB0aGlzLmNvbmRpdGlvbmFsTm9kZVdyYXAoY2hpbGQsIGNoaWxkQ29udGVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hpbGQubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgICAgLy8gRXNjYXBlIEhUTUwgY2hhcmFjdGVycyA8LCA+IGFuZCAmXG4gICAgICAgICAgY29udGVudCArPSBzdHJpbmcuZXNjYXBlSHRtbChjaGlsZC5ub2RlVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0sXG5cbiAgICBjb25kaXRpb25hbE5vZGVXcmFwOiBmdW5jdGlvbihjaGlsZCwgY29udGVudCkge1xuICAgICAgdmFyIG5vZGVOYW1lID0gY2hpbGQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIG5vZGVOYW1lID0gdGhpcy50cmFuc2Zvcm1Ob2RlTmFtZShub2RlTmFtZSk7XG5cbiAgICAgIGlmICggdGhpcy5zaG91bGRLZWVwTm9kZShub2RlTmFtZSwgY2hpbGQpICkge1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuZmlsdGVyQXR0cmlidXRlcyhub2RlTmFtZSwgY2hpbGQpO1xuICAgICAgICBpZiAobm9kZU5hbWUgPT09ICdicicpIHtcbiAgICAgICAgICByZXR1cm4gJzwnKyBub2RlTmFtZSArIGF0dHJpYnV0ZXMgKyc+JztcbiAgICAgICAgfSBlbHNlIGlmICggIXdoaXRlc3BhY2VPbmx5LnRlc3QoY29udGVudCkgKSB7XG4gICAgICAgICAgcmV0dXJuICc8Jysgbm9kZU5hbWUgKyBhdHRyaWJ1dGVzICsnPicrIGNvbnRlbnQgKyc8LycrIG5vZGVOYW1lICsnPic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzcGxpdEludG9CbG9ja3Nbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrUGxhY2Vob2xkZXIgKyBjb250ZW50ICsgYmxvY2tQbGFjZWhvbGRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChibG9ja0xldmVsRWxlbWVudHNbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgLy8gcHJldmVudCBtaXNzaW5nIHdoaXRlc3BhY2UgYmV0d2VlbiB0ZXh0IHdoZW4gYmxvY2stbGV2ZWxcbiAgICAgICAgICAvLyBlbGVtZW50cyBhcmUgcmVtb3ZlZC5cbiAgICAgICAgICByZXR1cm4gY29udGVudCArICcgJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaWx0ZXJBdHRyaWJ1dGVzOiBmdW5jdGlvbihub2RlTmFtZSwgbm9kZSkge1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSAnJztcblxuICAgICAgZm9yICh2YXIgaT0wLCBsZW49KG5vZGUuYXR0cmlidXRlcyB8fCBbXSkubGVuZ3RoOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBuYW1lICA9IG5vZGUuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICB2YXIgdmFsdWUgPSBub2RlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICAgIGlmICgoYWxsb3dlZEVsZW1lbnRzW25vZGVOYW1lXVtuYW1lXSkgJiYgdmFsdWUpIHtcbiAgICAgICAgICBhdHRyaWJ1dGVzICs9ICcgJyArIG5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybU5vZGVOYW1lOiBmdW5jdGlvbihub2RlTmFtZSkge1xuICAgICAgaWYgKHRyYW5zZm9ybUVsZW1lbnRzW25vZGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtRWxlbWVudHNbbm9kZU5hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYXNSZXF1aXJlZEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKG5vZGVOYW1lLCBub2RlKSB7XG4gICAgICB2YXIgYXR0ck5hbWUsIGF0dHJWYWx1ZTtcbiAgICAgIHZhciByZXF1aXJlZEF0dHJzID0gcmVxdWlyZWRBdHRyaWJ1dGVzW25vZGVOYW1lXTtcbiAgICAgIGlmIChyZXF1aXJlZEF0dHJzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWRBdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGF0dHJOYW1lID0gcmVxdWlyZWRBdHRyc1tpXTtcbiAgICAgICAgICBhdHRyVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgICAgaWYgKCFhdHRyVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzaG91bGRLZWVwTm9kZTogZnVuY3Rpb24obm9kZU5hbWUsIG5vZGUpIHtcbiAgICAgIHJldHVybiBhbGxvd2VkRWxlbWVudHNbbm9kZU5hbWVdICYmIHRoaXMuaGFzUmVxdWlyZWRBdHRyaWJ1dGVzKG5vZGVOYW1lLCBub2RlKTtcbiAgICB9LFxuXG4gICAgY2xlYW5XaGl0ZXNwYWNlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBjbGVhbmVkU3RyID0gc3RyLnJlcGxhY2UoLyguKShcXHUwMEEwKS9nLCBmdW5jdGlvbihtYXRjaCwgZ3JvdXAxLCBncm91cDIsIG9mZnNldCwgc3RyaW5nKSB7XG4gICAgICAgIGlmICggL1tcXHUwMDIwXS8udGVzdChncm91cDEpICkge1xuICAgICAgICAgIHJldHVybiBncm91cDEgKyAnXFx1MDBBMCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGdyb3VwMSArICcgJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gY2xlYW5lZFN0cjtcbiAgICB9XG5cbiAgfTtcblxufSkoKTtcbiIsIlxuLyoqXG4gKiBEZWZpbmVzIGFsbCBzdXBwb3J0ZWQgZXZlbnQgdHlwZXMgYnkgRWRpdGFibGUuSlMgYW5kIHByb3ZpZGVzIGRlZmF1bHRcbiAqIGltcGxlbWVudGF0aW9ucyBmb3IgdGhlbSBkZWZpbmVkIGluIHt7I2Nyb3NzTGluayBcIkJlaGF2aW9yXCJ9fXt7L2Nyb3NzTGlua319XG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZzogZmFsc2UsXG4gIGxvZ0Vycm9yczogdHJ1ZSxcbiAgZWRpdGFibGVDbGFzczogJ2pzLWVkaXRhYmxlJyxcbiAgZWRpdGFibGVEaXNhYmxlZENsYXNzOiAnanMtZWRpdGFibGUtZGlzYWJsZWQnLFxuICBwYXN0aW5nQXR0cmlidXRlOiAnZGF0YS1lZGl0YWJsZS1pcy1wYXN0aW5nJyxcbiAgYm9sZFRhZzogJ3N0cm9uZycsXG4gIGl0YWxpY1RhZzogJ2VtJyxcblxuICAvLyBSdWxlcyB0aGF0IGFyZSBhcHBsaWVkIHdoZW4gZmlsdGVyaW5nIHBhc3RlZCBjb250ZW50XG4gIHBhc3RlZEh0bWxSdWxlczoge1xuXG4gICAgLy8gRWxlbWVudHMgYW5kIHRoZWlyIGF0dHJpYnV0ZXMgdG8ga2VlcCBpbiBwYXN0ZWQgdGV4dFxuICAgIGFsbG93ZWRFbGVtZW50czoge1xuICAgICAgJ2EnOiB7XG4gICAgICAgICdocmVmJzogdHJ1ZVxuICAgICAgfSxcbiAgICAgICdzdHJvbmcnOiB7fSxcbiAgICAgICdlbSc6IHt9LFxuICAgICAgJ2JyJzoge31cbiAgICB9LFxuXG4gICAgLy8gRWxlbWVudHMgdGhhdCBoYXZlIHJlcXVpcmVkIGF0dHJpYnV0ZXMuXG4gICAgLy8gSWYgdGhlc2UgYXJlIG5vdCBwcmVzZW50IHRoZSBlbGVtZW50cyBhcmUgZmlsdGVyZWQgb3V0LlxuICAgIC8vIFJlcXVpcmVkIGF0dHJpYnV0ZXMgaGF2ZSB0byBiZSBwcmVzZW50IGluIHRoZSAnYWxsb3dlZCcgb2JqZWN0XG4gICAgLy8gYXMgd2VsbCBpZiB0aGV5IHNob3VsZCBub3QgYmUgZmlsdGVyZWQgb3V0LlxuICAgIHJlcXVpcmVkQXR0cmlidXRlczoge1xuICAgICAgJ2EnOiBbJ2hyZWYnXVxuICAgIH0sXG5cbiAgICAvLyBFbGVtZW50cyB0aGF0IHNob3VsZCBiZSB0cmFuc2Zvcm1lZCBpbnRvIG90aGVyIGVsZW1lbnRzXG4gICAgdHJhbnNmb3JtRWxlbWVudHM6IHtcbiAgICAgICdiJzogJ3N0cm9uZycsXG4gICAgICAnaSc6ICdlbSdcbiAgICB9LFxuXG4gICAgLy8gQSBsaXN0IG9mIGVsZW1lbnRzIHdoaWNoIHNob3VsZCBiZSBzcGxpdCBpbnRvIHBhcmFncmFwaHMuXG4gICAgc3BsaXRJbnRvQmxvY2tzOiBbJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ3AnLCAnYmxvY2txdW90ZSddLFxuXG4gICAgLy8gQSBsaXN0IG9mIEhUTUwgYmxvY2sgbGV2ZWwgZWxlbWVudHMuXG4gICAgYmxvY2tMZXZlbEVsZW1lbnRzOiBbJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ2RpdicsICdwJywgJ3ByZScsICdocicsICdibG9ja3F1b3RlJywgJ2FydGljbGUnLCAnZmlndXJlJywgJ2hlYWRlcicsICdmb290ZXInLCAndWwnLCAnb2wnLCAnbGknLCAnc2VjdGlvbicsICd0YWJsZScsICd2aWRlbyddXG4gIH1cblxufTtcblxuIiwidmFyIHJhbmd5ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3Jhbmd5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydyYW5neSddIDogbnVsbCk7XG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgcmFuZ3kgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1sncmFuZ3knXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3Jhbmd5J10gOiBudWxsKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG52YXIgcmFuZ2VTYXZlUmVzdG9yZSA9IHJlcXVpcmUoJy4vcmFuZ2Utc2F2ZS1yZXN0b3JlJyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuL3V0aWwvc3RyaW5nJyk7XG5cbnZhciBjb250ZW50O1xubW9kdWxlLmV4cG9ydHMgPSBjb250ZW50ID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciByZXN0b3JlUmFuZ2UgPSBmdW5jdGlvbihob3N0LCByYW5nZSwgZnVuYykge1xuICAgIHJhbmdlID0gcmFuZ2VTYXZlUmVzdG9yZS5zYXZlKHJhbmdlKTtcbiAgICBmdW5jLmNhbGwoY29udGVudCk7XG4gICAgcmV0dXJuIHJhbmdlU2F2ZVJlc3RvcmUucmVzdG9yZShob3N0LCByYW5nZSk7XG4gIH07XG5cbiAgdmFyIHplcm9XaWR0aFNwYWNlID0gL1xcdTIwMEIvZztcbiAgdmFyIHplcm9XaWR0aE5vbkJyZWFraW5nU3BhY2UgPSAvXFx1RkVGRi9nO1xuICB2YXIgd2hpdGVzcGFjZUV4Y2VwdFNwYWNlID0gL1teXFxTIF0vZztcblxuICByZXR1cm4ge1xuXG4gICAgLyoqXG4gICAgICogQ2xlYW4gdXAgdGhlIEh0bWwuXG4gICAgICovXG4gICAgdGlkeUh0bWw6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIC8vIGlmIChlbGVtZW50Lm5vcm1hbGl6ZSkgZWxlbWVudC5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMubm9ybWFsaXplVGFncyhlbGVtZW50KTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZW1wdHkgdGFncyBhbmQgbWVyZ2UgY29uc2VjdXRpdmUgdGFncyAodGhleSBtdXN0IGhhdmUgdGhlIHNhbWVcbiAgICAgKiBhdHRyaWJ1dGVzKS5cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgbm9ybWFsaXplVGFnc1xuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHByb2Nlc3MuXG4gICAgICovXG4gICAgbm9ybWFsaXplVGFnczogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGksIGosIG5vZGUsIHNpYmxpbmc7XG5cbiAgICAgIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBub2RlID0gZWxlbWVudC5jaGlsZE5vZGVzW2ldO1xuICAgICAgICBpZiAoIW5vZGUpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIHNraXAgZW1wdHkgdGFncywgc28gdGhleSdsbCBnZXQgcmVtb3ZlZFxuICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSAhPT0gJ0JSJyAmJiAhbm9kZS50ZXh0Q29udGVudCkgY29udGludWU7XG5cbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlICYmIG5vZGUubm9kZU5hbWUgIT09ICdCUicpIHtcbiAgICAgICAgICBzaWJsaW5nID0gbm9kZTtcbiAgICAgICAgICB3aGlsZSAoKHNpYmxpbmcgPSBzaWJsaW5nLm5leHRTaWJsaW5nKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCFwYXJzZXIuaXNTYW1lTm9kZShzaWJsaW5nLCBub2RlKSlcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBzaWJsaW5nLmNoaWxkTm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChzaWJsaW5nLmNoaWxkTm9kZXNbal0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2libGluZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNpYmxpbmcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubm9ybWFsaXplVGFncyhub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKG5vZGUuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKGVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB9LFxuXG4gICAgbm9ybWFsaXplV2hpdGVzcGFjZTogZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh3aGl0ZXNwYWNlRXhjZXB0U3BhY2UsICcgJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFuIHRoZSBlbGVtZW50IGZyb20gY2hhcmFjdGVyLCB0YWdzLCBldGMuLi4gYWRkZWQgYnkgdGhlIHBsdWdpbiBsb2dpYy5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgY2xlYW5JbnRlcm5hbHNcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBwcm9jZXNzLlxuICAgICAqL1xuICAgIGNsZWFuSW50ZXJuYWxzOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAvLyBVc2VzIGV4dHJhY3QgY29udGVudCBmb3Igc2ltcGxpY2l0eS4gQSBjdXN0b20gbWV0aG9kXG4gICAgICAvLyB0aGF0IGRvZXMgbm90IGNsb25lIHRoZSBlbGVtZW50IGNvdWxkIGJlIGZhc3RlciBpZiBuZWVkZWQuXG4gICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRoaXMuZXh0cmFjdENvbnRlbnQoZWxlbWVudCwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3RzIHRoZSBjb250ZW50IGZyb20gYSBob3N0IGVsZW1lbnQuXG4gICAgICogRG9lcyBub3QgdG91Y2ggb3IgY2hhbmdlIHRoZSBob3N0LiBKdXN0IHJldHVybnNcbiAgICAgKiB0aGUgY29udGVudCBhbmQgcmVtb3ZlcyBlbGVtZW50cyBtYXJrZWQgZm9yIHJlbW92YWwgYnkgZWRpdGFibGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0RPTSBub2RlIG9yIGRvY3VtZW50IGZyYW1nZW50fSBFbGVtZW50IHdoZXJlIHRvIGNsZWFuIG91dCB0aGUgaW5uZXJIVE1MLiBJZiB5b3UgcGFzcyBhIGRvY3VtZW50IGZyYWdtZW50IGl0IHdpbGwgYmUgZW1wdHkgYWZ0ZXIgdGhpcyBjYWxsLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gRmxhZyB3aGV0aGVyIHRvIGtlZXAgdWkgZWxlbWVudHMgbGlrZSBzcGVsbGNoZWNraW5nIGhpZ2hsaWdodHMuXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIGNsZWFuZWQgaW5uZXJIVE1MIG9mIHRoZSBwYXNzZWQgZWxlbWVudCBvciBkb2N1bWVudCBmcmFnbWVudC5cbiAgICAgKi9cbiAgICBleHRyYWN0Q29udGVudDogZnVuY3Rpb24oZWxlbWVudCwga2VlcFVpRWxlbWVudHMpIHtcbiAgICAgIHZhciBpbm5lckh0bWw7XG4gICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZG9jdW1lbnRGcmFnbWVudE5vZGUpIHtcbiAgICAgICAgaW5uZXJIdG1sID0gdGhpcy5nZXRJbm5lckh0bWxPZkZyYWdtZW50KGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5uZXJIdG1sID0gZWxlbWVudC5pbm5lckhUTUw7XG4gICAgICB9XG5cbiAgICAgIGlubmVySHRtbCA9IGlubmVySHRtbC5yZXBsYWNlKHplcm9XaWR0aE5vbkJyZWFraW5nU3BhY2UsICcnKTsgLy8gVXNlZCBmb3IgZm9yY2luZyBpbmxpbmUgZWxtZW50cyB0byBoYXZlIGEgaGVpZ2h0XG4gICAgICBpbm5lckh0bWwgPSBpbm5lckh0bWwucmVwbGFjZSh6ZXJvV2lkdGhTcGFjZSwgJzxicj4nKTsgLy8gVXNlZCBmb3IgY3Jvc3MtYnJvd3NlciBuZXdsaW5lc1xuXG4gICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNsb25lLmlubmVySFRNTCA9IGlubmVySHRtbDtcbiAgICAgIHRoaXMudW53cmFwSW50ZXJuYWxOb2RlcyhjbG9uZSwga2VlcFVpRWxlbWVudHMpO1xuXG4gICAgICByZXR1cm4gY2xvbmUuaW5uZXJIVE1MO1xuICAgIH0sXG5cbiAgICBnZXRJbm5lckh0bWxPZkZyYWdtZW50OiBmdW5jdGlvbihkb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XG4gICAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZG9jdW1lbnQgZnJhZ21lbnQgZnJvbSBhbiBodG1sIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlLmcuICdzb21lIGh0bWwgPHNwYW4+dGV4dDwvc3Bhbj4uJ1xuICAgICAqL1xuICAgIGNyZWF0ZUZyYWdtZW50RnJvbVN0cmluZzogZnVuY3Rpb24oaHRtbFN0cmluZykge1xuICAgICAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgdmFyIGNvbnRlbnRzID0gJCgnPGRpdj4nKS5odG1sKGh0bWxTdHJpbmcpLmNvbnRlbnRzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbCA9IGNvbnRlbnRzW2ldO1xuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfSxcblxuICAgIGFkb3B0RWxlbWVudDogZnVuY3Rpb24obm9kZSwgZG9jKSB7XG4gICAgICBpZiAobm9kZS5vd25lckRvY3VtZW50ICE9PSBkb2MpIHtcbiAgICAgICAgcmV0dXJuIGRvYy5hZG9wdE5vZGUobm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhIHNsaWdodCB2YXJpYXRpb24gb2YgdGhlIGNsb25lQ29udGVudHMgbWV0aG9kIG9mIGEgcmFuZ3lSYW5nZS5cbiAgICAgKiBJdCB3aWxsIHJldHVybiBhIGZyYWdtZW50IHdpdGggdGhlIGNsb25lZCBjb250ZW50cyBvZiB0aGUgcmFuZ2VcbiAgICAgKiB3aXRob3V0IHRoZSBjb21tb25BbmNlc3RvckVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3Jhbmd5UmFuZ2V9XG4gICAgICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAgICAgKi9cbiAgICBjbG9uZVJhbmdlQ29udGVudHM6IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICB2YXIgcmFuZ2VGcmFnbWVudCA9IHJhbmdlLmNsb25lQ29udGVudHMoKTtcbiAgICAgIHZhciBwYXJlbnQgPSByYW5nZUZyYWdtZW50LmNoaWxkTm9kZXNbMF07XG4gICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICB3aGlsZSAocGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHBhcmVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGVsZW1lbnRzIHRoYXQgd2VyZSBpbnNlcnRlZCBmb3IgaW50ZXJuYWwgb3IgdXNlciBpbnRlcmZhY2UgcHVycG9zZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RE9NIG5vZGV9XG4gICAgICogQHBhcmFtIHtCb29sZWFufSB3aGV0aGVyIHRvIGtlZXAgdWkgZWxlbWVudHMgbGlrZSBzcGVsbGNoZWNraW5nIGhpZ2hsaWdodHNcbiAgICAgKiBDdXJyZW50bHk6XG4gICAgICogLSBTYXZlZCByYW5nZXNcbiAgICAgKi9cbiAgICB1bndyYXBJbnRlcm5hbE5vZGVzOiBmdW5jdGlvbihzaWJsaW5nLCBrZWVwVWlFbGVtZW50cykge1xuICAgICAgd2hpbGUgKHNpYmxpbmcpIHtcbiAgICAgICAgdmFyIG5leHRTaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZztcblxuICAgICAgICBpZiAoc2libGluZy5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZWxlbWVudE5vZGUpIHtcbiAgICAgICAgICB2YXIgYXR0ciA9IHNpYmxpbmcuZ2V0QXR0cmlidXRlKCdkYXRhLWVkaXRhYmxlJyk7XG5cbiAgICAgICAgICBpZiAoc2libGluZy5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLnVud3JhcEludGVybmFsTm9kZXMoc2libGluZy5maXJzdENoaWxkLCBrZWVwVWlFbGVtZW50cyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGF0dHIgPT09ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAkKHNpYmxpbmcpLnJlbW92ZSgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ciA9PT0gJ3Vud3JhcCcpIHtcbiAgICAgICAgICAgIHRoaXMudW53cmFwKHNpYmxpbmcpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ciA9PT0gJ3VpLXJlbW92ZScgJiYgIWtlZXBVaUVsZW1lbnRzKSB7XG4gICAgICAgICAgICAkKHNpYmxpbmcpLnJlbW92ZSgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ciA9PT0gJ3VpLXVud3JhcCcgJiYgIWtlZXBVaUVsZW1lbnRzKSB7XG4gICAgICAgICAgICB0aGlzLnVud3JhcChzaWJsaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2libGluZyA9IG5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhZ3MgdGhhdCBzdGFydCBvciBlbmQgaW5zaWRlIHRoZSByYW5nZVxuICAgICAqL1xuICAgIGdldFRhZ3M6IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCBmaWx0ZXJGdW5jKSB7XG4gICAgICB2YXIgdGFncyA9IHRoaXMuZ2V0SW5uZXJUYWdzKHJhbmdlLCBmaWx0ZXJGdW5jKTtcblxuICAgICAgLy8gZ2V0IGFsbCB0YWdzIHRoYXQgc3Vycm91bmQgdGhlIHJhbmdlXG4gICAgICB2YXIgbm9kZSA9IHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuICAgICAgd2hpbGUgKG5vZGUgIT09IGhvc3QpIHtcbiAgICAgICAgaWYgKCFmaWx0ZXJGdW5jIHx8IGZpbHRlckZ1bmMobm9kZSkpIHtcbiAgICAgICAgICB0YWdzLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YWdzO1xuICAgIH0sXG5cbiAgICBnZXRUYWdzQnlOYW1lOiBmdW5jdGlvbihob3N0LCByYW5nZSwgdGFnTmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFncyhob3N0LCByYW5nZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gdGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFncyB0aGF0IHN0YXJ0IG9yIGVuZCBpbnNpZGUgdGhlIHJhbmdlXG4gICAgICovXG4gICAgZ2V0SW5uZXJUYWdzOiBmdW5jdGlvbihyYW5nZSwgZmlsdGVyRnVuYykge1xuICAgICAgcmV0dXJuIHJhbmdlLmdldE5vZGVzKFtub2RlVHlwZS5lbGVtZW50Tm9kZV0sIGZpbHRlckZ1bmMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm0gYW4gYXJyYXkgb2YgZWxlbWVudHMgaW50byBhIGFuIGFycmF5XG4gICAgICogb2YgdGFnbmFtZXMgaW4gdXBwZXJjYXNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGV4YW1wbGU6IFsnU1RST05HJywgJ0InXVxuICAgICAqL1xuICAgIGdldFRhZ05hbWVzOiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgdmFyIG5hbWVzID0gW107XG4gICAgICBpZiAoIWVsZW1lbnRzKSByZXR1cm4gbmFtZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbmFtZXMucHVzaChlbGVtZW50c1tpXS5ub2RlTmFtZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmFtZXM7XG4gICAgfSxcblxuICAgIGlzQWZmZWN0ZWRCeTogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHRhZ05hbWUpIHtcbiAgICAgIHZhciBlbGVtO1xuICAgICAgdmFyIHRhZ3MgPSB0aGlzLmdldFRhZ3MoaG9zdCwgcmFuZ2UpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW0gPSB0YWdzW2ldO1xuICAgICAgICBpZiAoZWxlbS5ub2RlTmFtZSA9PT0gdGFnTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgcmFuZ2Ugc2VsZWN0cyBhbGwgb2YgdGhlIGVsZW1lbnRzIGNvbnRlbnRzLFxuICAgICAqIG5vdCBsZXNzIG9yIG1vcmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmlzaWJsZTogT25seSBjb21wYXJlIHZpc2libGUgdGV4dC4gVGhhdCB3YXkgaXQgZG9lcyBub3RcbiAgICAgKiAgIG1hdHRlciBpZiB0aGUgdXNlciBzZWxlY3RzIGFuIGFkZGl0aW9uYWwgd2hpdGVzcGFjZSBvciBub3QuXG4gICAgICovXG4gICAgaXNFeGFjdFNlbGVjdGlvbjogZnVuY3Rpb24ocmFuZ2UsIGVsZW0sIHZpc2libGUpIHtcbiAgICAgIHZhciBlbGVtUmFuZ2UgPSByYW5neS5jcmVhdGVSYW5nZSgpO1xuICAgICAgZWxlbVJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtKTtcbiAgICAgIGlmIChyYW5nZS5pbnRlcnNlY3RzUmFuZ2UoZWxlbVJhbmdlKSkge1xuICAgICAgICB2YXIgcmFuZ2VUZXh0ID0gcmFuZ2UudG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIGVsZW1UZXh0ID0gJChlbGVtKS50ZXh0KCk7XG5cbiAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICByYW5nZVRleHQgPSBzdHJpbmcudHJpbShyYW5nZVRleHQpO1xuICAgICAgICAgIGVsZW1UZXh0ID0gc3RyaW5nLnRyaW0oZWxlbVRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJhbmdlVGV4dCAhPT0gJycgJiYgcmFuZ2VUZXh0ID09PSBlbGVtVGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZXhwYW5kVG86IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCBlbGVtKSB7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbSk7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIHRvZ2dsZVRhZzogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIGVsZW0pIHtcbiAgICAgIHZhciBlbGVtcyA9IHRoaXMuZ2V0VGFnc0J5TmFtZShob3N0LCByYW5nZSwgZWxlbS5ub2RlTmFtZSk7XG5cbiAgICAgIGlmIChlbGVtcy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICB0aGlzLmlzRXhhY3RTZWxlY3Rpb24ocmFuZ2UsIGVsZW1zWzBdLCAndmlzaWJsZScpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUZvcm1hdHRpbmcoaG9zdCwgcmFuZ2UsIGVsZW0ubm9kZU5hbWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5mb3JjZVdyYXAoaG9zdCwgcmFuZ2UsIGVsZW0pO1xuICAgIH0sXG5cbiAgICBpc1dyYXBwYWJsZTogZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgIHJldHVybiByYW5nZS5jYW5TdXJyb3VuZENvbnRlbnRzKCk7XG4gICAgfSxcblxuICAgIGZvcmNlV3JhcDogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIGVsZW0pIHtcbiAgICAgIHJhbmdlID0gcmVzdG9yZVJhbmdlKGhvc3QsIHJhbmdlLCBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLm51a2UoaG9zdCwgcmFuZ2UsIGVsZW0ubm9kZU5hbWUpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJlbW92ZSBhbGwgdGFncyBpZiB0aGUgcmFuZ2UgaXMgbm90IHdyYXBwYWJsZVxuICAgICAgaWYgKCF0aGlzLmlzV3JhcHBhYmxlKHJhbmdlKSkge1xuICAgICAgICByYW5nZSA9IHJlc3RvcmVSYW5nZShob3N0LCByYW5nZSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICB0aGlzLm51a2UoaG9zdCwgcmFuZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy53cmFwKHJhbmdlLCBlbGVtKTtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgd3JhcDogZnVuY3Rpb24ocmFuZ2UsIGVsZW0pIHtcbiAgICAgIGVsZW0gPSBzdHJpbmcuaXNTdHJpbmcoZWxlbSkgP1xuICAgICAgICAkKGVsZW0pWzBdIDpcbiAgICAgICAgZWxlbTtcblxuICAgICAgaWYgKHRoaXMuaXNXcmFwcGFibGUocmFuZ2UpKSB7XG4gICAgICAgIHZhciBhID0gcmFuZ2Uuc3Vycm91bmRDb250ZW50cyhlbGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjb250ZW50LndyYXAoKTogY2FuIG5vdCBzdXJyb3VuZCByYW5nZScpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1bndyYXA6IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSk7XG4gICAgICB2YXIgY29udGVudHMgPSAkZWxlbS5jb250ZW50cygpO1xuICAgICAgaWYgKGNvbnRlbnRzLmxlbmd0aCkge1xuICAgICAgICBjb250ZW50cy51bndyYXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRlbGVtLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmVGb3JtYXR0aW5nOiBmdW5jdGlvbihob3N0LCByYW5nZSwgdGFnTmFtZSkge1xuICAgICAgcmV0dXJuIHJlc3RvcmVSYW5nZShob3N0LCByYW5nZSwgZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5udWtlKGhvc3QsIHJhbmdlLCB0YWdOYW1lKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbndyYXAgYWxsIHRhZ3MgdGhpcyByYW5nZSBpcyBhZmZlY3RlZCBieS5cbiAgICAgKiBDYW4gYWxzbyBhZmZlY3QgY29udGVudCBvdXRzaWRlIG9mIHRoZSByYW5nZS5cbiAgICAgKi9cbiAgICBudWtlOiBmdW5jdGlvbihob3N0LCByYW5nZSwgdGFnTmFtZSkge1xuICAgICAgdmFyIHRhZ3MgPSB0aGlzLmdldFRhZ3MoaG9zdCwgcmFuZ2UpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtID0gdGFnc1tpXTtcbiAgICAgICAgaWYgKCBlbGVtLm5vZGVOYW1lICE9PSAnQlInICYmICghdGFnTmFtZSB8fCBlbGVtLm5vZGVOYW1lID09PSB0YWdOYW1lLnRvVXBwZXJDYXNlKCkpICkge1xuICAgICAgICAgIHRoaXMudW53cmFwKGVsZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluc2VydCBhIHNpbmdsZSBjaGFyYWN0ZXIgKG9yIHN0cmluZykgYmVmb3JlIG9yIGFmdGVyIHRoZVxuICAgICAqIHRoZSByYW5nZS5cbiAgICAgKi9cbiAgICBpbnNlcnRDaGFyYWN0ZXI6IGZ1bmN0aW9uKHJhbmdlLCBjaGFyYWN0ZXIsIGF0U3RhcnQpIHtcbiAgICAgIHZhciBpbnNlcnRFbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoYXJhY3Rlcik7XG5cbiAgICAgIHZhciBib3VuZGFyeVJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgYm91bmRhcnlSYW5nZS5jb2xsYXBzZShhdFN0YXJ0KTtcbiAgICAgIGJvdW5kYXJ5UmFuZ2UuaW5zZXJ0Tm9kZShpbnNlcnRFbCk7XG5cbiAgICAgIGlmIChhdFN0YXJ0KSB7XG4gICAgICAgIHJhbmdlLnNldFN0YXJ0QmVmb3JlKGluc2VydEVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKGluc2VydEVsKTtcbiAgICAgIH1cbiAgICAgIHJhbmdlLm5vcm1hbGl6ZUJvdW5kYXJpZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Vycm91bmQgdGhlIHJhbmdlIHdpdGggY2hhcmFjdGVycyBsaWtlIHN0YXJ0IGFuZCBlbmQgcXVvdGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBzdXJyb3VuZFxuICAgICAqL1xuICAgIHN1cnJvdW5kOiBmdW5jdGlvbihob3N0LCByYW5nZSwgc3RhcnRDaGFyYWN0ZXIsIGVuZENoYXJhY3Rlcikge1xuICAgICAgaWYgKCFlbmRDaGFyYWN0ZXIpIGVuZENoYXJhY3RlciA9IHN0YXJ0Q2hhcmFjdGVyO1xuICAgICAgdGhpcy5pbnNlcnRDaGFyYWN0ZXIocmFuZ2UsIGVuZENoYXJhY3RlciwgZmFsc2UpO1xuICAgICAgdGhpcy5pbnNlcnRDaGFyYWN0ZXIocmFuZ2UsIHN0YXJ0Q2hhcmFjdGVyLCB0cnVlKTtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGNoYXJhY3RlciBmcm9tIHRoZSB0ZXh0IHdpdGhpbiBhIHJhbmdlLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBkZWxldGVDaGFyYWN0ZXJcbiAgICAgKi9cbiAgICBkZWxldGVDaGFyYWN0ZXI6IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCBjaGFyYWN0ZXIpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5zU3RyaW5nKHJhbmdlLCBjaGFyYWN0ZXIpKSB7XG4gICAgICAgIHJhbmdlLnNwbGl0Qm91bmRhcmllcygpO1xuICAgICAgICByYW5nZSA9IHJlc3RvcmVSYW5nZShob3N0LCByYW5nZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGNoYXJSZWdleHAgPSBzdHJpbmcucmVnZXhwKGNoYXJhY3Rlcik7XG5cbiAgICAgICAgICB2YXIgdGV4dE5vZGVzID0gcmFuZ2UuZ2V0Tm9kZXMoW25vZGVUeXBlLnRleHROb2RlXSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZVZhbHVlLnNlYXJjaChjaGFyUmVnZXhwKSA+PSAwO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGV4dE5vZGVzW2ldO1xuICAgICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSBub2RlLm5vZGVWYWx1ZS5yZXBsYWNlKGNoYXJSZWdleHAsICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByYW5nZS5ub3JtYWxpemVCb3VuZGFyaWVzKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgY29udGFpbnNTdHJpbmc6IGZ1bmN0aW9uKHJhbmdlLCBzdHIpIHtcbiAgICAgIHZhciB0ZXh0ID0gcmFuZ2UudG9TdHJpbmcoKTtcbiAgICAgIHJldHVybiB0ZXh0LmluZGV4T2Yoc3RyKSA+PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbndyYXAgYWxsIHRhZ3MgdGhpcyByYW5nZSBpcyBhZmZlY3RlZCBieS5cbiAgICAgKiBDYW4gYWxzbyBhZmZlY3QgY29udGVudCBvdXRzaWRlIG9mIHRoZSByYW5nZS5cbiAgICAgKi9cbiAgICBudWtlVGFnOiBmdW5jdGlvbihob3N0LCByYW5nZSwgdGFnTmFtZSkge1xuICAgICAgdmFyIHRhZ3MgPSB0aGlzLmdldFRhZ3MoaG9zdCwgcmFuZ2UpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtID0gdGFnc1tpXTtcbiAgICAgICAgaWYgKGVsZW0ubm9kZU5hbWUgPT09IHRhZ05hbWUpXG4gICAgICAgICAgdGhpcy51bndyYXAoZWxlbSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSkoKTtcbiIsInZhciByYW5neSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydyYW5neSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsncmFuZ3knXSA6IG51bGwpO1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgZXJyb3IgPSByZXF1aXJlKCcuL3V0aWwvZXJyb3InKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcicpO1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBjbGlwYm9hcmQgPSByZXF1aXJlKCcuL2NsaXBib2FyZCcpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2Rpc3BhdGNoZXInKTtcbnZhciBDdXJzb3IgPSByZXF1aXJlKCcuL2N1cnNvcicpO1xudmFyIFNwZWxsY2hlY2sgPSByZXF1aXJlKCcuL3NwZWxsY2hlY2snKTtcbnZhciBjcmVhdGVEZWZhdWx0RXZlbnRzID0gcmVxdWlyZSgnLi9jcmVhdGUtZGVmYXVsdC1ldmVudHMnKTtcbnZhciBicm93c2VyID0gcmVxdWlyZSgnYm93c2VyJykuYnJvd3NlcjtcblxuLyoqXG4gKiBUaGUgQ29yZSBtb2R1bGUgcHJvdmlkZXMgdGhlIEVkaXRhYmxlIGNsYXNzIHRoYXQgZGVmaW5lcyB0aGUgRWRpdGFibGUuSlNcbiAqIEFQSSBhbmQgaXMgdGhlIG1haW4gZW50cnkgcG9pbnQgZm9yIEVkaXRhYmxlLkpTLlxuICogSXQgYWxzbyBwcm92aWRlcyB0aGUgY3Vyc29yIG1vZHVsZSBmb3IgY3Jvc3MtYnJvd3NlciBjdXJzb3JzLCBhbmQgdGhlIGRvbVxuICogc3VibW9kdWxlLlxuICpcbiAqIEBtb2R1bGUgY29yZVxuICovXG5cbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIHRoZSBFZGl0YWJsZS5KUyBBUEkgdGhhdCBpcyBleHRlcm5hbGx5IHZpc2libGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZ3VyYXRpb24gZm9yIHRoaXMgZWRpdGFibGUgaW5zdGFuY2UuXG4gKiAgIHdpbmRvdzogVGhlIHdpbmRvdyB3aGVyZSB0byBhdHRhY2ggdGhlIGVkaXRhYmxlIGV2ZW50cy5cbiAqICAgZGVmYXVsdEJlaGF2aW9yOiB7Qm9vbGVhbn0gTG9hZCBkZWZhdWx0LWJlaGF2aW9yLmpzLlxuICogICBtb3VzZU1vdmVTZWxlY3Rpb25DaGFuZ2VzOiB7Qm9vbGVhbn0gV2hldGhlciB0byBnZXQgY3Vyc29yIGFuZCBzZWxlY3Rpb24gZXZlbnRzIG9uIG1vdXNlbW92ZS5cbiAqICAgYnJvd3NlclNwZWxsY2hlY2s6IHtCb29sZWFufSBTZXQgdGhlIHNwZWxsY2hlY2sgYXR0cmlidXRlIG9uIGVkaXRhYmxlIGVsZW1lbnRzXG4gKlxuICogQGNsYXNzIEVkaXRhYmxlXG4gKi9cbnZhciBFZGl0YWJsZSA9IGZ1bmN0aW9uKGluc3RhbmNlQ29uZmlnKSB7XG4gIHZhciBkZWZhdWx0SW5zdGFuY2VDb25maWcgPSB7XG4gICAgd2luZG93OiB3aW5kb3csXG4gICAgZGVmYXVsdEJlaGF2aW9yOiB0cnVlLFxuICAgIG1vdXNlTW92ZVNlbGVjdGlvbkNoYW5nZXM6IGZhbHNlLFxuICAgIGJyb3dzZXJTcGVsbGNoZWNrOiB0cnVlXG4gIH07XG5cbiAgdGhpcy5jb25maWcgPSAkLmV4dGVuZChkZWZhdWx0SW5zdGFuY2VDb25maWcsIGluc3RhbmNlQ29uZmlnKTtcbiAgdGhpcy53aW4gPSB0aGlzLmNvbmZpZy53aW5kb3c7XG4gIHRoaXMuZWRpdGFibGVTZWxlY3RvciA9ICcuJyArIGNvbmZpZy5lZGl0YWJsZUNsYXNzO1xuXG4gIGlmICghcmFuZ3kuaW5pdGlhbGl6ZWQpIHtcbiAgICByYW5neS5pbml0KCk7XG4gIH1cblxuICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcih0aGlzKTtcbiAgaWYgKHRoaXMuY29uZmlnLmRlZmF1bHRCZWhhdmlvciA9PT0gdHJ1ZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbihjcmVhdGVEZWZhdWx0RXZlbnRzKHRoaXMpKTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIG1vZHVsZXMgYW5kIGVkaXRhYmxlXG5FZGl0YWJsZS5wYXJzZXIgPSBwYXJzZXI7XG5FZGl0YWJsZS5jb250ZW50ID0gY29udGVudDtcbkVkaXRhYmxlLmJyb3dzZXIgPSBicm93c2VyO1xud2luZG93LkVkaXRhYmxlID0gRWRpdGFibGU7XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdGFibGU7XG5cbi8qKlxuICogU2V0IGNvbmZpZ3VyYXRpb24gb3B0aW9ucyB0aGF0IGFmZmVjdCBhbGwgZWRpdGFibGVcbiAqIGluc3RhbmNlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZ2xvYmFsIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyAoZGVmYXVsdHMgYXJlIGRlZmluZWQgaW4gY29uZmlnLmpzKVxuICogICBsb2c6IHtCb29sZWFufVxuICogICBsb2dFcnJvcnM6IHtCb29sZWFufVxuICogICBlZGl0YWJsZUNsYXNzOiB7U3RyaW5nfSBlLmcuICdqcy1lZGl0YWJsZSdcbiAqICAgZWRpdGFibGVEaXNhYmxlZENsYXNzOiB7U3RyaW5nfSBlLmcuICdqcy1lZGl0YWJsZS1kaXNhYmxlZCdcbiAqICAgcGFzdGluZ0F0dHJpYnV0ZToge1N0cmluZ30gZGVmYXVsdDogZS5nLiAnZGF0YS1lZGl0YWJsZS1pcy1wYXN0aW5nJ1xuICogICBib2xkVGFnOiBlLmcuICc8c3Ryb25nPidcbiAqICAgaXRhbGljVGFnOiBlLmcuICc8ZW0+J1xuICovXG5FZGl0YWJsZS5nbG9iYWxDb25maWcgPSBmdW5jdGlvbihnbG9iYWxDb25maWcpIHtcbiAgJC5leHRlbmQoY29uZmlnLCBnbG9iYWxDb25maWcpO1xuICBjbGlwYm9hcmQudXBkYXRlQ29uZmlnKGNvbmZpZyk7XG59O1xuXG5cbi8qKlxuICogQWRkcyB0aGUgRWRpdGFibGUuSlMgQVBJIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudHMuXG4gKiBPcHBvc2l0ZSBvZiB7eyNjcm9zc0xpbmsgXCJFZGl0YWJsZS9yZW1vdmVcIn19e3svY3Jvc3NMaW5rfX0uXG4gKiBDYWxscyBkaXNwYXRjaGVyLnNldHVwIHRvIHNldHVwIGFsbCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQG1ldGhvZCBhZGRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8QXJyYXkoSFRNTEVsZW1lbnQpfFN0cmluZ30gdGFyZ2V0IEEgSFRNTEVsZW1lbnQsIGFuXG4gKiAgICBhcnJheSBvZiBIVE1MRWxlbWVudCBvciBhIHF1ZXJ5IHNlbGVjdG9yIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHdoZXJlXG4gKiAgICB0aGUgQVBJIHNob3VsZCBiZSBhZGRlZCBvbi5cbiAqIEBjaGFpbmFibGVcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICB0aGlzLmVuYWJsZSgkKHRhcmdldCkpO1xuICAvLyB0b2RvOiBjaGVjayBjc3Mgd2hpdGVzcGFjZSBzZXR0aW5nc1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBFZGl0YWJsZS5KUyBBUEkgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnRzLlxuICogT3Bwb3NpdGUgb2Yge3sjY3Jvc3NMaW5rIFwiRWRpdGFibGUvYWRkXCJ9fXt7L2Nyb3NzTGlua319LlxuICpcbiAqIEBtZXRob2QgcmVtb3ZlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fEFycmF5KEhUTUxFbGVtZW50KXxTdHJpbmd9IHRhcmdldCBBIEhUTUxFbGVtZW50LCBhblxuICogICAgYXJyYXkgb2YgSFRNTEVsZW1lbnQgb3IgYSBxdWVyeSBzZWxlY3RvciByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB3aGVyZVxuICogICAgdGhlIEFQSSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tLlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHZhciAkdGFyZ2V0ID0gJCh0YXJnZXQpO1xuICB0aGlzLmRpc2FibGUoJHRhcmdldCk7XG4gICR0YXJnZXQucmVtb3ZlQ2xhc3MoY29uZmlnLmVkaXRhYmxlRGlzYWJsZWRDbGFzcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIEVkaXRhYmxlLkpTIEFQSSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudHMuXG4gKiBUaGUgdGFyZ2V0IGVsZW1lbnRzIGFyZSBtYXJrZWQgYXMgZGlzYWJsZWQuXG4gKlxuICogQG1ldGhvZCBkaXNhYmxlXG4gKiBAcGFyYW0geyBqUXVlcnkgZWxlbWVudCB8IHVuZGVmaW5lZCAgfSB0YXJnZXQgZWRpdGFibGUgcm9vdCBlbGVtZW50KHMpXG4gKiAgICBJZiBubyBwYXJhbSBpcyBzcGVjaWZpZWQgYWxsIGVkaXRhYmxlcyBhcmUgZGlzYWJsZWQuXG4gKiBAY2hhaW5hYmxlXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oJGVsZW0pIHtcbiAgdmFyIGJvZHkgPSB0aGlzLndpbi5kb2N1bWVudC5ib2R5O1xuICAkZWxlbSA9ICRlbGVtIHx8ICQoJy4nICsgY29uZmlnLmVkaXRhYmxlQ2xhc3MsIGJvZHkpO1xuICAkZWxlbVxuICAgIC5yZW1vdmVBdHRyKCdjb250ZW50ZWRpdGFibGUnKVxuICAgIC5yZW1vdmVBdHRyKCdzcGVsbGNoZWNrJylcbiAgICAucmVtb3ZlQ2xhc3MoY29uZmlnLmVkaXRhYmxlQ2xhc3MpXG4gICAgLmFkZENsYXNzKGNvbmZpZy5lZGl0YWJsZURpc2FibGVkQ2xhc3MpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuXG5cbi8qKlxuICogQWRkcyB0aGUgRWRpdGFibGUuSlMgQVBJIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudHMuXG4gKlxuICogQG1ldGhvZCBlbmFibGVcbiAqIEBwYXJhbSB7IGpRdWVyeSBlbGVtZW50IHwgdW5kZWZpbmVkIH0gdGFyZ2V0IGVkaXRhYmxlIHJvb3QgZWxlbWVudChzKVxuICogICAgSWYgbm8gcGFyYW0gaXMgc3BlY2lmaWVkIGFsbCBlZGl0YWJsZXMgbWFya2VkIGFzIGRpc2FibGVkIGFyZSBlbmFibGVkLlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oJGVsZW0sIG5vcm1hbGl6ZSkge1xuICB2YXIgYm9keSA9IHRoaXMud2luLmRvY3VtZW50LmJvZHk7XG4gICRlbGVtID0gJGVsZW0gfHwgJCgnLicgKyBjb25maWcuZWRpdGFibGVEaXNhYmxlZENsYXNzLCBib2R5KTtcbiAgJGVsZW1cbiAgICAuYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSlcbiAgICAuYXR0cignc3BlbGxjaGVjaycsIHRoaXMuY29uZmlnLmJyb3dzZXJTcGVsbGNoZWNrKVxuICAgIC5yZW1vdmVDbGFzcyhjb25maWcuZWRpdGFibGVEaXNhYmxlZENsYXNzKVxuICAgIC5hZGRDbGFzcyhjb25maWcuZWRpdGFibGVDbGFzcyk7XG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICRlbGVtLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICBjb250ZW50LnRpZHlIdG1sKGVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUZW1wb3JhcmlseSBkaXNhYmxlIGFuIGVkaXRhYmxlLlxuICogQ2FuIGJlIHVzZWQgdG8gcHJldmVudCB0ZXh0IHNlbGN0aW9uIHdoaWxlIGRyYWdnaW5nIGFuIGVsZW1lbnRcbiAqIGZvciBleGFtcGxlLlxuICpcbiAqIEBtZXRob2Qgc3VzcGVuZFxuICogQHBhcmFtIGpRdWVyeSBvYmplY3RcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLnN1c3BlbmQgPSBmdW5jdGlvbigkZWxlbSkge1xuICB2YXIgYm9keSA9IHRoaXMud2luLmRvY3VtZW50LmJvZHk7XG4gICRlbGVtID0gJGVsZW0gfHwgJCgnLicgKyBjb25maWcuZWRpdGFibGVDbGFzcywgYm9keSk7XG4gICRlbGVtLnJlbW92ZUF0dHIoJ2NvbnRlbnRlZGl0YWJsZScpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV2ZXJzZSB0aGUgZWZmZWN0cyBvZiBzdXNwZW5kKClcbiAqXG4gKiBAbWV0aG9kIGNvbnRpbnVlXG4gKiBAcGFyYW0galF1ZXJ5IG9iamVjdFxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuY29udGludWUgPSBmdW5jdGlvbigkZWxlbSkge1xuICB2YXIgYm9keSA9IHRoaXMud2luLmRvY3VtZW50LmJvZHk7XG4gICRlbGVtID0gJGVsZW0gfHwgJCgnLicgKyBjb25maWcuZWRpdGFibGVDbGFzcywgYm9keSk7XG4gICRlbGVtLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjdXJzb3IgaW5zaWRlIG9mIGFuIGVkaXRhYmxlIGJsb2NrLlxuICpcbiAqIEBtZXRob2QgY3JlYXRlQ3Vyc29yXG4gKiBAcGFyYW0gcG9zaXRpb24gJ2JlZ2lubmluZycsICdlbmQnLCAnYmVmb3JlJywgJ2FmdGVyJ1xuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuY3JlYXRlQ3Vyc29yID0gZnVuY3Rpb24oZWxlbWVudCwgcG9zaXRpb24pIHtcbiAgdmFyIGN1cnNvcjtcbiAgdmFyICRob3N0ID0gJChlbGVtZW50KS5jbG9zZXN0KHRoaXMuZWRpdGFibGVTZWxlY3Rvcik7XG4gIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgJ2JlZ2lubmluZyc7XG5cbiAgaWYgKCRob3N0Lmxlbmd0aCkge1xuICAgIHZhciByYW5nZSA9IHJhbmd5LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdiZWdpbm5pbmcnIHx8IHBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgcmFuZ2UuY29sbGFwc2UocG9zaXRpb24gPT09ICdiZWdpbm5pbmcnID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQgIT09ICRob3N0WzBdKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09ICdiZWZvcmUnKSB7XG4gICAgICAgIHJhbmdlLnNldFN0YXJ0QmVmb3JlKGVsZW1lbnQpO1xuICAgICAgICByYW5nZS5zZXRFbmRCZWZvcmUoZWxlbWVudCk7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnYWZ0ZXInKSB7XG4gICAgICAgIHJhbmdlLnNldFN0YXJ0QWZ0ZXIoZWxlbWVudCk7XG4gICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcignRWRpdGFibGVKUzogY2Fubm90IGNyZWF0ZSBjdXJzb3Igb3V0c2lkZSBvZiBhbiBlZGl0YWJsZSBibG9jay4nKTtcbiAgICB9XG5cbiAgICBjdXJzb3IgPSBuZXcgQ3Vyc29yKCRob3N0WzBdLCByYW5nZSk7XG4gIH1cblxuICByZXR1cm4gY3Vyc29yO1xufTtcblxuRWRpdGFibGUucHJvdG90eXBlLmNyZWF0ZUN1cnNvckF0QmVnaW5uaW5nID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2JlZ2lubmluZycpO1xufTtcblxuRWRpdGFibGUucHJvdG90eXBlLmNyZWF0ZUN1cnNvckF0RW5kID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2VuZCcpO1xufTtcblxuRWRpdGFibGUucHJvdG90eXBlLmNyZWF0ZUN1cnNvckJlZm9yZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHRoaXMuY3JlYXRlQ3Vyc29yKGVsZW1lbnQsICdiZWZvcmUnKTtcbn07XG5cbkVkaXRhYmxlLnByb3RvdHlwZS5jcmVhdGVDdXJzb3JBZnRlciA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHRoaXMuY3JlYXRlQ3Vyc29yKGVsZW1lbnQsICdhZnRlcicpO1xufTtcblxuLyoqXG4gKiBFeHRyYWN0IHRoZSBjb250ZW50IGZyb20gYW4gZWRpdGFibGUgaG9zdCBvciBkb2N1bWVudCBmcmFnbWVudC5cbiAqIFRoaXMgbWV0aG9kIHdpbGwgcmVtb3ZlIGFsbCBpbnRlcm5hbCBlbGVtZW50cyBhbmQgdWktZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtET00gbm9kZSBvciBEb2N1bWVudCBGcmFnbWVudH0gVGhlIGlubmVySFRNTCBvZiB0aGlzIGVsZW1lbnQgb3IgZnJhZ21lbnQgd2lsbCBiZSBleHRyYWN0ZWQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgY2xlYW5lZCBpbm5lckhUTUwuXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gY29udGVudC5leHRyYWN0Q29udGVudChlbGVtZW50KTtcbn07XG5cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZyB8IERvY3VtZW50RnJhZ21lbnR9IGNvbnRlbnQgdG8gYXBwZW5kLlxuICogQHJldHVybnMge0N1cnNvcn0gQSBuZXcgQ3Vyc29yIG9iamVjdCBqdXN0IGJlZm9yZSB0aGUgaW5zZXJ0ZWQgY29udGVudC5cbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24oZWxlbWVudCwgY29udGVudFRvQXBwZW5kKSB7XG4gIGVsZW1lbnQgPSBjb250ZW50LmFkb3B0RWxlbWVudChlbGVtZW50LCB0aGlzLndpbi5kb2N1bWVudCk7XG5cbiAgaWYgKHR5cGVvZiBjb250ZW50VG9BcHBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gdG9kbzogY3JlYXRlIGNvbnRlbnQgaW4gdGhlIHJpZ2h0IHdpbmRvd1xuICAgIGNvbnRlbnRUb0FwcGVuZCA9IGNvbnRlbnQuY3JlYXRlRnJhZ21lbnRGcm9tU3RyaW5nKGNvbnRlbnRUb0FwcGVuZCk7XG4gIH1cblxuICB2YXIgY3Vyc29yID0gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2VuZCcpO1xuICBjdXJzb3IuaW5zZXJ0QWZ0ZXIoY29udGVudFRvQXBwZW5kKTtcbiAgcmV0dXJuIGN1cnNvcjtcbn07XG5cblxuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nIHwgRG9jdW1lbnRGcmFnbWVudH0gY29udGVudCB0byBwcmVwZW5kXG4gKiBAcmV0dXJucyB7Q3Vyc29yfSBBIG5ldyBDdXJzb3Igb2JqZWN0IGp1c3QgYWZ0ZXIgdGhlIGluc2VydGVkIGNvbnRlbnQuXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5wcmVwZW5kVG8gPSBmdW5jdGlvbihlbGVtZW50LCBjb250ZW50VG9QcmVwZW5kKSB7XG4gIGVsZW1lbnQgPSBjb250ZW50LmFkb3B0RWxlbWVudChlbGVtZW50LCB0aGlzLndpbi5kb2N1bWVudCk7XG5cbiAgaWYgKHR5cGVvZiBjb250ZW50VG9QcmVwZW5kID09PSAnc3RyaW5nJykge1xuICAgIC8vIHRvZG86IGNyZWF0ZSBjb250ZW50IGluIHRoZSByaWdodCB3aW5kb3dcbiAgICBjb250ZW50VG9QcmVwZW5kID0gY29udGVudC5jcmVhdGVGcmFnbWVudEZyb21TdHJpbmcoY29udGVudFRvUHJlcGVuZCk7XG4gIH1cblxuICB2YXIgY3Vyc29yID0gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2JlZ2lubmluZycpO1xuICBjdXJzb3IuaW5zZXJ0QmVmb3JlKGNvbnRlbnRUb1ByZXBlbmQpO1xuICByZXR1cm4gY3Vyc29yO1xufTtcblxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gKiBPbmx5IHJldHVybnMgc29tZXRoaW5nIGlmIHRoZSBzZWxlY3Rpb24gaXMgd2l0aGluIGFuIGVkaXRhYmxlIGVsZW1lbnQuXG4gKiBJZiB5b3UgcGFzcyBhbiBlZGl0YWJsZSBob3N0IGFzIHBhcmFtIGl0IG9ubHkgcmV0dXJucyBzb21ldGhpbmcgaWYgdGhlIHNlbGVjdGlvbiBpcyBpbnNpZGUgdGhpc1xuICogdmVyeSBlZGl0YWJsZSBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7RE9NTm9kZX0gT3B0aW9uYWwuIEFuIGVkaXRhYmxlIGhvc3Qgd2hlcmUgdGhlIHNlbGVjdGlvbiBuZWVkcyB0byBiZSBjb250YWluZWQuXG4gKiBAcmV0dXJucyBBIEN1cnNvciBvciBTZWxlY3Rpb24gb2JqZWN0IG9yIHVuZGVmaW5lZC5cbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICB2YXIgc2VsZWN0aW9uID0gdGhpcy5kaXNwYXRjaGVyLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hTZWxlY3Rpb24oKTtcbiAgaWYgKGVkaXRhYmxlSG9zdCAmJiBzZWxlY3Rpb24pIHtcbiAgICB2YXIgcmFuZ2UgPSBzZWxlY3Rpb24ucmFuZ2U7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNlbGVjdGlvbiBpcyBpbnNpZGUgdGhlIGVkaXRhYmxlSG9zdFxuICAgIC8vIFRoZSB0cnkuLi5jYXRjaCBpcyByZXF1aXJlZCBpZiB0aGUgZWRpdGFibGVIb3N0IHdhcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICB0cnkge1xuICAgICAgaWYgKHJhbmdlLmNvbXBhcmVOb2RlKGVkaXRhYmxlSG9zdCkgIT09IHJhbmdlLk5PREVfQkVGT1JFX0FORF9BRlRFUikge1xuICAgICAgICBzZWxlY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2VsZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZWN0aW9uO1xufTtcblxuXG4vKipcbiAqIEVuYWJsZSBzcGVsbGNoZWNraW5nXG4gKlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuc2V0dXBTcGVsbGNoZWNrID0gZnVuY3Rpb24oc3BlbGxjaGVja0NvbmZpZykge1xuICB0aGlzLnNwZWxsY2hlY2sgPSBuZXcgU3BlbGxjaGVjayh0aGlzLCBzcGVsbGNoZWNrQ29uZmlnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBTdWJzY3JpYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBhIGN1c3RvbSBldmVudCBmaXJlZCBieSB0aGUgQVBJLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBjYWxsYmFjayB0byBleGVjdXRlIGluIHJlc3BvbnNlIHRvIHRoZVxuICogICAgIGV2ZW50LlxuICpcbiAqIEBjaGFpbmFibGVcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgLy8gVE9ETyB0aHJvdyBlcnJvciBpZiBldmVudCBpcyBub3Qgb25lIG9mIEVWRU5UU1xuICAvLyBUT0RPIHRocm93IGVycm9yIGlmIGhhbmRsZXIgaXMgbm90IGEgZnVuY3Rpb25cbiAgdGhpcy5kaXNwYXRjaGVyLm9uKGV2ZW50LCBoYW5kbGVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGEgY2FsbGJhY2sgZnVuY3Rpb24gZnJvbSBhIGN1c3RvbSBldmVudCBmaXJlZCBieSB0aGUgQVBJLlxuICogT3Bwb3NpdGUgb2Yge3sjY3Jvc3NMaW5rIFwiRWRpdGFibGUvb25cIn19e3svY3Jvc3NMaW5rfX0uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIGNhbGxiYWNrIHRvIHJlbW92ZSBmcm9tIHRoZVxuICogICAgIGV2ZW50IG9yIHRoZSBzcGVjaWFsIHZhbHVlIGZhbHNlIHRvIHJlbW92ZSBhbGwgY2FsbGJhY2tzLlxuICpcbiAqIEBjaGFpbmFibGVcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdGhpcy5kaXNwYXRjaGVyLm9mZi5hcHBseSh0aGlzLmRpc3BhdGNoZXIsIGFyZ3MpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgYWxsIGNhbGxiYWNrcyBhbmQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBjaGFpbmFibGVcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRpc3BhdGNoZXIudW5sb2FkKCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHN1YnNjcmliZSB0byBhbiBldmVudC5cbiAqXG4gKiBAbWV0aG9kIGNyZWF0ZUV2ZW50U3Vic2NyaWJlclxuICogQHBhcmFtIHtTdHJpbmd9IEV2ZW50IG5hbWVcbiAqL1xudmFyIGNyZWF0ZUV2ZW50U3Vic2NyaWJlciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgRWRpdGFibGUucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGhhbmRsZXIpO1xuICB9O1xufTtcblxuLyoqXG4gKiBTZXQgdXAgY2FsbGJhY2sgZnVuY3Rpb25zIGZvciBzZXZlcmFsIGV2ZW50cy5cbiAqL1xudmFyIGV2ZW50cyA9IFsnZm9jdXMnLCAnYmx1cicsICdmbG93JywgJ3NlbGVjdGlvbicsICdjdXJzb3InLCAnbmV3bGluZScsXG4gICAgICAgICAgICAgICdpbnNlcnQnLCAnc3BsaXQnLCAnbWVyZ2UnLCAnZW1wdHknLCAnY2hhbmdlJywgJ3N3aXRjaCcsICdtb3ZlJyxcbiAgICAgICAgICAgICAgJ2NsaXBib2FyZCcsICdwYXN0ZSddO1xuXG5mb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICB2YXIgZXZlbnROYW1lID0gZXZlbnRzW2ldO1xuICBjcmVhdGVFdmVudFN1YnNjcmliZXIoZXZlbnROYW1lKTtcbn1cbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcicpO1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL3V0aWwvbG9nJyk7XG52YXIgYmxvY2sgPSByZXF1aXJlKCcuL2Jsb2NrJyk7XG5cbi8qKlxuICogVGhlIEJlaGF2aW9yIG1vZHVsZSBkZWZpbmVzIHRoZSBiZWhhdmlvciB0cmlnZ2VyZWQgaW4gcmVzcG9uc2UgdG8gdGhlIEVkaXRhYmxlLkpTXG4gKiBldmVudHMgKHNlZSB7eyNjcm9zc0xpbmsgXCJFZGl0YWJsZVwifX17ey9jcm9zc0xpbmt9fSkuXG4gKiBUaGUgYmVoYXZpb3IgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IGEgdXNlciB3aXRoIEVkaXRhYmxlLmluaXQoKSBvciBvblxuICogRWRpdGFibGUuYWRkKCkgcGVyIGVsZW1lbnQuXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKiBAc3VibW9kdWxlIGJlaGF2aW9yXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVkaXRhYmxlKSB7XG4gIHZhciBkb2N1bWVudCA9IGVkaXRhYmxlLndpbi5kb2N1bWVudDtcbiAgdmFyIHNlbGVjdGlvbldhdGNoZXIgPSBlZGl0YWJsZS5kaXNwYXRjaGVyLnNlbGVjdGlvbldhdGNoZXI7XG5cbiAgLyoqXG4gICAgKiBGYWN0b3J5IGZvciB0aGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgICAqIFByb3ZpZGVzIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhlIEVkaXRhYmxlLkpTIEFQSS5cbiAgICAqXG4gICAgKiBAc3RhdGljXG4gICAgKi9cbiAgcmV0dXJuIHtcbiAgICBmb2N1czogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgLy8gQWRkIGEgPGJyPiBlbGVtZW50IGlmIHRoZSBlZGl0YWJsZSBpcyBlbXB0eSB0byBmb3JjZSBpdCB0byBoYXZlIGhlaWdodFxuICAgICAgLy8gRS5nLiBGaXJlZm94IGRvZXMgbm90IHJlbmRlciBlbXB0eSBibG9jayBlbGVtZW50cyBhbmQgbW9zdCBicm93c2VycyBkb1xuICAgICAgLy8gbm90IHJlbmRlciAgZW1wdHkgaW5saW5lIGVsZW1lbnRzLlxuICAgICAgaWYgKHBhcnNlci5pc1ZvaWQoZWxlbWVudCkpIHtcbiAgICAgICAgdmFyIGJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKTtcbiAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdkYXRhLWVkaXRhYmxlJywgJ3JlbW92ZScpO1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGJyKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYmx1cjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgY29udGVudC5jbGVhbkludGVybmFscyhlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgc2VsZWN0aW9uOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgbG9nKCdEZWZhdWx0IHNlbGVjdGlvbiBiZWhhdmlvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdEZWZhdWx0IHNlbGVjdGlvbiBlbXB0eSBiZWhhdmlvcicpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjdXJzb3I6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgaWYgKGN1cnNvcikge1xuICAgICAgICBsb2coJ0RlZmF1bHQgY3Vyc29yIGJlaGF2aW9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2coJ0RlZmF1bHQgY3Vyc29yIGVtcHR5IGJlaGF2aW9yJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5ld2xpbmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgdmFyIGF0RW5kID0gY3Vyc29yLmlzQXRFbmQoKTtcbiAgICAgIHZhciBiciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG4gICAgICBjdXJzb3IuaW5zZXJ0QmVmb3JlKGJyKTtcblxuICAgICAgaWYgKGF0RW5kKSB7XG4gICAgICAgIGxvZygnYXQgdGhlIGVuZCcpO1xuXG4gICAgICAgIHZhciBub1dpZHRoU3BhY2UgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnXFx1MjAwQicpO1xuICAgICAgICBjdXJzb3IuaW5zZXJ0QWZ0ZXIobm9XaWR0aFNwYWNlKTtcblxuICAgICAgICAvLyB2YXIgdHJhaWxpbmdCciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG4gICAgICAgIC8vIHRyYWlsaW5nQnIuc2V0QXR0cmlidXRlKCd0eXBlJywgJy1lZGl0YWJsZWpzJyk7XG4gICAgICAgIC8vIGN1cnNvci5pbnNlcnRBZnRlcih0cmFpbGluZ0JyKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdub3QgYXQgdGhlIGVuZCcpO1xuICAgICAgfVxuXG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICBpbnNlcnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgdmFyIG5ld0VsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZShmYWxzZSk7XG4gICAgICBpZiAobmV3RWxlbWVudC5pZCkgbmV3RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2lkJyk7XG5cbiAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWZ0ZXInOlxuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIGVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICBuZXdFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzcGxpdDogZnVuY3Rpb24oZWxlbWVudCwgYmVmb3JlLCBhZnRlciwgY3Vyc29yKSB7XG4gICAgICB2YXIgbmV3Tm9kZSA9IGVsZW1lbnQuY2xvbmVOb2RlKCk7XG4gICAgICBuZXdOb2RlLmFwcGVuZENoaWxkKGJlZm9yZSk7XG5cbiAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIGVsZW1lbnQpO1xuXG4gICAgICB3aGlsZSAoZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoYWZ0ZXIpO1xuXG4gICAgICBjb250ZW50LnRpZHlIdG1sKG5ld05vZGUpO1xuICAgICAgY29udGVudC50aWR5SHRtbChlbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBtZXJnZXIsIGZyYWdtZW50LCBjaHVua3MsIGksIG5ld0NoaWxkLCByYW5nZTtcblxuICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2JlZm9yZSc6XG4gICAgICAgIGNvbnRhaW5lciA9IGJsb2NrLnByZXZpb3VzKGVsZW1lbnQpO1xuICAgICAgICBtZXJnZXIgPSBlbGVtZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FmdGVyJzpcbiAgICAgICAgY29udGFpbmVyID0gZWxlbWVudDtcbiAgICAgICAgbWVyZ2VyID0gYmxvY2submV4dChlbGVtZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghKGNvbnRhaW5lciAmJiBtZXJnZXIpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGlmIChjb250YWluZXIuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnNvciA9IGVkaXRhYmxlLmFwcGVuZFRvKGNvbnRhaW5lciwgbWVyZ2VyLmlubmVySFRNTCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJzb3IgPSBlZGl0YWJsZS5wcmVwZW5kVG8oY29udGFpbmVyLCBtZXJnZXIuaW5uZXJIVE1MKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIG1lcmdlZCBub2RlXG4gICAgICBtZXJnZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZXJnZXIpO1xuXG4gICAgICBjdXJzb3Iuc2F2ZSgpO1xuICAgICAgY29udGVudC50aWR5SHRtbChjb250YWluZXIpO1xuICAgICAgY3Vyc29yLnJlc3RvcmUoKTtcbiAgICAgIGN1cnNvci5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIGVtcHR5OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBsb2coJ0RlZmF1bHQgZW1wdHkgYmVoYXZpb3InKTtcbiAgICB9LFxuXG4gICAgJ3N3aXRjaCc6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgbmV4dCwgcHJldmlvdXM7XG5cbiAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgICBwcmV2aW91cyA9IGJsb2NrLnByZXZpb3VzKGVsZW1lbnQpO1xuICAgICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgICBjdXJzb3IubW92ZUF0VGV4dEVuZChwcmV2aW91cyk7XG4gICAgICAgICAgY3Vyc29yLnNldFZpc2libGVTZWxlY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FmdGVyJzpcbiAgICAgICAgbmV4dCA9IGJsb2NrLm5leHQoZWxlbWVudCk7XG4gICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgY3Vyc29yLm1vdmVBdEJlZ2lubmluZyhuZXh0KTtcbiAgICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbikge1xuICAgICAgbG9nKCdEZWZhdWx0IG1vdmUgYmVoYXZpb3InKTtcbiAgICB9LFxuXG4gICAgcGFzdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGJsb2NrcywgY3Vyc29yKSB7XG4gICAgICB2YXIgZnJhZ21lbnQ7XG5cbiAgICAgIHZhciBmaXJzdEJsb2NrID0gYmxvY2tzWzBdO1xuICAgICAgY3Vyc29yLmluc2VydEJlZm9yZShmaXJzdEJsb2NrKTtcblxuICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPD0gMSkge1xuICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUoZmFsc2UpO1xuICAgICAgICAgIGlmIChuZXdFbGVtZW50LmlkKSBuZXdFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgICBmcmFnbWVudCA9IGNvbnRlbnQuY3JlYXRlRnJhZ21lbnRGcm9tU3RyaW5nKGJsb2Nrc1tpXSk7XG4gICAgICAgICAgJChuZXdFbGVtZW50KS5hcHBlbmQoZnJhZ21lbnQpO1xuICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgY3VycmVudEVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvY3VzIGxhc3QgZWxlbWVudFxuICAgICAgICBjdXJzb3IgPSBlZGl0YWJsZS5jcmVhdGVDdXJzb3JBdEVuZChjdXJyZW50RWxlbWVudCk7XG4gICAgICAgIGN1cnNvci5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNsaXBib2FyZDogZnVuY3Rpb24oZWxlbWVudCwgYWN0aW9uLCBjdXJzb3IpIHtcbiAgICAgIGxvZygnRGVmYXVsdCBjbGlwYm9hcmQgYmVoYXZpb3InKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIGNyZWF0ZURlZmF1bHRCZWhhdmlvciA9IHJlcXVpcmUoJy4vY3JlYXRlLWRlZmF1bHQtYmVoYXZpb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWRpdGFibGUpIHtcbiAgdmFyIGJlaGF2aW9yID0gY3JlYXRlRGVmYXVsdEJlaGF2aW9yKGVkaXRhYmxlKTtcblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBmb2N1cyBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhbiBlbGVtZW50IGdhaW5zIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBmb2N1c1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGJlaGF2aW9yLmZvY3VzKGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmx1ciBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhbiBlbGVtZW50IGxvb3NlcyBmb2N1cy5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgYmx1clxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgYmx1cjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgYmVoYXZpb3IuYmx1cihlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIGZsb3cgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgc3RhcnRzIHR5cGluZyBvciBwYXVzZSB0eXBpbmcuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IGZsb3dcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gVGhlIGZsb3cgYWN0aW9uOiBcInN0YXJ0XCIgb3IgXCJwYXVzZVwiLlxuICAgICAqL1xuICAgIGZsb3c6IGZ1bmN0aW9uKGVsZW1lbnQsIGFjdGlvbikge1xuICAgICAgYmVoYXZpb3IuZmxvdyhlbGVtZW50LCBhY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0aW9uIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgc29tZVxuICAgICAqIGNvbnRlbnQuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IHNlbGVjdGlvblxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTZWxlY3Rpb259IHNlbGVjdGlvbiBUaGUgYWN0dWFsIFNlbGVjdGlvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2VsZWN0aW9uOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgIGJlaGF2aW9yLnNlbGVjdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3Vyc29yIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciBjdXJzb3IgcG9zaXRpb24gaGFzIGNoYW5nZWQuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IGN1cnNvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtDdXJzb3J9IGN1cnNvciBUaGUgYWN0dWFsIEN1cnNvciBvYmplY3QuXG4gICAgICovXG4gICAgY3Vyc29yOiBmdW5jdGlvbihlbGVtZW50LCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLmN1cnNvcihlbGVtZW50LCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmV3bGluZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhIG5ld2xpbmUgc2hvdWxkIGJlIGluc2VydGVkLiBUaGlzXG4gICAgICogaGFwcGVucyB3aGVuIFNISUZUK0VOVEVSIGtleSBpcyBwcmVzc2VkLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIGFkZCBhIDxiciAvPlxuICAgICAqXG4gICAgICogQGV2ZW50IG5ld2xpbmVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7Q3Vyc29yfSBjdXJzb3IgVGhlIGFjdHVhbCBjdXJzb3Igb2JqZWN0LlxuICAgICAqL1xuICAgIG5ld2xpbmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgYmVoYXZpb3IubmV3bGluZShlbGVtZW50LCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3BsaXQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gYSBibG9jayBzaG91bGQgYmUgc3BsaXR0ZWQgaW50byB0d29cbiAgICAgKiBibG9ja3MuIFRoaXMgaGFwcGVucyB3aGVuIEVOVEVSIGlzIHByZXNzZWQgd2l0aGluIGEgbm9uLWVtcHR5IGJsb2NrLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBzcGxpdFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJlZm9yZSBUaGUgSFRNTCBzdHJpbmcgYmVmb3JlIHRoZSBzcGxpdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWZ0ZXIgVGhlIEhUTUwgc3RyaW5nIGFmdGVyIHRoZSBzcGxpdC5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBzcGxpdDogZnVuY3Rpb24oZWxlbWVudCwgYmVmb3JlLCBhZnRlciwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5zcGxpdChlbGVtZW50LCBiZWZvcmUsIGFmdGVyLCBjdXJzb3IpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBpbnNlcnQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gYSBuZXcgYmxvY2sgc2hvdWxkIGJlIGluc2VydGVkLiBUaGlzXG4gICAgICogaGFwcGVucyB3aGVuIEVOVEVSIGtleSBpcyBwcmVzc2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBibG9jayAoc2hvdWxkXG4gICAgICogaW5zZXJ0IGJlZm9yZSkgb3IgYXQgdGhlIGVuZCBvZiBhIGJsb2NrIChzaG91bGQgaW5zZXJ0IGFmdGVyKS5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0cmlnZ2VyaW5nIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIFRoZSBpbnNlcnQgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBpbnNlcnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5pbnNlcnQoZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBtZXJnZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0d28gbmVlZHMgdG8gYmUgbWVyZ2VkLiBUaGlzIGhhcHBlbnNcbiAgICAgKiB3aGVuIEJBQ0tTUEFDRSBpcyBwcmVzc2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBibG9jayAoc2hvdWxkIG1lcmdlIHdpdGhcbiAgICAgKiB0aGUgcHJlY2VlZGluZyBibG9jaykgb3IgREVMIGlzIHByZXNzZWQgYXQgdGhlIGVuZCBvZiBhIGJsb2NrIChzaG91bGRcbiAgICAgKiBtZXJnZSB3aXRoIHRoZSBmb2xsb3dpbmcgYmxvY2spLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBtZXJnZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiBUaGUgbWVyZ2UgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBtZXJnZTogZnVuY3Rpb24oZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLm1lcmdlKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIGVtcHR5IGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIGEgYmxvY2sgaXMgZW1wdGllZC5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgZW1wdHlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIGVtcHR5OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBiZWhhdmlvci5lbXB0eShlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIHN3aXRjaCBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBzd2l0Y2hlcyB0byBhbm90aGVyIGJsb2NrLlxuICAgICAqIFRoaXMgaGFwcGVucyB3aGVuIGFuIEFSUk9XIGtleSBpcyBwcmVzc2VkIG5lYXIgdGhlIGJvdW5kYXJpZXMgb2YgYSBibG9jay5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgc3dpdGNoXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0cmlnZ2VyaW5nIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIFRoZSBzd2l0Y2ggZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC4qXG4gICAgICovXG4gICAgJ3N3aXRjaCc6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5zd2l0Y2goZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbW92ZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyBhIHNlbGVjdGlvbiBpbiBhIGJsb2NrLlxuICAgICAqIFRoaXMgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZSAob3IgYWxsKSBjb250ZW50IGluIGEgYmxvY2sgYW5kXG4gICAgICogYW4gQVJST1cga2V5IGlzIHByZXNzZWQgKHVwOiBkcmFnIGJlZm9yZSwgZG93bjogZHJhZyBhZnRlcikuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IG1vdmVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U2VsZWN0aW9ufSBzZWxlY3Rpb24gVGhlIGFjdHVhbCBTZWxlY3Rpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb24gVGhlIG1vdmUgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKi9cbiAgICBtb3ZlOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbikge1xuICAgICAgYmVoYXZpb3IubW92ZShlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjbGlwYm9hcmQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgY29waWVzIG9yIGN1dHNcbiAgICAgKiBhIHNlbGVjdGlvbiB3aXRoaW4gYSBibG9jay5cbiAgICAgKlxuICAgICAqIEBldmVudCBjbGlwYm9hcmRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gVGhlIGNsaXBib2FyZCBhY3Rpb246IFwiY29weVwiIG9yIFwiY3V0XCIuXG4gICAgICogQHBhcmFtIHtTZWxlY3Rpb259IHNlbGVjdGlvbiBBIHNlbGVjdGlvbiBvYmplY3QgYXJvdW5kIHRoZSBjb3BpZWQgY29udGVudC5cbiAgICAgKi9cbiAgICBjbGlwYm9hcmQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFjdGlvbiwgc2VsZWN0aW9uKSB7XG4gICAgICBiZWhhdmlvci5jbGlwYm9hcmQoZWxlbWVudCwgYWN0aW9uLCBzZWxlY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgcGFzdGUgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgcGFzdGVzIHRleHRcbiAgICAgKlxuICAgICAqIEBldmVudCBwYXN0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7QXJyYXkgb2YgU3RyaW5nfSBUaGUgcGFzdGVkIGJsb2Nrc1xuICAgICAqIEBwYXJhbSB7Q3Vyc29yfSBUaGUgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBwYXN0ZTogZnVuY3Rpb24oZWxlbWVudCwgYmxvY2tzLCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLnBhc3RlKGVsZW1lbnQsIGJsb2NrcywgY3Vyc29yKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIHJhbmd5ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3Jhbmd5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydyYW5neSddIDogbnVsbCk7XG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgY29udGVudCA9IHJlcXVpcmUoJy4vY29udGVudCcpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi91dGlsL3N0cmluZycpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcbnZhciBlcnJvciA9IHJlcXVpcmUoJy4vdXRpbC9lcnJvcicpO1xudmFyIHJhbmdlU2F2ZVJlc3RvcmUgPSByZXF1aXJlKCcuL3JhbmdlLXNhdmUtcmVzdG9yZScpO1xuXG4vKipcbiAqIFRoZSBDdXJzb3IgbW9kdWxlIHByb3ZpZGVzIGEgY3Jvc3MtYnJvd3NlciBhYnN0cmFjdGlvbiBsYXllciBmb3IgY3Vyc29yLlxuICpcbiAqIEBtb2R1bGUgY29yZVxuICogQHN1Ym1vZHVsZSBjdXJzb3JcbiAqL1xuXG52YXIgQ3Vyc29yO1xubW9kdWxlLmV4cG9ydHMgPSBDdXJzb3IgPSAoZnVuY3Rpb24oKSB7XG5cbiAgLyoqXG4gICAqIENsYXNzIGZvciB0aGUgQ3Vyc29yIG1vZHVsZS5cbiAgICpcbiAgICogQGNsYXNzIEN1cnNvclxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIHZhciBDdXJzb3IgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QsIHJhbmd5UmFuZ2UpIHtcbiAgICB0aGlzLnNldEhvc3QoZWRpdGFibGVIb3N0KTtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ3lSYW5nZTtcbiAgICB0aGlzLmlzQ3Vyc29yID0gdHJ1ZTtcbiAgfTtcblxuICBDdXJzb3IucHJvdG90eXBlID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0F0RW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5pc0VuZE9mSG9zdChcbiAgICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRPZmZzZXQpO1xuICAgICAgfSxcblxuICAgICAgaXNBdFRleHRFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmlzVGV4dEVuZE9mSG9zdChcbiAgICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRPZmZzZXQpO1xuICAgICAgfSxcblxuICAgICAgaXNBdEJlZ2lubmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIuaXNCZWdpbm5pbmdPZkhvc3QoXG4gICAgICAgICAgdGhpcy5ob3N0LFxuICAgICAgICAgIHRoaXMucmFuZ2Uuc3RhcnRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5zdGFydE9mZnNldCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEluc2VydCBjb250ZW50IGJlZm9yZSB0aGUgY3Vyc29yXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmcsIERPTSBub2RlIG9yIGRvY3VtZW50IGZyYWdtZW50fVxuICAgICAgICovXG4gICAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCBzdHJpbmcuaXNTdHJpbmcoZWxlbWVudCkgKSB7XG4gICAgICAgICAgZWxlbWVudCA9IGNvbnRlbnQuY3JlYXRlRnJhZ21lbnRGcm9tU3RyaW5nKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZXIuaXNEb2N1bWVudEZyYWdtZW50V2l0aG91dENoaWxkcmVuKGVsZW1lbnQpKSByZXR1cm47XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLmFkb3B0RWxlbWVudChlbGVtZW50KTtcblxuICAgICAgICB2YXIgcHJlY2VlZGluZ0VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZG9jdW1lbnRGcmFnbWVudE5vZGUpIHtcbiAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgcHJlY2VlZGluZ0VsZW1lbnQgPSBlbGVtZW50LmNoaWxkTm9kZXNbbGFzdEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmFuZ2UuaW5zZXJ0Tm9kZShlbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5zZXRTdGFydEFmdGVyKHByZWNlZWRpbmdFbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5zZXRFbmRBZnRlcihwcmVjZWVkaW5nRWxlbWVudCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEluc2VydCBjb250ZW50IGFmdGVyIHRoZSBjdXJzb3JcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZywgRE9NIG5vZGUgb3IgZG9jdW1lbnQgZnJhZ21lbnR9XG4gICAgICAgKi9cbiAgICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICggc3RyaW5nLmlzU3RyaW5nKGVsZW1lbnQpICkge1xuICAgICAgICAgIGVsZW1lbnQgPSBjb250ZW50LmNyZWF0ZUZyYWdtZW50RnJvbVN0cmluZyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VyLmlzRG9jdW1lbnRGcmFnbWVudFdpdGhvdXRDaGlsZHJlbihlbGVtZW50KSkgcmV0dXJuO1xuICAgICAgICBlbGVtZW50ID0gdGhpcy5hZG9wdEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2UuaW5zZXJ0Tm9kZShlbGVtZW50KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQWxpYXMgZm9yICNzZXRWaXNpYmxlU2VsZWN0aW9uKClcbiAgICAgICAqL1xuICAgICAgc2V0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgICB9LFxuXG4gICAgICBzZXRWaXNpYmxlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gV2l0aG91dCBzZXR0aW5nIGZvY3VzKCkgRmlyZWZveCBpcyBub3QgaGFwcHkgKHNlZW1zIHNldHRpbmcgYSBzZWxlY3Rpb24gaXMgbm90IGVub3VnaC5cbiAgICAgICAgLy8gUHJvYmFibHkgYmVjYXVzZSBGaXJlZm94IGNhbiBoYW5kbGUgbXVsdGlwbGUgc2VsZWN0aW9ucykuXG4gICAgICAgIGlmICh0aGlzLndpbi5kb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLmhvc3QpIHtcbiAgICAgICAgICAkKHRoaXMuaG9zdCkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICByYW5neS5nZXRTZWxlY3Rpb24odGhpcy53aW4pLnNldFNpbmdsZVJhbmdlKHRoaXMucmFuZ2UpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUYWtlIHRoZSBmb2xsb3dpbmcgZXhhbXBsZTpcbiAgICAgICAqIChUaGUgY2hhcmFjdGVyICd8JyByZXByZXNlbnRzIHRoZSBjdXJzb3IgcG9zaXRpb24pXG4gICAgICAgKlxuICAgICAgICogPGRpdiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+Zm98bzwvZGl2PlxuICAgICAgICogYmVmb3JlKCkgd2lsbCByZXR1cm4gYSBkb2N1bWVudCBmcmFtZW50IGNvbnRhaW5pbmcgYSB0ZXh0IG5vZGUgJ2ZvJy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnQgRnJhZ21lbnR9IGNvbnRlbnQgYmVmb3JlIHRoZSBjdXJzb3Igb3Igc2VsZWN0aW9uLlxuICAgICAgICovXG4gICAgICBiZWZvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZnJhZ21lbnQgPSBudWxsO1xuICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRCZWZvcmUodGhpcy5ob3N0KTtcbiAgICAgICAgZnJhZ21lbnQgPSBjb250ZW50LmNsb25lUmFuZ2VDb250ZW50cyhyYW5nZSk7XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU2FtZSBhcyBiZWZvcmUoKSBidXQgcmV0dXJucyBhIHN0cmluZy5cbiAgICAgICAqL1xuICAgICAgYmVmb3JlSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50LmdldElubmVySHRtbE9mRnJhZ21lbnQodGhpcy5iZWZvcmUoKSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFRha2UgdGhlIGZvbGxvd2luZyBleGFtcGxlOlxuICAgICAgICogKFRoZSBjaGFyYWN0ZXIgJ3wnIHJlcHJlc2VudHMgdGhlIGN1cnNvciBwb3NpdGlvbilcbiAgICAgICAqXG4gICAgICAgKiA8ZGl2IGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj5mb3xvPC9kaXY+XG4gICAgICAgKiBhZnRlcigpIHdpbGwgcmV0dXJuIGEgZG9jdW1lbnQgZnJhbWVudCBjb250YWluaW5nIGEgdGV4dCBub2RlICdvJy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnQgRnJhZ21lbnR9IGNvbnRlbnQgYWZ0ZXIgdGhlIGN1cnNvciBvciBzZWxlY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIGFmdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgdmFyIHJhbmdlID0gdGhpcy5yYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKHRoaXMuaG9zdCk7XG4gICAgICAgIGZyYWdtZW50ID0gY29udGVudC5jbG9uZVJhbmdlQ29udGVudHMocmFuZ2UpO1xuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFNhbWUgYXMgYWZ0ZXIoKSBidXQgcmV0dXJucyBhIHN0cmluZy5cbiAgICAgICAqL1xuICAgICAgYWZ0ZXJIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQuZ2V0SW5uZXJIdG1sT2ZGcmFnbWVudCh0aGlzLmFmdGVyKCkpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIEJvdW5kaW5nQ2xpZW50UmVjdCBvZiB0aGUgY3Vyc29yLlxuICAgICAgICogVGhlIHJldHVybmVkIHZhbHVlcyBhcmUgdHJhbnNmb3JtZWQgdG8gYmUgYWJzb2x1dGVcbiAgICAgICAjIChyZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQpLlxuICAgICAgICovXG4gICAgICBnZXRDb29yZGluYXRlczogZnVuY3Rpb24ocG9zaXRpb25pbmcpIHtcbiAgICAgICAgcG9zaXRpb25pbmcgPSBwb3NpdGlvbmluZyB8fCAnYWJzb2x1dGUnO1xuXG4gICAgICAgIHZhciBjb29yZHMgPSB0aGlzLnJhbmdlLm5hdGl2ZVJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAocG9zaXRpb25pbmcgPT09ICdmaXhlZCcpIHJldHVybiBjb29yZHM7XG5cbiAgICAgICAgLy8gY29kZSBmcm9tIG1kbjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL3dpbmRvdy5zY3JvbGxYXG4gICAgICAgIHZhciB3aW4gPSB0aGlzLndpbjtcbiAgICAgICAgdmFyIHggPSAod2luLnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWQpID8gd2luLnBhZ2VYT2Zmc2V0IDogKHdpbi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgd2luLmRvY3VtZW50LmJvZHkucGFyZW50Tm9kZSB8fCB3aW4uZG9jdW1lbnQuYm9keSkuc2Nyb2xsTGVmdDtcbiAgICAgICAgdmFyIHkgPSAod2luLnBhZ2VZT2Zmc2V0ICE9PSB1bmRlZmluZWQpID8gd2luLnBhZ2VZT2Zmc2V0IDogKHdpbi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgd2luLmRvY3VtZW50LmJvZHkucGFyZW50Tm9kZSB8fCB3aW4uZG9jdW1lbnQuYm9keSkuc2Nyb2xsVG9wO1xuXG4gICAgICAgIC8vIHRyYW5zbGF0ZSBpbnRvIGFic29sdXRlIHBvc2l0aW9uc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRvcDogY29vcmRzLnRvcCArIHksXG4gICAgICAgICAgYm90dG9tOiBjb29yZHMuYm90dG9tICsgeSxcbiAgICAgICAgICBsZWZ0OiBjb29yZHMubGVmdCArIHgsXG4gICAgICAgICAgcmlnaHQ6IGNvb3Jkcy5yaWdodCArIHgsXG4gICAgICAgICAgaGVpZ2h0OiBjb29yZHMuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBjb29yZHMud2lkdGhcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIG1vdmVCZWZvcmU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldFN0YXJ0QmVmb3JlKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldEVuZEJlZm9yZShlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICBtb3ZlQWZ0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldFN0YXJ0QWZ0ZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2Uuc2V0RW5kQWZ0ZXIoZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0aW9uKSByZXR1cm4gbmV3IEN1cnNvcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgaG9zdC5cbiAgICAgICAqL1xuICAgICAgbW92ZUF0QmVnaW5uaW5nOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHRoaXMuaG9zdDtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIE1vdmUgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBob3N0LlxuICAgICAgICovXG4gICAgICBtb3ZlQXRFbmQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFlbGVtZW50KSBlbGVtZW50ID0gdGhpcy5ob3N0O1xuICAgICAgICB0aGlzLnVwZGF0ZUhvc3QoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIE1vdmUgdGhlIGN1cnNvciBhZnRlciB0aGUgbGFzdCB2aXNpYmxlIGNoYXJhY3RlciBvZiB0aGUgaG9zdC5cbiAgICAgICAqL1xuICAgICAgbW92ZUF0VGV4dEVuZDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlQXRFbmQocGFyc2VyLmxhdGVzdENoaWxkKGVsZW1lbnQpKTtcbiAgICAgIH0sXG5cbiAgICAgIHNldEhvc3Q6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuanF1ZXJ5KSBlbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgdGhpcy5ob3N0ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy53aW4gPSAoZWxlbWVudCA9PT0gdW5kZWZpbmVkIHx8IGVsZW1lbnQgPT09IG51bGwpID8gd2luZG93IDogZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlSG9zdDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgaG9zdCA9IHBhcnNlci5nZXRIb3N0KGVsZW1lbnQpO1xuICAgICAgICBpZiAoIWhvc3QpIHtcbiAgICAgICAgICBlcnJvcignQ2FuIG5vdCBzZXQgY3Vyc29yIG91dHNpZGUgb2YgYW4gZWRpdGFibGUgYmxvY2snKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhvc3QoaG9zdCk7XG4gICAgICB9LFxuXG4gICAgICByZXRhaW5WaXNpYmxlU2VsZWN0aW9uOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgdGhpcy5yZXN0b3JlKCk7XG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgfSxcblxuICAgICAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2F2ZWRSYW5nZUluZm8gPSByYW5nZVNhdmVSZXN0b3JlLnNhdmUodGhpcy5yYW5nZSk7XG4gICAgICAgIHRoaXMuc2F2ZWRSYW5nZUluZm8uaG9zdCA9IHRoaXMuaG9zdDtcbiAgICAgIH0sXG5cbiAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zYXZlZFJhbmdlSW5mbykge1xuICAgICAgICAgIHRoaXMuaG9zdCA9IHRoaXMuc2F2ZWRSYW5nZUluZm8uaG9zdDtcbiAgICAgICAgICB0aGlzLnJhbmdlID0gcmFuZ2VTYXZlUmVzdG9yZS5yZXN0b3JlKHRoaXMuaG9zdCwgdGhpcy5zYXZlZFJhbmdlSW5mbyk7XG4gICAgICAgICAgdGhpcy5zYXZlZFJhbmdlSW5mbyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlcnJvcignQ291bGQgbm90IHJlc3RvcmUgc2VsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGVxdWFsczogZnVuY3Rpb24oY3Vyc29yKSB7XG4gICAgICAgIGlmICghY3Vyc29yKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFjdXJzb3IuaG9zdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWN1cnNvci5ob3N0LmlzRXF1YWxOb2RlKHRoaXMuaG9zdCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAoIWN1cnNvci5yYW5nZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWN1cnNvci5yYW5nZS5lcXVhbHModGhpcy5yYW5nZSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IHdpdGggdGhlIGNvcnJlY3Qgb3duZXJXaW5kb3dcbiAgICAgIC8vIChzZWU6IGh0dHA6Ly93d3cudzMub3JnL0RPTS9mYXEuaHRtbCNvd25lcmRvYylcbiAgICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBNYWtlIHN1cmUgYSBub2RlIGhhcyB0aGUgY29ycmVjdCBvd25lcldpbmRvd1xuICAgICAgLy8gKHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0RvY3VtZW50L2ltcG9ydE5vZGUpXG4gICAgICBhZG9wdEVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQuYWRvcHRFbGVtZW50KG5vZGUsIHRoaXMud2luLmRvY3VtZW50KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEN1cnJlbnRseSB3ZSBjYWxsIHRyaWdnZXJDaGFuZ2UgbWFudWFsbHkgYWZ0ZXIgZm9ybWF0IGNoYW5nZXMuXG4gICAgICAvLyBUaGlzIGlzIHRvIHByZXZlbnQgZXhjZXNzaXZlIHRyaWdnZXJpbmcgb2YgdGhlIGNoYW5nZSBldmVudCBkdXJpbmdcbiAgICAgIC8vIG1lcmdlIG9yIHNwbGl0IG9wZXJhdGlvbnMgb3Igb3RoZXIgbWFuaXB1bGF0aW9ucyBieSBzY3JpcHRzLlxuICAgICAgdHJpZ2dlckNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5ob3N0KS50cmlnZ2VyKCdmb3JtYXRFZGl0YWJsZScpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG5cbiAgcmV0dXJuIEN1cnNvcjtcbn0pKCk7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgYnJvd3NlckZlYXR1cmVzID0gcmVxdWlyZSgnLi9mZWF0dXJlLWRldGVjdGlvbicpO1xudmFyIGNsaXBib2FyZCA9IHJlcXVpcmUoJy4vY2xpcGJvYXJkJyk7XG52YXIgZXZlbnRhYmxlID0gcmVxdWlyZSgnLi9ldmVudGFibGUnKTtcbnZhciBTZWxlY3Rpb25XYXRjaGVyID0gcmVxdWlyZSgnLi9zZWxlY3Rpb24td2F0Y2hlcicpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL2tleWJvYXJkJyk7XG5cbi8qKlxuICogVGhlIERpc3BhdGNoZXIgbW9kdWxlIGlzIHJlc3BvbnNpYmxlIGZvciBkZWFsaW5nIHdpdGggZXZlbnRzIGFuZCB0aGVpciBoYW5kbGVycy5cbiAqXG4gKiBAbW9kdWxlIGNvcmVcbiAqIEBzdWJtb2R1bGUgZGlzcGF0Y2hlclxuICovXG5cbnZhciBEaXNwYXRjaGVyID0gZnVuY3Rpb24oZWRpdGFibGUpIHtcbiAgdmFyIHdpbiA9IGVkaXRhYmxlLndpbjtcbiAgZXZlbnRhYmxlKHRoaXMsIGVkaXRhYmxlKTtcbiAgdGhpcy5zdXBwb3J0c0lucHV0RXZlbnQgPSBmYWxzZTtcbiAgdGhpcy4kZG9jdW1lbnQgPSAkKHdpbi5kb2N1bWVudCk7XG4gIHRoaXMuY29uZmlnID0gZWRpdGFibGUuY29uZmlnO1xuICB0aGlzLmVkaXRhYmxlID0gZWRpdGFibGU7XG4gIHRoaXMuZWRpdGFibGVTZWxlY3RvciA9IGVkaXRhYmxlLmVkaXRhYmxlU2VsZWN0b3I7XG4gIHRoaXMuc2VsZWN0aW9uV2F0Y2hlciA9IG5ldyBTZWxlY3Rpb25XYXRjaGVyKHRoaXMsIHdpbik7XG4gIHRoaXMua2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQodGhpcy5zZWxlY3Rpb25XYXRjaGVyKTtcbiAgdGhpcy5zZXR1cCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuXG4vLyBUaGlzIHdpbGwgYmUgc2V0IHRvIHRydWUgb25jZSB3ZSBkZXRlY3QgdGhlIGlucHV0IGV2ZW50IGlzIHdvcmtpbmcuXG4vLyBJbnB1dCBldmVudCBkZXNjcmlwdGlvbiBvbiBNRE46XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9SZWZlcmVuY2UvRXZlbnRzL2lucHV0XG52YXIgaXNJbnB1dEV2ZW50U3VwcG9ydGVkID0gZmFsc2U7XG5cbi8qKlxuICogU2V0cyB1cCBhbGwgZXZlbnRzIHRoYXQgRWRpdGFibGUuSlMgaXMgY2F0Y2hpbmcuXG4gKlxuICogQG1ldGhvZCBzZXR1cFxuICovXG5EaXNwYXRjaGVyLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAvLyBzZXR1cCBhbGwgZXZlbnRzIG5vdGlmaWNhdGlvbnNcbiAgdGhpcy5zZXR1cEVsZW1lbnRFdmVudHMoKTtcbiAgdGhpcy5zZXR1cEtleWJvYXJkRXZlbnRzKCk7XG5cbiAgaWYgKGJyb3dzZXJGZWF0dXJlcy5zZWxlY3Rpb25jaGFuZ2UpIHtcbiAgICB0aGlzLnNldHVwU2VsZWN0aW9uQ2hhbmdlRXZlbnRzKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zZXR1cFNlbGVjdGlvbkNoYW5nZUZhbGxiYWNrKCk7XG4gIH1cbn07XG5cbkRpc3BhdGNoZXIucHJvdG90eXBlLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9mZigpO1xuICB0aGlzLiRkb2N1bWVudC5vZmYoJy5lZGl0YWJsZScpO1xufTtcblxuLyoqXG4gKiBTZXRzIHVwIGV2ZW50cyB0aGF0IGFyZSB0cmlnZ2VyZWQgb24gbW9kaWZ5aW5nIGFuIGVsZW1lbnQuXG4gKlxuICogQG1ldGhvZCBzZXR1cEVsZW1lbnRFdmVudHNcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9ICRkb2N1bWVudDogVGhlIGRvY3VtZW50IGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub3RpZmllcjogVGhlIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIHRoZSBldmVudCBpcyBjYXVnaHQuXG4gKi9cbkRpc3BhdGNoZXIucHJvdG90eXBlLnNldHVwRWxlbWVudEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLiRkb2N1bWVudC5vbignZm9jdXMuZWRpdGFibGUnLCBfdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICh0aGlzLmdldEF0dHJpYnV0ZShjb25maWcucGFzdGluZ0F0dHJpYnV0ZSkpIHJldHVybjtcbiAgICBfdGhpcy5ub3RpZnkoJ2ZvY3VzJywgdGhpcyk7XG4gIH0pLm9uKCdibHVyLmVkaXRhYmxlJywgX3RoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoY29uZmlnLnBhc3RpbmdBdHRyaWJ1dGUpKSByZXR1cm47XG4gICAgX3RoaXMubm90aWZ5KCdibHVyJywgdGhpcyk7XG4gIH0pLm9uKCdjb3B5LmVkaXRhYmxlJywgX3RoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gX3RoaXMuc2VsZWN0aW9uV2F0Y2hlci5nZXRGcmVzaFNlbGVjdGlvbigpO1xuICAgIGlmIChzZWxlY3Rpb24uaXNTZWxlY3Rpb24pIHtcbiAgICAgIF90aGlzLm5vdGlmeSgnY2xpcGJvYXJkJywgdGhpcywgJ2NvcHknLCBzZWxlY3Rpb24pO1xuICAgIH1cbiAgfSkub24oJ2N1dC5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hTZWxlY3Rpb24oKTtcbiAgICBpZiAoc2VsZWN0aW9uLmlzU2VsZWN0aW9uKSB7XG4gICAgICBfdGhpcy5ub3RpZnkoJ2NsaXBib2FyZCcsIHRoaXMsICdjdXQnLCBzZWxlY3Rpb24pO1xuICAgICAgX3RoaXMudHJpZ2dlckNoYW5nZUV2ZW50KHRoaXMpO1xuICAgIH1cbiAgfSkub24oJ3Bhc3RlLmVkaXRhYmxlJywgX3RoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIGFmdGVyUGFzdGUgPSBmdW5jdGlvbiAoYmxvY2tzLCBjdXJzb3IpIHtcbiAgICAgIGlmIChibG9ja3MubGVuZ3RoKSB7XG4gICAgICAgIF90aGlzLm5vdGlmeSgncGFzdGUnLCBlbGVtZW50LCBibG9ja3MsIGN1cnNvcik7XG5cbiAgICAgICAgLy8gVGhlIGlucHV0IGV2ZW50IGRvZXMgbm90IGZpcmUgd2hlbiB3ZSBwcm9jZXNzIHRoZSBjb250ZW50IG1hbnVhbGx5XG4gICAgICAgIC8vIGFuZCBpbnNlcnQgaXQgdmlhIHNjcmlwdFxuICAgICAgICBfdGhpcy5ub3RpZnkoJ2NoYW5nZScsIGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3Vyc29yLnNldFZpc2libGVTZWxlY3Rpb24oKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGN1cnNvciA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hTZWxlY3Rpb24oKTtcbiAgICBjbGlwYm9hcmQucGFzdGUodGhpcywgY3Vyc29yLCBhZnRlclBhc3RlKTtcblxuXG4gIH0pLm9uKCdpbnB1dC5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKGlzSW5wdXRFdmVudFN1cHBvcnRlZCkge1xuICAgICAgX3RoaXMubm90aWZ5KCdjaGFuZ2UnLCB0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTW9zdCBsaWtlbHkgdGhlIGV2ZW50IHdhcyBhbHJlYWR5IGhhbmRsZWQgbWFudWFsbHkgYnlcbiAgICAgIC8vIHRyaWdnZXJDaGFuZ2VFdmVudCBzbyB0aGUgZmlyc3QgdGltZSB3ZSBqdXN0IHN3aXRjaCB0aGVcbiAgICAgIC8vIGlzSW5wdXRFdmVudFN1cHBvcnRlZCBmbGFnIHdpdGhvdXQgbm90aWZpeWluZyB0aGUgY2hhbmdlIGV2ZW50LlxuICAgICAgaXNJbnB1dEV2ZW50U3VwcG9ydGVkID0gdHJ1ZTtcbiAgICB9XG4gIH0pLm9uKCdmb3JtYXRFZGl0YWJsZS5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMubm90aWZ5KCdjaGFuZ2UnLCB0aGlzKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFRyaWdnZXIgYSBjaGFuZ2UgZXZlbnRcbiAqXG4gKiBUaGlzIHNob3VsZCBiZSBkb25lIGluIHRoZXNlIGNhc2VzOlxuICogLSB0eXBpbmcgYSBsZXR0ZXJcbiAqIC0gZGVsZXRlIChiYWNrc3BhY2UgYW5kIGRlbGV0ZSBrZXlzKVxuICogLSBjdXRcbiAqIC0gcGFzdGVcbiAqIC0gY29weSBhbmQgcGFzdGUgKG5vdCBlYXNpbHkgcG9zc2libGUgbWFudWFsbHkgYXMgZmFyIGFzIEkga25vdylcbiAqXG4gKiBQcmVmZXJyYWJseSB0aGlzIGlzIGRvbmUgdXNpbmcgdGhlIGlucHV0IGV2ZW50LiBCdXQgdGhlIGlucHV0IGV2ZW50IGlzIG5vdFxuICogc3VwcG9ydGVkIG9uIGFsbCBicm93c2VycyBmb3IgY29udGVudGVkaXRhYmxlIGVsZW1lbnRzLlxuICogVG8gbWFrZSB0aGluZ3Mgd29yc2UgaXQgaXMgbm90IGRldGVjdGFibGUgZWl0aGVyLiBTbyBpbnN0ZWFkIG9mIGRldGVjdGluZ1xuICogd2Ugc2V0ICdpc0lucHV0RXZlbnRTdXBwb3J0ZWQnIHdoZW4gdGhlIGlucHV0IGV2ZW50IGZpcmVzIHRoZSBmaXJzdCB0aW1lLlxuICovXG5EaXNwYXRjaGVyLnByb3RvdHlwZS50cmlnZ2VyQ2hhbmdlRXZlbnQgPSBmdW5jdGlvbih0YXJnZXQpe1xuICBpZiAoaXNJbnB1dEV2ZW50U3VwcG9ydGVkKSByZXR1cm47XG4gIHRoaXMubm90aWZ5KCdjaGFuZ2UnLCB0YXJnZXQpO1xufTtcblxuRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2hTd2l0Y2hFdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCBkaXJlY3Rpb24pIHtcbiAgdmFyIGN1cnNvcjtcbiAgaWYgKGV2ZW50LmFsdEtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuc2hpZnRLZXkpXG4gICAgcmV0dXJuO1xuXG4gIGN1cnNvciA9IHRoaXMuc2VsZWN0aW9uV2F0Y2hlci5nZXRTZWxlY3Rpb24oKTtcbiAgaWYgKCFjdXJzb3IgfHwgY3Vyc29yLmlzU2VsZWN0aW9uKSByZXR1cm47XG4gIC8vIERldGVjdCBpZiB0aGUgYnJvd3NlciBtb3ZlZCB0aGUgY3Vyc29yIGluIHRoZSBuZXh0IHRpY2suXG4gIC8vIElmIHRoZSBjdXJzb3Igc3RheXMgYXQgaXRzIHBvc2l0aW9uLCBmaXJlIHRoZSBzd2l0Y2ggZXZlbnQuXG4gIHZhciBkaXNwYXRjaGVyID0gdGhpcztcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3Q3Vyc29yID0gZGlzcGF0Y2hlci5zZWxlY3Rpb25XYXRjaGVyLmZvcmNlQ3Vyc29yKCk7XG4gICAgaWYgKG5ld0N1cnNvci5lcXVhbHMoY3Vyc29yKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZGlzcGF0Y2hlci5ub3RpZnkoJ3N3aXRjaCcsIGVsZW1lbnQsIGRpcmVjdGlvbiwgbmV3Q3Vyc29yKTtcbiAgICB9XG4gIH0sIDEpO1xufTtcblxuLyoqXG4gKiBTZXRzIHVwIGV2ZW50cyB0aGF0IGFyZSB0cmlnZ2VyZWQgb24ga2V5Ym9hcmQgZXZlbnRzLlxuICogS2V5Ym9hcmQgZGVmaW5pdGlvbnMgYXJlIGluIHt7I2Nyb3NzTGluayBcIktleWJvYXJkXCJ9fXt7L2Nyb3NzTGlua319LlxuICpcbiAqIEBtZXRob2Qgc2V0dXBLZXlib2FyZEV2ZW50c1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gJGRvY3VtZW50OiBUaGUgZG9jdW1lbnQgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vdGlmaWVyOiBUaGUgY2FsbGJhY2sgdG8gYmUgdHJpZ2dlcmVkIHdoZW4gdGhlIGV2ZW50IGlzIGNhdWdodC5cbiAqL1xuRGlzcGF0Y2hlci5wcm90b3R5cGUuc2V0dXBLZXlib2FyZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuJGRvY3VtZW50Lm9uKCdrZXlkb3duLmVkaXRhYmxlJywgdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBub3RpZnlDaGFyYWN0ZXJFdmVudCA9ICFpc0lucHV0RXZlbnRTdXBwb3J0ZWQ7XG4gICAgX3RoaXMua2V5Ym9hcmQuZGlzcGF0Y2hLZXlFdmVudChldmVudCwgdGhpcywgbm90aWZ5Q2hhcmFjdGVyRXZlbnQpO1xuICB9KTtcblxuICB0aGlzLmtleWJvYXJkLm9uKCdsZWZ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5kaXNwYXRjaFN3aXRjaEV2ZW50KGV2ZW50LCB0aGlzLCAnYmVmb3JlJyk7XG4gIH0pLm9uKCd1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMuZGlzcGF0Y2hTd2l0Y2hFdmVudChldmVudCwgdGhpcywgJ2JlZm9yZScpO1xuICB9KS5vbigncmlnaHQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLmRpc3BhdGNoU3dpdGNoRXZlbnQoZXZlbnQsIHRoaXMsICdhZnRlcicpO1xuICB9KS5vbignZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMuZGlzcGF0Y2hTd2l0Y2hFdmVudChldmVudCwgdGhpcywgJ2FmdGVyJyk7XG4gIH0pLm9uKCd0YWInLCBmdW5jdGlvbihldmVudCkge1xuICB9KS5vbignc2hpZnRUYWInLCBmdW5jdGlvbihldmVudCkge1xuICB9KS5vbignZXNjJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgfSkub24oJ2JhY2tzcGFjZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHJhbmdlID0gX3RoaXMuc2VsZWN0aW9uV2F0Y2hlci5nZXRGcmVzaFJhbmdlKCk7XG4gICAgaWYgKHJhbmdlLmlzQ3Vyc29yKSB7XG4gICAgICB2YXIgY3Vyc29yID0gcmFuZ2UuZ2V0Q3Vyc29yKCk7XG4gICAgICBpZiAoIGN1cnNvci5pc0F0QmVnaW5uaW5nKCkgKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBfdGhpcy5ub3RpZnkoJ21lcmdlJywgdGhpcywgJ2JlZm9yZScsIGN1cnNvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy50cmlnZ2VyQ2hhbmdlRXZlbnQodGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLnRyaWdnZXJDaGFuZ2VFdmVudCh0aGlzKTtcbiAgICB9XG4gIH0pLm9uKCdkZWxldGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciByYW5nZSA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hSYW5nZSgpO1xuICAgIGlmIChyYW5nZS5pc0N1cnNvcikge1xuICAgICAgdmFyIGN1cnNvciA9IHJhbmdlLmdldEN1cnNvcigpO1xuICAgICAgaWYgKGN1cnNvci5pc0F0VGV4dEVuZCgpKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBfdGhpcy5ub3RpZnkoJ21lcmdlJywgdGhpcywgJ2FmdGVyJywgY3Vyc29yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnRyaWdnZXJDaGFuZ2VFdmVudCh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgX3RoaXMudHJpZ2dlckNoYW5nZUV2ZW50KHRoaXMpO1xuICAgIH1cbiAgfSkub24oJ2VudGVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHZhciByYW5nZSA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hSYW5nZSgpO1xuICAgIHZhciBjdXJzb3IgPSByYW5nZS5mb3JjZUN1cnNvcigpO1xuXG4gICAgaWYgKGN1cnNvci5pc0F0VGV4dEVuZCgpKSB7XG4gICAgICBfdGhpcy5ub3RpZnkoJ2luc2VydCcsIHRoaXMsICdhZnRlcicsIGN1cnNvcik7XG4gICAgfSBlbHNlIGlmIChjdXJzb3IuaXNBdEJlZ2lubmluZygpKSB7XG4gICAgICBfdGhpcy5ub3RpZnkoJ2luc2VydCcsIHRoaXMsICdiZWZvcmUnLCBjdXJzb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfdGhpcy5ub3RpZnkoJ3NwbGl0JywgdGhpcywgY3Vyc29yLmJlZm9yZSgpLCBjdXJzb3IuYWZ0ZXIoKSwgY3Vyc29yKTtcbiAgICB9XG5cbiAgfSkub24oJ3NoaWZ0RW50ZXInLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdmFyIGN1cnNvciA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZm9yY2VDdXJzb3IoKTtcbiAgICBfdGhpcy5ub3RpZnkoJ25ld2xpbmUnLCB0aGlzLCBjdXJzb3IpO1xuICB9KS5vbignY2hhcmFjdGVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5ub3RpZnkoJ2NoYW5nZScsIHRoaXMpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2V0cyB1cCBldmVudHMgdGhhdCBhcmUgdHJpZ2dlcmVkIG9uIGEgc2VsZWN0aW9uIGNoYW5nZS5cbiAqXG4gKiBAbWV0aG9kIHNldHVwU2VsZWN0aW9uQ2hhbmdlRXZlbnRzXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSAkZG9jdW1lbnQ6IFRoZSBkb2N1bWVudCBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm90aWZpZXI6IFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiB0aGUgZXZlbnQgaXMgY2F1Z2h0LlxuICovXG5EaXNwYXRjaGVyLnByb3RvdHlwZS5zZXR1cFNlbGVjdGlvbkNoYW5nZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZWN0aW9uRGlydHkgPSBmYWxzZTtcbiAgdmFyIHN1cHByZXNzU2VsZWN0aW9uQ2hhbmdlcyA9IGZhbHNlO1xuICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XG4gIHZhciBzZWxlY3Rpb25XYXRjaGVyID0gdGhpcy5zZWxlY3Rpb25XYXRjaGVyO1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIC8vIGZpcmVzIG9uIG1vdXNlbW92ZSAodGhhdHMgcHJvYmFibHkgYSBiaXQgdG9vIG11Y2gpXG4gIC8vIGNhdGNoZXMgY2hhbmdlcyBsaWtlICdzZWxlY3QgYWxsJyBmcm9tIGNvbnRleHQgbWVudVxuICAkZG9jdW1lbnQub24oJ3NlbGVjdGlvbmNoYW5nZS5lZGl0YWJsZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHN1cHByZXNzU2VsZWN0aW9uQ2hhbmdlcykge1xuICAgICAgc2VsZWN0aW9uRGlydHkgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3Rpb25XYXRjaGVyLnNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGxpc3RlbiBmb3Igc2VsZWN0aW9uIGNoYW5nZXMgYnkgbW91c2Ugc28gd2UgY2FuXG4gIC8vIHN1cHByZXNzIHRoZSBzZWxlY3Rpb25jaGFuZ2UgZXZlbnQgYW5kIG9ubHkgZmlyZSB0aGVcbiAgLy8gY2hhbmdlIGV2ZW50IG9uIG1vdXNldXBcbiAgJGRvY3VtZW50Lm9uKCdtb3VzZWRvd24uZWRpdGFibGUnLCB0aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKF90aGlzLmNvbmZpZy5tb3VzZU1vdmVTZWxlY3Rpb25DaGFuZ2VzID09PSBmYWxzZSkge1xuICAgICAgc3VwcHJlc3NTZWxlY3Rpb25DaGFuZ2VzID0gdHJ1ZTtcblxuICAgICAgLy8gV2l0aG91dCB0aGlzIHRpbWVvdXQgdGhlIHByZXZpb3VzIHNlbGVjdGlvbiBpcyBhY3RpdmVcbiAgICAgIC8vIHVudGlsIHRoZSBtb3VzZXVwIGV2ZW50IChuby4gbm90IGdvb2QpLlxuICAgICAgc2V0VGltZW91dCgkLnByb3h5KHNlbGVjdGlvbldhdGNoZXIsICdzZWxlY3Rpb25DaGFuZ2VkJyksIDApO1xuICAgIH1cblxuICAgICRkb2N1bWVudC5vbignbW91c2V1cC5lZGl0YWJsZVNlbGVjdGlvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAkZG9jdW1lbnQub2ZmKCcuZWRpdGFibGVTZWxlY3Rpb24nKTtcbiAgICAgIHN1cHByZXNzU2VsZWN0aW9uQ2hhbmdlcyA9IGZhbHNlO1xuXG4gICAgICBpZiAoc2VsZWN0aW9uRGlydHkpIHtcbiAgICAgICAgc2VsZWN0aW9uRGlydHkgPSBmYWxzZTtcbiAgICAgICAgc2VsZWN0aW9uV2F0Y2hlci5zZWxlY3Rpb25DaGFuZ2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG4vKipcbiAqIEZhbGxiYWNrIHNvbHV0aW9uIHRvIHN1cHBvcnQgc2VsZWN0aW9uIGNoYW5nZSBldmVudHMgb24gYnJvd3NlcnMgdGhhdCBkb24ndFxuICogc3VwcG9ydCBzZWxlY3Rpb25DaGFuZ2UuXG4gKlxuICogQG1ldGhvZCBzZXR1cFNlbGVjdGlvbkNoYW5nZUZhbGxiYWNrXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSAkZG9jdW1lbnQ6IFRoZSBkb2N1bWVudCBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm90aWZpZXI6IFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiB0aGUgZXZlbnQgaXMgY2F1Z2h0LlxuICovXG5EaXNwYXRjaGVyLnByb3RvdHlwZS5zZXR1cFNlbGVjdGlvbkNoYW5nZUZhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcbiAgdmFyIHNlbGVjdGlvbldhdGNoZXIgPSB0aGlzLnNlbGVjdGlvbldhdGNoZXI7XG5cbiAgLy8gbGlzdGVuIGZvciBzZWxlY3Rpb24gY2hhbmdlcyBieSBtb3VzZVxuICAkZG9jdW1lbnQub24oJ21vdXNldXAuZWRpdGFibGVTZWxlY3Rpb24nLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgLy8gSW4gT3BlcmEgd2hlbiBjbGlja2luZyBvdXRzaWRlIG9mIGEgYmxvY2tcbiAgICAvLyBpdCBkb2VzIG5vdCB1cGRhdGUgdGhlIHNlbGVjdGlvbiBhcyBpdCBzaG91bGRcbiAgICAvLyB3aXRob3V0IHRoZSB0aW1lb3V0XG4gICAgc2V0VGltZW91dCgkLnByb3h5KHNlbGVjdGlvbldhdGNoZXIsICdzZWxlY3Rpb25DaGFuZ2VkJyksIDApO1xuICB9KTtcblxuICAvLyBsaXN0ZW4gZm9yIHNlbGVjdGlvbiBjaGFuZ2VzIGJ5IGtleXNcbiAgJGRvY3VtZW50Lm9uKCdrZXl1cC5lZGl0YWJsZScsIHRoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIC8vIHdoZW4gcHJlc3NpbmcgQ29tbWFuZCArIFNoaWZ0ICsgTGVmdCBmb3IgZXhhbXBsZSB0aGUga2V5dXAgaXMgb25seSB0cmlnZ2VyZWRcbiAgICAvLyBhZnRlciBhdCBsZWFzdCB0d28ga2V5cyBhcmUgcmVsZWFzZWQuIFN0cmFuZ2UuIFRoZSBjdWxwcml0IHNlZW1zIHRvIGJlIHRoZVxuICAgIC8vIENvbW1hbmQga2V5LiBEbyB3ZSBuZWVkIGEgd29ya2Fyb3VuZD9cbiAgICBzZWxlY3Rpb25XYXRjaGVyLnNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgfSk7XG59O1xuIiwiXG4vLyBFdmVudGFibGUgTWl4aW4uXG4vL1xuLy8gU2ltcGxlIG1peGluIHRvIGFkZCBldmVudCBlbWl0dGVyIG1ldGhvZHMgdG8gYW4gb2JqZWN0IChQdWJsaXNoL1N1YnNjcmliZSkuXG4vL1xuLy8gQWRkIG9uLCBvZmYgYW5kIG5vdGlmeSBtZXRob2RzIHRvIGFuIG9iamVjdDpcbi8vIGV2ZW50YWJsZShvYmopO1xuLy9cbi8vIHB1Ymxpc2ggYW4gZXZlbnQ6XG4vLyBvYmoubm90aWZ5KGNvbnRleHQsICdhY3Rpb24nLCBwYXJhbTEsIHBhcmFtMik7XG4vL1xuLy8gT3B0aW9uYWxseSBwYXNzIGEgY29udGV4dCB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byBldmVyeSBldmVudDpcbi8vIGV2ZW50YWJsZShvYmosIGNvbnRleHQpO1xuLy9cbi8vIFdpdGggdGhpcyBwdWJsaXNoaW5nIGNhbiBvbWl0IHRoZSBjb250ZXh0IGFyZ3VtZW50OlxuLy8gb2JqLm5vdGlmeSgnYWN0aW9uJywgcGFyYW0xLCBwYXJhbTIpO1xuLy9cbi8vIFN1YnNjcmliZSB0byBhICdjaGFubmVsJ1xuLy8gb2JqLm9uKCdhY3Rpb24nLCBmdW50aW9uKHBhcmFtMSwgcGFyYW0yKXsgLi4uIH0pO1xuLy9cbi8vIFVuc3Vic2NyaWJlIGFuIGluZGl2aWR1YWwgbGlzdGVuZXI6XG4vLyBvYmoub2ZmKCdhY3Rpb24nLCBtZXRob2QpO1xuLy9cbi8vIFVuc3Vic2NyaWJlIGFsbCBsaXN0ZW5lcnMgb2YgYSBjaGFubmVsOlxuLy8gb2JqLm9mZignYWN0aW9uJyk7XG4vL1xuLy8gVW5zdWJzY3JpYmUgYWxsIGxpc3RlbmVycyBvZiBhbGwgY2hhbm5lbHM6XG4vLyBvYmoub2ZmKCk7XG52YXIgZ2V0RXZlbnRhYmxlTW9kdWxlID0gZnVuY3Rpb24obm90aWZ5Q29udGV4dCkge1xuICB2YXIgbGlzdGVuZXJzID0ge307XG5cbiAgdmFyIGFkZExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgaWYgKGxpc3RlbmVyc1tldmVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lcnNbZXZlbnRdLnB1c2gobGlzdGVuZXIpO1xuICB9O1xuXG4gIHZhciByZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHZhciBldmVudExpc3RlbmVycyA9IGxpc3RlbmVyc1tldmVudF07XG4gICAgaWYgKGV2ZW50TGlzdGVuZXJzID09PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldmVudExpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGV2ZW50TGlzdGVuZXJzW2ldID09PSBsaXN0ZW5lcikge1xuICAgICAgICBldmVudExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBQdWJsaWMgTWV0aG9kc1xuICByZXR1cm4ge1xuICAgIG9uOiBmdW5jdGlvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGFkZExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdmFyIGV2ZW50T2JqID0gZXZlbnQ7XG4gICAgICAgIGZvciAodmFyIGV2ZW50VHlwZSBpbiBldmVudE9iaikge1xuICAgICAgICAgIGFkZExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRPYmpbZXZlbnRUeXBlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBsaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lcnMgPSB7fTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbm90aWZ5OiBmdW5jdGlvbihjb250ZXh0LCBldmVudCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgaWYgKG5vdGlmeUNvbnRleHQpIHtcbiAgICAgICAgZXZlbnQgPSBjb250ZXh0O1xuICAgICAgICBjb250ZXh0ID0gbm90aWZ5Q29udGV4dDtcbiAgICAgICAgYXJncyA9IGFyZ3Muc3BsaWNlKDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IGFyZ3Muc3BsaWNlKDIpO1xuICAgICAgfVxuICAgICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgIGlmIChldmVudExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgIC8vIFRyYXZlcnNlIGJhY2t3YXJkcyBhbmQgZXhlY3V0ZSB0aGUgbmV3ZXN0IGxpc3RlbmVycyBmaXJzdC5cbiAgICAgIC8vIFN0b3AgaWYgYSBsaXN0ZW5lciByZXR1cm5zIGZhbHNlLlxuICAgICAgZm9yICh2YXIgaSA9IGV2ZW50TGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIC8vIGRlYnVnZ2VyXG4gICAgICAgIGlmIChldmVudExpc3RlbmVyc1tpXS5hcHBseShjb250ZXh0LCBhcmdzKSA9PT0gZmFsc2UpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgbm90aWZ5Q29udGV4dCkge1xuICB2YXIgbW9kdWxlID0gZ2V0RXZlbnRhYmxlTW9kdWxlKG5vdGlmeUNvbnRleHQpO1xuICBmb3IgKHZhciBwcm9wIGluIG1vZHVsZSkge1xuICAgIG9ialtwcm9wXSA9IG1vZHVsZVtwcm9wXTtcbiAgfVxufTtcbiIsInZhciBicm93c2VyID0gcmVxdWlyZSgnYm93c2VyJykuYnJvd3NlcjtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIC8qKlxuICAgKiBDaGVjayBmb3IgY29udGVudGVkaXRhYmxlIHN1cHBvcnRcbiAgICpcbiAgICogKGZyb20gTW9kZXJuaXpyKVxuICAgKiB0aGlzIGlzIGtub3duIHRvIGZhbHNlIHBvc2l0aXZlIGluIHNvbWUgbW9iaWxlIGJyb3dzZXJzXG4gICAqIGhlcmUgaXMgYSB3aGl0ZWxpc3Qgb2YgdmVyaWZpZWQgd29ya2luZyBicm93c2VyczpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL05pZWxzTGVlbmhlZXIvaHRtbDV0ZXN0L2Jsb2IvNTQ5ZjZlYWM4NjZhYTg2MWQ5NjQ5YTA3MDdmZjJjMDE1Nzg5NTcwNi9zY3JpcHRzL2VuZ2luZS5qcyNMMjA4M1xuICAgKi9cbiAgdmFyIGNvbnRlbnRlZGl0YWJsZSA9IHR5cGVvZiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY29udGVudEVkaXRhYmxlICE9PSAndW5kZWZpbmVkJztcblxuICAvKipcbiAgICogQ2hlY2sgc2VsZWN0aW9uY2hhbmdlIGV2ZW50IChjdXJyZW50bHkgc3VwcG9ydGVkIGluIElFLCBDaHJvbWUgYW5kIFNhZmFyaSlcbiAgICpcbiAgICogVG8gaGFuZGxlIHNlbGVjdGlvbmNoYW5nZSBpbiBmaXJlZm94IHNlZSBDS0VkaXRvciBzZWxlY3Rpb24gb2JqZWN0XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ja2VkaXRvci9ja2VkaXRvci1kZXYvYmxvYi9tYXN0ZXIvY29yZS9zZWxlY3Rpb24uanMjTDM4OFxuICAgKi9cbiAgdmFyIHNlbGVjdGlvbmNoYW5nZSA9IChmdW5jdGlvbigpIHtcblxuICAgIC8vIG5vdCBleGFjdGx5IGZlYXR1cmUgZGV0ZWN0aW9uLi4uIGlzIGl0P1xuICAgIHJldHVybiAhKGJyb3dzZXIuZ2Vja28gfHwgYnJvd3Nlci5vcGVyYSk7XG4gIH0pKCk7XG5cblxuICAvLyBDaHJvbWUgY29udGVudGVkaXRhYmxlIGJ1ZyB3aGVuIGluc2VydGluZyBhIGNoYXJhY3RlciB3aXRoIGEgc2VsZWN0aW9uIHRoYXQ6XG4gIC8vICAtIHN0YXJ0cyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjb250ZW50ZWRpdGFibGVcbiAgLy8gIC0gY29udGFpbnMgYSBzdHlsZWQgc3BhblxuICAvLyAgLSBhbmQgc29tZSB1bnN0eWxlZCB0ZXh0XG4gIC8vXG4gIC8vIEV4YW1wbGU6XG4gIC8vIDxwPnw8c3BhbiBjbGFzcz1cImhpZ2hsaWdodFwiPmE8L3NwYW4+Ynw8L3A+XG4gIC8vXG4gIC8vIEZvciBtb3JlIGRldGFpbHM6XG4gIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zMzU5NTVcbiAgLy9cbiAgLy8gSXQgc2VlbXMgaXQgaXMgYSB3ZWJraXQgYnVnIGFzIEkgY291bGQgcmVwcm9kdWNlIG9uIFNhZmFyaSAoTFApLlxuICB2YXIgY29udGVudGVkaXRhYmxlU3BhbkJ1ZyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gISFicm93c2VyLndlYmtpdDtcbiAgfSkoKTtcblxuXG4gIHJldHVybiB7XG4gICAgY29udGVudGVkaXRhYmxlOiBjb250ZW50ZWRpdGFibGUsXG4gICAgc2VsZWN0aW9uY2hhbmdlOiBzZWxlY3Rpb25jaGFuZ2UsXG4gICAgY29udGVudGVkaXRhYmxlU3BhbkJ1ZzogY29udGVudGVkaXRhYmxlU3BhbkJ1Z1xuICB9O1xuXG59KSgpO1xuIiwidmFyIHJhbmd5ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3Jhbmd5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydyYW5neSddIDogbnVsbCk7XG52YXIgTm9kZUl0ZXJhdG9yID0gcmVxdWlyZSgnLi9ub2RlLWl0ZXJhdG9yJyk7XG52YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICByZXR1cm4ge1xuICAgIGV4dHJhY3RUZXh0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgdGV4dCA9ICcnO1xuICAgICAgdGhpcy5nZXRUZXh0KGVsZW1lbnQsIGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgdGV4dCArPSBwYXJ0O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdCB0aGUgdGV4dCBvZiBhbiBlbGVtZW50LlxuICAgIC8vIFRoaXMgaGFzIHR3byBub3RhYmxlIGJlaGF2aW91cnM6XG4gICAgLy8gLSBJdCB1c2VzIGEgTm9kZUl0ZXJhdG9yIHdoaWNoIHdpbGwgc2tpcCBlbGVtZW50c1xuICAgIC8vICAgd2l0aCBkYXRhLWVkaXRhYmxlPVwicmVtb3ZlXCJcbiAgICAvLyAtIEl0IHJldHVybnMgYSBzcGFjZSBmb3IgPGJyPiBlbGVtZW50c1xuICAgIC8vICAgKFRoZSBvbmx5IGJsb2NrIGxldmVsIGVsZW1lbnQgYWxsb3dlZCBpbnNpZGUgb2YgZWRpdGFibGVzKVxuICAgIGdldFRleHQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBuZXcgTm9kZUl0ZXJhdG9yKGVsZW1lbnQpO1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB3aGlsZSAoIChuZXh0ID0gaXRlcmF0b3IuZ2V0TmV4dCgpKSApIHtcbiAgICAgICAgaWYgKG5leHQubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlICYmIG5leHQuZGF0YSAhPT0gJycpIHtcbiAgICAgICAgICBjYWxsYmFjayhuZXh0LmRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHQubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlICYmIG5leHQubm9kZU5hbWUgPT09ICdCUicpIHtcbiAgICAgICAgICBjYWxsYmFjaygnICcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZ2hsaWdodDogZnVuY3Rpb24oZWxlbWVudCwgcmVnZXgsIHN0ZW5jaWxFbGVtZW50KSB7XG4gICAgICB2YXIgbWF0Y2hlcyA9IHRoaXMuZmluZChlbGVtZW50LCByZWdleCk7XG4gICAgICB0aGlzLmhpZ2hsaWdodE1hdGNoZXMoZWxlbWVudCwgbWF0Y2hlcywgc3RlbmNpbEVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbihlbGVtZW50LCByZWdleCkge1xuICAgICAgdmFyIHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0KGVsZW1lbnQpO1xuICAgICAgdmFyIG1hdGNoO1xuICAgICAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgICAgIHZhciBtYXRjaEluZGV4ID0gMDtcbiAgICAgIHdoaWxlICggKG1hdGNoID0gcmVnZXguZXhlYyh0ZXh0KSkgKSB7XG4gICAgICAgIG1hdGNoZXMucHVzaCh0aGlzLnByZXBhcmVNYXRjaChtYXRjaCwgbWF0Y2hJbmRleCkpO1xuICAgICAgICBtYXRjaEluZGV4ICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9LFxuXG4gICAgaGlnaGxpZ2h0TWF0Y2hlczogZnVuY3Rpb24oZWxlbWVudCwgbWF0Y2hlcywgc3RlbmNpbEVsZW1lbnQpIHtcbiAgICAgIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXh0LCB0ZXh0Tm9kZSwgbGVuZ3RoLCBvZmZzZXQsIGlzRmlyc3RQb3J0aW9uLCBpc0xhc3RQb3J0aW9uLCB3b3JkSWQ7XG4gICAgICB2YXIgY3VycmVudE1hdGNoSW5kZXggPSAwO1xuICAgICAgdmFyIGN1cnJlbnRNYXRjaCA9IG1hdGNoZXNbY3VycmVudE1hdGNoSW5kZXhdO1xuICAgICAgdmFyIHRvdGFsT2Zmc2V0ID0gMDtcbiAgICAgIHZhciBpdGVyYXRvciA9IG5ldyBOb2RlSXRlcmF0b3IoZWxlbWVudCk7XG4gICAgICB2YXIgcG9ydGlvbnMgPSBbXTtcbiAgICAgIHdoaWxlICggKG5leHQgPSBpdGVyYXRvci5nZXROZXh0KCkpICkge1xuXG4gICAgICAgIC8vIEFjY291bnQgZm9yIDxicj4gZWxlbWVudHNcbiAgICAgICAgaWYgKG5leHQubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlICYmIG5leHQuZGF0YSAhPT0gJycpIHtcbiAgICAgICAgICB0ZXh0Tm9kZSA9IG5leHQ7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZWxlbWVudE5vZGUgJiYgbmV4dC5ub2RlTmFtZSA9PT0gJ0JSJykge1xuICAgICAgICAgIHRvdGFsT2Zmc2V0ID0gdG90YWxPZmZzZXQgKyAxO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5vZGVUZXh0ID0gdGV4dE5vZGUuZGF0YTtcbiAgICAgICAgdmFyIG5vZGVFbmRPZmZzZXQgPSB0b3RhbE9mZnNldCArIG5vZGVUZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKGN1cnJlbnRNYXRjaC5zdGFydEluZGV4IDwgbm9kZUVuZE9mZnNldCAmJiB0b3RhbE9mZnNldCA8IGN1cnJlbnRNYXRjaC5lbmRJbmRleCkge1xuXG4gICAgICAgICAgLy8gZ2V0IHBvcnRpb24gcG9zaXRpb24gKGZpc3QsIGxhc3Qgb3IgaW4gdGhlIG1pZGRsZSlcbiAgICAgICAgICBpc0ZpcnN0UG9ydGlvbiA9IGlzTGFzdFBvcnRpb24gPSBmYWxzZTtcbiAgICAgICAgICBpZiAodG90YWxPZmZzZXQgPD0gY3VycmVudE1hdGNoLnN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICAgIGlzRmlyc3RQb3J0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHdvcmRJZCA9IGN1cnJlbnRNYXRjaC5zdGFydEluZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm9kZUVuZE9mZnNldCA+PSBjdXJyZW50TWF0Y2guZW5kSW5kZXgpIHtcbiAgICAgICAgICAgIGlzTGFzdFBvcnRpb24gPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNhbGN1bGF0ZSBvZmZzZXQgYW5kIGxlbmd0aFxuICAgICAgICAgIGlmIChpc0ZpcnN0UG9ydGlvbikge1xuICAgICAgICAgICAgb2Zmc2V0ID0gY3VycmVudE1hdGNoLnN0YXJ0SW5kZXggLSB0b3RhbE9mZnNldDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNMYXN0UG9ydGlvbikge1xuICAgICAgICAgICAgbGVuZ3RoID0gKGN1cnJlbnRNYXRjaC5lbmRJbmRleCAtIHRvdGFsT2Zmc2V0KSAtIG9mZnNldDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuZ3RoID0gbm9kZVRleHQubGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNyZWF0ZSBwb3J0aW9uIG9iamVjdFxuICAgICAgICAgIHZhciBwb3J0aW9uID0ge1xuICAgICAgICAgICAgZWxlbWVudDogdGV4dE5vZGUsXG4gICAgICAgICAgICB0ZXh0OiBub2RlVGV4dC5zdWJzdHJpbmcob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpLFxuICAgICAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICBsZW5ndGg6IGxlbmd0aCxcbiAgICAgICAgICAgIGlzTGFzdFBvcnRpb246IGlzTGFzdFBvcnRpb24sXG4gICAgICAgICAgICB3b3JkSWQ6IHdvcmRJZFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBwb3J0aW9ucy5wdXNoKHBvcnRpb24pO1xuXG4gICAgICAgICAgaWYgKGlzTGFzdFBvcnRpb24pIHtcbiAgICAgICAgICAgIHZhciBsYXN0Tm9kZSA9IHRoaXMud3JhcFdvcmQocG9ydGlvbnMsIHN0ZW5jaWxFbGVtZW50KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yLnJlcGxhY2VDdXJyZW50KGxhc3ROb2RlKTtcblxuICAgICAgICAgICAgLy8gcmVjYWxjdWxhdGUgbm9kZUVuZE9mZnNldCBpZiB3ZSBoYXZlIHRvIHJlcGxhY2UgdGhlIGN1cnJlbnQgbm9kZS5cbiAgICAgICAgICAgIG5vZGVFbmRPZmZzZXQgPSB0b3RhbE9mZnNldCArIHBvcnRpb24ubGVuZ3RoICsgcG9ydGlvbi5vZmZzZXQ7XG5cbiAgICAgICAgICAgIHBvcnRpb25zID0gW107XG4gICAgICAgICAgICBjdXJyZW50TWF0Y2hJbmRleCArPSAxO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRNYXRjaEluZGV4IDwgbWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY3VycmVudE1hdGNoID0gbWF0Y2hlc1tjdXJyZW50TWF0Y2hJbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG90YWxPZmZzZXQgPSBub2RlRW5kT2Zmc2V0O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRSYW5nZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHJhbmdlID0gcmFuZ3kuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgLy8gQHJldHVybiB0aGUgbGFzdCB3cmFwcGVkIGVsZW1lbnRcbiAgICB3cmFwV29yZDogZnVuY3Rpb24ocG9ydGlvbnMsIHN0ZW5jaWxFbGVtZW50KSB7XG4gICAgICB2YXIgZWxlbWVudDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9ydGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBvcnRpb24gPSBwb3J0aW9uc1tpXTtcbiAgICAgICAgZWxlbWVudCA9IHRoaXMud3JhcFBvcnRpb24ocG9ydGlvbiwgc3RlbmNpbEVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9LFxuXG4gICAgd3JhcFBvcnRpb246IGZ1bmN0aW9uKHBvcnRpb24sIHN0ZW5jaWxFbGVtZW50KSB7XG4gICAgICB2YXIgcmFuZ2UgPSByYW5neS5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2V0U3RhcnQocG9ydGlvbi5lbGVtZW50LCBwb3J0aW9uLm9mZnNldCk7XG4gICAgICByYW5nZS5zZXRFbmQocG9ydGlvbi5lbGVtZW50LCBwb3J0aW9uLm9mZnNldCArIHBvcnRpb24ubGVuZ3RoKTtcbiAgICAgIHZhciBub2RlID0gc3RlbmNpbEVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd29yZC1pZCcsIHBvcnRpb24ud29yZElkKTtcbiAgICAgIHJhbmdlLnN1cnJvdW5kQ29udGVudHMobm9kZSk7XG5cbiAgICAgIC8vIEZpeCBhIHdlaXJkIGJlaGF2aW91ciB3aGVyZSBhbiBlbXB0eSB0ZXh0IG5vZGUgaXMgaW5zZXJ0ZWQgYWZ0ZXIgdGhlIHJhbmdlXG4gICAgICBpZiAobm9kZS5uZXh0U2libGluZykge1xuICAgICAgICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGlmIChuZXh0Lm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSAmJiBuZXh0LmRhdGEgPT09ICcnKSB7XG4gICAgICAgICAgbmV4dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5leHQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG5cbiAgICBwcmVwYXJlTWF0Y2g6IGZ1bmN0aW9uIChtYXRjaCwgbWF0Y2hJbmRleCkge1xuICAgICAgLy8gUXVpY2tmaXggZm9yIHRoZSBzcGVsbGNoZWNrIHJlZ2V4IHdoZXJlIHdlIG5lZWQgdG8gbWF0Y2ggdGhlIHNlY29uZCBzdWJncm91cC5cbiAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlTWF0Y2hGb3JTZWNvbmRTdWJncm91cChtYXRjaCwgbWF0Y2hJbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0SW5kZXg6IG1hdGNoLmluZGV4LFxuICAgICAgICBlbmRJbmRleDogbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgsXG4gICAgICAgIG1hdGNoSW5kZXg6IG1hdGNoSW5kZXgsXG4gICAgICAgIHNlYXJjaDogbWF0Y2hbMF1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHByZXBhcmVNYXRjaEZvclNlY29uZFN1Ymdyb3VwOiBmdW5jdGlvbiAobWF0Y2gsIG1hdGNoSW5kZXgpIHtcbiAgICAgIHZhciBpbmRleCA9IG1hdGNoLmluZGV4O1xuICAgICAgaW5kZXggKz0gbWF0Y2hbMV0ubGVuZ3RoO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnRJbmRleDogaW5kZXgsXG4gICAgICAgIGVuZEluZGV4OiBpbmRleCArIG1hdGNoWzJdLmxlbmd0aCxcbiAgICAgICAgbWF0Y2hJbmRleDogbWF0Y2hJbmRleCxcbiAgICAgICAgc2VhcmNoOiBtYXRjaFswXVxuICAgICAgfTtcbiAgICB9XG5cbiAgfTtcbn0pKCk7XG4iLCJ2YXIgYnJvd3NlckZlYXR1cmVzID0gcmVxdWlyZSgnLi9mZWF0dXJlLWRldGVjdGlvbicpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcbnZhciBldmVudGFibGUgPSByZXF1aXJlKCcuL2V2ZW50YWJsZScpO1xuXG4vKipcbiAqIFRoZSBLZXlib2FyZCBtb2R1bGUgZGVmaW5lcyBhbiBldmVudCBBUEkgZm9yIGtleSBldmVudHMuXG4gKi9cbnZhciBLZXlib2FyZCA9IGZ1bmN0aW9uKHNlbGVjdGlvbldhdGNoZXIpIHtcbiAgZXZlbnRhYmxlKHRoaXMpO1xuICB0aGlzLnNlbGVjdGlvbldhdGNoZXIgPSBzZWxlY3Rpb25XYXRjaGVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmRpc3BhdGNoS2V5RXZlbnQgPSBmdW5jdGlvbihldmVudCwgdGFyZ2V0LCBub3RpZnlDaGFyYWN0ZXJFdmVudCkge1xuICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblxuICBjYXNlIHRoaXMua2V5LmxlZnQ6XG4gICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnbGVmdCcsIGV2ZW50KTtcbiAgICBicmVhaztcblxuICBjYXNlIHRoaXMua2V5LnJpZ2h0OlxuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ3JpZ2h0JywgZXZlbnQpO1xuICAgIGJyZWFrO1xuXG4gIGNhc2UgdGhpcy5rZXkudXA6XG4gICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAndXAnLCBldmVudCk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleS5kb3duOlxuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ2Rvd24nLCBldmVudCk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleS50YWI6XG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdzaGlmdFRhYicsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAndGFiJywgZXZlbnQpO1xuICAgIH1cbiAgICBicmVhaztcblxuICBjYXNlIHRoaXMua2V5LmVzYzpcbiAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdlc2MnLCBldmVudCk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleS5iYWNrc3BhY2U6XG4gICAgdGhpcy5wcmV2ZW50Q29udGVudGVkaXRhYmxlQnVnKHRhcmdldCwgZXZlbnQpO1xuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ2JhY2tzcGFjZScsIGV2ZW50KTtcbiAgICBicmVhaztcblxuICBjYXNlIHRoaXMua2V5WydkZWxldGUnXTpcbiAgICB0aGlzLnByZXZlbnRDb250ZW50ZWRpdGFibGVCdWcodGFyZ2V0LCBldmVudCk7XG4gICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnZGVsZXRlJywgZXZlbnQpO1xuICAgIGJyZWFrO1xuXG4gIGNhc2UgdGhpcy5rZXkuZW50ZXI6XG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdzaGlmdEVudGVyJywgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdlbnRlcicsIGV2ZW50KTtcbiAgICB9XG4gICAgYnJlYWs7XG4gIGNhc2UgdGhpcy5rZXkuY3RybDpcbiAgY2FzZSB0aGlzLmtleS5zaGlmdDpcbiAgY2FzZSB0aGlzLmtleS5hbHQ6XG4gICAgYnJlYWs7XG4gIC8vIE1ldGFrZXlcbiAgY2FzZSAyMjQ6IC8vIEZpcmVmb3g6IDIyNFxuICBjYXNlIDE3OiAvLyBPcGVyYTogMTdcbiAgY2FzZSA5MTogLy8gQ2hyb21lL1NhZmFyaTogOTEgKExlZnQpXG4gIGNhc2UgOTM6IC8vIENocm9tZS9TYWZhcmk6IDkzIChSaWdodClcbiAgICBicmVhaztcbiAgZGVmYXVsdDpcbiAgICB0aGlzLnByZXZlbnRDb250ZW50ZWRpdGFibGVCdWcodGFyZ2V0LCBldmVudCk7XG4gICAgaWYgKG5vdGlmeUNoYXJhY3RlckV2ZW50KSB7XG4gICAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdjaGFyYWN0ZXInLCBldmVudCk7XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucHJldmVudENvbnRlbnRlZGl0YWJsZUJ1ZyA9IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnQpIHtcbiAgaWYgKGJyb3dzZXJGZWF0dXJlcy5jb250ZW50ZWRpdGFibGVTcGFuQnVnKSB7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkgcmV0dXJuO1xuXG4gICAgdmFyIHJhbmdlID0gdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmdldEZyZXNoUmFuZ2UoKTtcbiAgICBpZiAocmFuZ2UuaXNTZWxlY3Rpb24pIHtcbiAgICAgIHZhciBub2RlVG9DaGVjaywgcmFuZ3lSYW5nZSA9IHJhbmdlLnJhbmdlO1xuXG4gICAgICAvLyBXZWJraXRzIGNvbnRlbnRlZGl0YWJsZSBpbnNlcnRzIHNwYW5zIHdoZW4gdGhlcmUgaXMgYVxuICAgICAgLy8gc3R5bGVkIG5vZGUgdGhhdCBzdGFydHMganVzdCBvdXRzaWRlIG9mIHRoZSBzZWxlY3Rpb24gYW5kXG4gICAgICAvLyBpcyBjb250YWluZWQgaW4gdGhlIHNlbGVjdGlvbiBhbmQgZm9sbG93ZWQgYnkgb3RoZXIgdGV4dE5vZGVzLlxuICAgICAgLy8gU28gZmlyc3Qgd2UgY2hlY2sgaWYgd2UgaGF2ZSBhIG5vZGUganVzdCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZVxuICAgICAgLy8gc2VsZWN0aW9uLiBBbmQgaWYgc28gd2UgZGVsZXRlIGl0IGJlZm9yZSBDaHJvbWUgY2FuIGRvIGl0cyBtYWdpYy5cbiAgICAgIGlmIChyYW5neVJhbmdlLnN0YXJ0T2Zmc2V0ID09PSAwKSB7XG4gICAgICAgIGlmIChyYW5neVJhbmdlLnN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSkge1xuICAgICAgICAgIG5vZGVUb0NoZWNrID0gcmFuZ3lSYW5nZS5zdGFydENvbnRhaW5lci5wYXJlbnROb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKHJhbmd5UmFuZ2Uuc3RhcnRDb250YWluZXIubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlKSB7XG4gICAgICAgICAgbm9kZVRvQ2hlY2sgPSByYW5neVJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlVG9DaGVjayAmJiBub2RlVG9DaGVjayAhPT0gdGFyZ2V0ICYmIHJhbmd5UmFuZ2UuY29udGFpbnNOb2RlKG5vZGVUb0NoZWNrLCB0cnVlKSkge1xuICAgICAgICBub2RlVG9DaGVjay5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5rZXkgPSB7XG4gIGxlZnQ6IDM3LFxuICB1cDogMzgsXG4gIHJpZ2h0OiAzOSxcbiAgZG93bjogNDAsXG4gIHRhYjogOSxcbiAgZXNjOiAyNyxcbiAgYmFja3NwYWNlOiA4LFxuICAnZGVsZXRlJzogNDYsXG4gIGVudGVyOiAxMyxcbiAgc2hpZnQ6IDE2LFxuICBjdHJsOiAxNyxcbiAgYWx0OiAxOFxufTtcblxuS2V5Ym9hcmQua2V5ID0gS2V5Ym9hcmQucHJvdG90eXBlLmtleTtcbiIsInZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG5cbi8vIEEgRE9NIG5vZGUgaXRlcmF0b3IuXG4vL1xuLy8gSGFzIHRoZSBhYmlsaXR5IHRvIHJlcGxhY2Ugbm9kZXMgb24gdGhlIGZseSBhbmQgY29udGludWVcbi8vIHRoZSBpdGVyYXRpb24uXG52YXIgTm9kZUl0ZXJhdG9yO1xubW9kdWxlLmV4cG9ydHMgPSBOb2RlSXRlcmF0b3IgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIE5vZGVJdGVyYXRvciA9IGZ1bmN0aW9uKHJvb3QpIHtcbiAgICB0aGlzLnJvb3QgPSByb290O1xuICAgIHRoaXMuY3VycmVudCA9IHRoaXMubmV4dCA9IHRoaXMucm9vdDtcbiAgfTtcblxuICBOb2RlSXRlcmF0b3IucHJvdG90eXBlLmdldE5leHRUZXh0Tm9kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuZXh0O1xuICAgIHdoaWxlICggKG5leHQgPSB0aGlzLmdldE5leHQoKSkgKSB7XG4gICAgICBpZiAobmV4dC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUgJiYgbmV4dC5kYXRhICE9PSAnJykge1xuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgTm9kZUl0ZXJhdG9yLnByb3RvdHlwZS5nZXROZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoaWxkLCBuO1xuICAgIG4gPSB0aGlzLmN1cnJlbnQgPSB0aGlzLm5leHQ7XG4gICAgY2hpbGQgPSB0aGlzLm5leHQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMuY3VycmVudCkge1xuICAgICAgY2hpbGQgPSBuLmZpcnN0Q2hpbGQ7XG5cbiAgICAgIC8vIFNraXAgdGhlIGNoaWxkcmVuIG9mIGVsZW1lbnRzIHdpdGggdGhlIGF0dHJpYnV0ZSBkYXRhLWVkaXRhYmxlPVwicmVtb3ZlXCJcbiAgICAgIC8vIFRoaXMgcHJldmVudHMgdGV4dCBub2RlcyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgY29udGVudCB0byBiZSBpbmNsdWRlZC5cbiAgICAgIGlmIChjaGlsZCAmJiBuLmdldEF0dHJpYnV0ZSgnZGF0YS1lZGl0YWJsZScpICE9PSAncmVtb3ZlJykge1xuICAgICAgICB0aGlzLm5leHQgPSBjaGlsZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlICgobiAhPT0gdGhpcy5yb290KSAmJiAhKHRoaXMubmV4dCA9IG4ubmV4dFNpYmxpbmcpKSB7XG4gICAgICAgICAgbiA9IG4ucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xuICB9O1xuXG4gIE5vZGVJdGVyYXRvci5wcm90b3R5cGUucmVwbGFjZUN1cnJlbnQgPSBmdW5jdGlvbihyZXBsYWNlbWVudCkge1xuICAgIHRoaXMuY3VycmVudCA9IHJlcGxhY2VtZW50O1xuICAgIHRoaXMubmV4dCA9IHVuZGVmaW5lZDtcbiAgICB2YXIgbiA9IHRoaXMuY3VycmVudDtcbiAgICB3aGlsZSAoKG4gIT09IHRoaXMucm9vdCkgJiYgISh0aGlzLm5leHQgPSBuLm5leHRTaWJsaW5nKSkge1xuICAgICAgbiA9IG4ucGFyZW50Tm9kZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE5vZGVJdGVyYXRvcjtcbn0pKCk7XG4iLCIvLyBET00gbm9kZSB0eXBlc1xuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUubm9kZVR5cGVcbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbGVtZW50Tm9kZTogMSxcbiAgYXR0cmlidXRlTm9kZTogMixcbiAgdGV4dE5vZGU6IDMsXG4gIGNkYXRhU2VjdGlvbk5vZGU6IDQsXG4gIGVudGl0eVJlZmVyZW5jZU5vZGU6IDUsXG4gIGVudGl0eU5vZGU6IDYsXG4gIHByb2Nlc3NpbmdJbnN0cnVjdGlvbk5vZGU6IDcsXG4gIGNvbW1lbnROb2RlOiA4LFxuICBkb2N1bWVudE5vZGU6IDksXG4gIGRvY3VtZW50VHlwZU5vZGU6IDEwLFxuICBkb2N1bWVudEZyYWdtZW50Tm9kZTogMTEsXG4gIG5vdGF0aW9uTm9kZTogMTJcbn07XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi91dGlsL3N0cmluZycpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG4vKipcbiAqIFRoZSBwYXJzZXIgbW9kdWxlIHByb3ZpZGVzIGhlbHBlciBtZXRob2RzIHRvIHBhcnNlIGh0bWwtY2h1bmtzXG4gKiBtYW5pcHVsYXRpb25zIGFuZCBoZWxwZXJzIGZvciBjb21tb24gdGFza3MuXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKiBAc3VibW9kdWxlIHBhcnNlclxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAvKipcbiAgICogU2luZ2xldG9uIHRoYXQgcHJvdmlkZXMgRE9NIGxvb2t1cCBoZWxwZXJzLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICByZXR1cm4ge1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBlZGl0YWJsZUpTIGhvc3QgYmxvY2sgb2YgYSBub2RlLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRIb3N0XG4gICAgICogQHBhcmFtIHtET00gTm9kZX1cbiAgICAgKiBAcmV0dXJuIHtET00gTm9kZX1cbiAgICAgKi9cbiAgICBnZXRIb3N0OiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgZWRpdGFibGVTZWxlY3RvciA9ICcuJyArIGNvbmZpZy5lZGl0YWJsZUNsYXNzO1xuICAgICAgdmFyIGhvc3ROb2RlID0gJChub2RlKS5jbG9zZXN0KGVkaXRhYmxlU2VsZWN0b3IpO1xuICAgICAgcmV0dXJuIGhvc3ROb2RlLmxlbmd0aCA/IGhvc3ROb2RlWzBdIDogdW5kZWZpbmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGluZGV4IG9mIGEgbm9kZS5cbiAgICAgKiBTbyB0aGF0IHBhcmVudC5jaGlsZE5vZGVzWyBnZXRJbmRleChub2RlKSBdIHdvdWxkIHJldHVybiB0aGUgbm9kZSBhZ2FpblxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXROb2RlSW5kZXhcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIGdldE5vZGVJbmRleDogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgIHdoaWxlICgobm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nKSAhPT0gbnVsbCkge1xuICAgICAgICBpbmRleCArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBub2RlIGNvbnRhaW5zIHRleHQgb3IgZWxlbWVudCBub2Rlc1xuICAgICAqIHdoaXRlc3BhY2UgY291bnRzIHRvbyFcbiAgICAgKlxuICAgICAqIEBtZXRob2QgaXNWb2lkXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBpc1ZvaWQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciBjaGlsZCwgaSwgbGVuO1xuICAgICAgdmFyIGNoaWxkTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG5cbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGNoaWxkTm9kZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2hpbGQgPSBjaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUgJiYgIXRoaXMuaXNWb2lkVGV4dE5vZGUoY2hpbGQpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG5vZGUgaXMgYSB0ZXh0IG5vZGUgYW5kIGNvbXBsZXRlbHkgZW1wdHkgd2l0aG91dCBhbnkgd2hpdGVzcGFjZVxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc1ZvaWRUZXh0Tm9kZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgaXNWb2lkVGV4dE5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSAmJiAhbm9kZS5ub2RlVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG5vZGUgaXMgYSB0ZXh0IG5vZGUgYW5kIGNvbnRhaW5zIG5vdGhpbmcgYnV0IHdoaXRlc3BhY2VcbiAgICAgKlxuICAgICAqIEBtZXRob2QgaXNXaGl0ZXNwYWNlT25seVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgaXNXaGl0ZXNwYWNlT25seTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlICYmIHRoaXMubGFzdE9mZnNldFdpdGhDb250ZW50KG5vZGUpID09PSAwO1xuICAgIH0sXG5cbiAgICBpc0xpbmVicmVhazogZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlICYmIG5vZGUudGFnTmFtZSA9PT0gJ0JSJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGFzdCBvZmZzZXQgd2hlcmUgdGhlIGN1cnNvciBjYW4gYmUgcG9zaXRpb25lZCB0b1xuICAgICAqIGJlIGF0IHRoZSB2aXNpYmxlIGVuZCBvZiBpdHMgY29udGFpbmVyLlxuICAgICAqIEN1cnJlbnRseSB3b3JrcyBvbmx5IGZvciBlbXB0eSB0ZXh0IG5vZGVzIChub3QgZW1wdHkgdGFncylcbiAgICAgKlxuICAgICAqIEBtZXRob2QgaXNXaGl0ZXNwYWNlT25seVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgbGFzdE9mZnNldFdpdGhDb250ZW50OiBmdW5jdGlvbihub2RlKSB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy50cmltUmlnaHQobm9kZS5ub2RlVmFsdWUpLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcblxuICAgICAgICBmb3IgKGkgPSBjaGlsZE5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgbm9kZSA9IGNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgaWYgKHRoaXMuaXNXaGl0ZXNwYWNlT25seShub2RlKSB8fCB0aGlzLmlzTGluZWJyZWFrKG5vZGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIG9mZnNldCBzdGFydHMgYXQgMCBiZWZvcmUgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICAgIC8vIGFuZCBlbmRzIHdpdGggdGhlIGxlbmd0aCBhZnRlciB0aGUgbGFzdCBlbGVtZW50LlxuICAgICAgICAgICAgcmV0dXJuIGkgKyAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXNCZWdpbm5pbmdPZkhvc3Q6IGZ1bmN0aW9uKGhvc3QsIGNvbnRhaW5lciwgb2Zmc2V0KSB7XG4gICAgICBpZiAoY29udGFpbmVyID09PSBob3N0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzU3RhcnRPZmZzZXQoY29udGFpbmVyLCBvZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1N0YXJ0T2Zmc2V0KGNvbnRhaW5lciwgb2Zmc2V0KSkge1xuICAgICAgICB2YXIgcGFyZW50Q29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IHNpbXVsYXRlcyBhIHJhbmdlIG9mZnNldFxuICAgICAgICAvLyByaWdodCBiZWZvcmUgdGhlIGVsZW1lbnQuXG4gICAgICAgIHZhciBvZmZzZXRJblBhcmVudCA9IHRoaXMuZ2V0Tm9kZUluZGV4KGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmVnaW5uaW5nT2ZIb3N0KGhvc3QsIHBhcmVudENvbnRhaW5lciwgb2Zmc2V0SW5QYXJlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc0VuZE9mSG9zdDogZnVuY3Rpb24oaG9zdCwgY29udGFpbmVyLCBvZmZzZXQpIHtcbiAgICAgIGlmIChjb250YWluZXIgPT09IGhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNFbmRPZmZzZXQoY29udGFpbmVyLCBvZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc0VuZE9mZnNldChjb250YWluZXIsIG9mZnNldCkpIHtcbiAgICAgICAgdmFyIHBhcmVudENvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBwbHVzIG9uZSBzaW11bGF0ZXMgYSByYW5nZSBvZmZzZXRcbiAgICAgICAgLy8gcmlnaHQgYWZ0ZXIgdGhlIGVsZW1lbnQuXG4gICAgICAgIHZhciBvZmZzZXRJblBhcmVudCA9IHRoaXMuZ2V0Tm9kZUluZGV4KGNvbnRhaW5lcikgKyAxO1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VuZE9mSG9zdChob3N0LCBwYXJlbnRDb250YWluZXIsIG9mZnNldEluUGFyZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXNTdGFydE9mZnNldDogZnVuY3Rpb24oY29udGFpbmVyLCBvZmZzZXQpIHtcbiAgICAgIGlmIChjb250YWluZXIubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgIHJldHVybiBvZmZzZXQgPT09IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29udGFpbmVyLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5jaGlsZE5vZGVzW29mZnNldF0gPT09IGNvbnRhaW5lci5maXJzdENoaWxkO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc0VuZE9mZnNldDogZnVuY3Rpb24oY29udGFpbmVyLCBvZmZzZXQpIHtcbiAgICAgIGlmIChjb250YWluZXIubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgIHJldHVybiBvZmZzZXQgPT09IGNvbnRhaW5lci5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29udGFpbmVyLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlIGlmIChvZmZzZXQgPiAwKVxuICAgICAgICAgIHJldHVybiBjb250YWluZXIuY2hpbGROb2Rlc1tvZmZzZXQgLSAxXSA9PT0gY29udGFpbmVyLmxhc3RDaGlsZDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXNUZXh0RW5kT2ZIb3N0OiBmdW5jdGlvbihob3N0LCBjb250YWluZXIsIG9mZnNldCkge1xuICAgICAgaWYgKGNvbnRhaW5lciA9PT0gaG9zdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1RleHRFbmRPZmZzZXQoY29udGFpbmVyLCBvZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1RleHRFbmRPZmZzZXQoY29udGFpbmVyLCBvZmZzZXQpKSB7XG4gICAgICAgIHZhciBwYXJlbnRDb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgcGx1cyBvbmUgc2ltdWxhdGVzIGEgcmFuZ2Ugb2Zmc2V0XG4gICAgICAgIC8vIHJpZ2h0IGFmdGVyIHRoZSBlbGVtZW50LlxuICAgICAgICB2YXIgb2Zmc2V0SW5QYXJlbnQgPSB0aGlzLmdldE5vZGVJbmRleChjb250YWluZXIpICsgMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNUZXh0RW5kT2ZIb3N0KGhvc3QsIHBhcmVudENvbnRhaW5lciwgb2Zmc2V0SW5QYXJlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc1RleHRFbmRPZmZzZXQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgb2Zmc2V0KSB7XG4gICAgICBpZiAoY29udGFpbmVyLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSkge1xuICAgICAgICB2YXIgdGV4dCA9IHN0cmluZy50cmltUmlnaHQoY29udGFpbmVyLm5vZGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBvZmZzZXQgPj0gdGV4dC5sZW5ndGg7XG4gICAgICB9IGVsc2UgaWYgKGNvbnRhaW5lci5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsYXN0T2Zmc2V0ID0gdGhpcy5sYXN0T2Zmc2V0V2l0aENvbnRlbnQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA+PSBsYXN0T2Zmc2V0O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc1NhbWVOb2RlOiBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSkge1xuICAgICAgdmFyIGksIGxlbiwgYXR0cjtcblxuICAgICAgaWYgKHRhcmdldC5ub2RlVHlwZSAhPT0gc291cmNlLm5vZGVUeXBlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgIT09IHNvdXJjZS5ub2RlTmFtZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSB0YXJnZXQuYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBsZW47IGkrKynCoHtcbiAgICAgICAgYXR0ciA9IHRhcmdldC5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoc291cmNlLmdldEF0dHJpYnV0ZShhdHRyLm5hbWUpICE9PSBhdHRyLnZhbHVlKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZGVlcGVzdCBsYXN0IGNoaWxkIG9mIGEgbm9kZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgIGxhdGVzdENoaWxkXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIHRvIGl0ZXJhdGUgb24uXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9ICAgICAgICAgICBUSGUgZGVlcGVzdCBsYXN0IGNoaWxkIGluIHRoZSBjb250YWluZXIuXG4gICAgICovXG4gICAgbGF0ZXN0Q2hpbGQ6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgaWYgKGNvbnRhaW5lci5sYXN0Q2hpbGQpXG4gICAgICAgIHJldHVybiB0aGlzLmxhdGVzdENoaWxkKGNvbnRhaW5lci5sYXN0Q2hpbGQpO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSBkb2N1bWVudEZyYWdtZW50IGhhcyBubyBjaGlsZHJlbi5cbiAgICAgKiBGcmFnbWVudHMgd2l0aG91dCBjaGlsZHJlbiBjYW4gY2F1c2UgZXJyb3JzIGlmIGluc2VydGVkIGludG8gcmFuZ2VzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCAgaXNEb2N1bWVudEZyYWdtZW50V2l0aG91dENoaWxkcmVuXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IERPTSBub2RlLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNEb2N1bWVudEZyYWdtZW50V2l0aG91dENoaWxkcmVuOiBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgaWYgKGZyYWdtZW50ICYmXG4gICAgICAgICAgZnJhZ21lbnQubm9kZVR5cGUgPT09IG5vZGVUeXBlLmRvY3VtZW50RnJhZ21lbnROb2RlICYmXG4gICAgICAgICAgZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZSBpZiBhbiBlbGVtZW50IGJlaGF2ZXMgbGlrZSBhbiBpbmxpbmUgZWxlbWVudC5cbiAgICAgKi9cbiAgICBpc0lubGluZUVsZW1lbnQ6IGZ1bmN0aW9uKHdpbmRvdywgZWxlbWVudCkge1xuICAgICAgdmFyIHN0eWxlcyA9IGVsZW1lbnQuY3VycmVudFN0eWxlIHx8IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsICcnKTtcbiAgICAgIHZhciBkaXNwbGF5ID0gc3R5bGVzLmRpc3BsYXk7XG4gICAgICBzd2l0Y2ggKGRpc3BsYXkpIHtcbiAgICAgIGNhc2UgJ2lubGluZSc6XG4gICAgICBjYXNlICdpbmxpbmUtYmxvY2snOlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KSgpO1xuIiwidmFyIEN1cnNvciA9IHJlcXVpcmUoJy4vY3Vyc29yJyk7XG52YXIgU2VsZWN0aW9uID0gcmVxdWlyZSgnLi9zZWxlY3Rpb24nKTtcblxuLyoqIFJhbmdlQ29udGFpbmVyXG4gKlxuICogcHJpbWFyaWx5IHVzZWQgdG8gY29tcGFyZSByYW5nZXNcbiAqIGl0cyBkZXNpZ25lZCB0byB3b3JrIHdpdGggdW5kZWZpbmVkIHJhbmdlcyBhcyB3ZWxsXG4gKiBzbyB3ZSBjYW4gZWFzaWx5IGNvbXBhcmUgdGhlbSB3aXRob3V0IGNoZWNraW5nIGZvciB1bmRlZmluZWRcbiAqIGFsbCB0aGUgdGltZVxuICovXG52YXIgUmFuZ2VDb250YWluZXI7XG5tb2R1bGUuZXhwb3J0cyA9IFJhbmdlQ29udGFpbmVyID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0LCByYW5neVJhbmdlKSB7XG4gIHRoaXMuaG9zdCA9IGVkaXRhYmxlSG9zdCAmJiBlZGl0YWJsZUhvc3QuanF1ZXJ5ID9cbiAgICBlZGl0YWJsZUhvc3RbMF0gOlxuICAgIGVkaXRhYmxlSG9zdDtcbiAgdGhpcy5yYW5nZSA9IHJhbmd5UmFuZ2U7XG4gIHRoaXMuaXNBbnl0aGluZ1NlbGVjdGVkID0gKHJhbmd5UmFuZ2UgIT09IHVuZGVmaW5lZCk7XG4gIHRoaXMuaXNDdXJzb3IgPSAodGhpcy5pc0FueXRoaW5nU2VsZWN0ZWQgJiYgcmFuZ3lSYW5nZS5jb2xsYXBzZWQpO1xuICB0aGlzLmlzU2VsZWN0aW9uID0gKHRoaXMuaXNBbnl0aGluZ1NlbGVjdGVkICYmICF0aGlzLmlzQ3Vyc29yKTtcbn07XG5cblJhbmdlQ29udGFpbmVyLnByb3RvdHlwZS5nZXRDdXJzb3IgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuaXNDdXJzb3IpIHtcbiAgICByZXR1cm4gbmV3IEN1cnNvcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UpO1xuICB9XG59O1xuXG5SYW5nZUNvbnRhaW5lci5wcm90b3R5cGUuZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmlzU2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5ob3N0LCB0aGlzLnJhbmdlKTtcbiAgfVxufTtcblxuUmFuZ2VDb250YWluZXIucHJvdG90eXBlLmZvcmNlQ3Vyc29yID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmlzU2VsZWN0aW9uKSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5kZWxldGVDb250ZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3Vyc29yKCk7XG4gIH1cbn07XG5cblJhbmdlQ29udGFpbmVyLnByb3RvdHlwZS5pc0RpZmZlcmVudEZyb20gPSBmdW5jdGlvbihvdGhlclJhbmdlQ29udGFpbmVyKSB7XG4gIG90aGVyUmFuZ2VDb250YWluZXIgPSBvdGhlclJhbmdlQ29udGFpbmVyIHx8IG5ldyBSYW5nZUNvbnRhaW5lcigpO1xuICB2YXIgc2VsZiA9IHRoaXMucmFuZ2U7XG4gIHZhciBvdGhlciA9IG90aGVyUmFuZ2VDb250YWluZXIucmFuZ2U7XG4gIGlmIChzZWxmICYmIG90aGVyKSB7XG4gICAgcmV0dXJuICFzZWxmLmVxdWFscyhvdGhlcik7XG4gIH0gZWxzZSBpZiAoIXNlbGYgJiYgIW90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG4iLCJ2YXIgcmFuZ3kgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1sncmFuZ3knXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3Jhbmd5J10gOiBudWxsKTtcbnZhciBlcnJvciA9IHJlcXVpcmUoJy4vdXRpbC9lcnJvcicpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcblxuLyoqXG4gKiBJbnNwaXJlZCBieSB0aGUgU2VsZWN0aW9uIHNhdmUgYW5kIHJlc3RvcmUgbW9kdWxlIGZvciBSYW5neSBieSBUaW0gRG93blxuICogU2F2ZXMgYW5kIHJlc3RvcmVzIHJhbmdlcyB1c2luZyBpbnZpc2libGUgbWFya2VyIGVsZW1lbnRzIGluIHRoZSBET00uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgYm91bmRhcnlNYXJrZXJJZCA9IDA7XG5cbiAgLy8gKFUrRkVGRikgemVybyB3aWR0aCBuby1icmVhayBzcGFjZVxuICB2YXIgbWFya2VyVGV4dENoYXIgPSAnXFx1ZmVmZic7XG5cbiAgdmFyIGdldE1hcmtlciA9IGZ1bmN0aW9uKGhvc3QsIGlkKSB7XG4gICAgcmV0dXJuIGhvc3QucXVlcnlTZWxlY3RvcignIycrIGlkKTtcbiAgfTtcblxuICByZXR1cm4ge1xuXG4gICAgaW5zZXJ0UmFuZ2VCb3VuZGFyeU1hcmtlcjogZnVuY3Rpb24ocmFuZ2UsIGF0U3RhcnQpIHtcbiAgICAgIHZhciBtYXJrZXJJZCA9ICdlZGl0YWJsZS1yYW5nZS1ib3VuZGFyeS0nICsgKGJvdW5kYXJ5TWFya2VySWQgKz0gMSk7XG4gICAgICB2YXIgbWFya2VyRWw7XG4gICAgICB2YXIgY29udGFpbmVyID0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG5cbiAgICAgIC8vIElmIG93bmVyRG9jdW1lbnQgaXMgbnVsbCB0aGUgY29tbW9uQW5jZXN0b3JDb250YWluZXIgaXMgd2luZG93LmRvY3VtZW50XG4gICAgICBpZiAoY29udGFpbmVyLm93bmVyRG9jdW1lbnQgPT09IG51bGwgfHwgY29udGFpbmVyLm93bmVyRG9jdW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlcnJvcignQ2Fubm90IHNhdmUgcmFuZ2U6IHJhbmdlIGlzIGVtdHB5Jyk7XG4gICAgICB9XG4gICAgICB2YXIgZG9jID0gY29udGFpbmVyLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuZG9jdW1lbnQ7XG5cbiAgICAgIC8vIENsb25lIHRoZSBSYW5nZSBhbmQgY29sbGFwc2UgdG8gdGhlIGFwcHJvcHJpYXRlIGJvdW5kYXJ5IHBvaW50XG4gICAgICB2YXIgYm91bmRhcnlSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgIGJvdW5kYXJ5UmFuZ2UuY29sbGFwc2UoYXRTdGFydCk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgbWFya2VyIGVsZW1lbnQgY29udGFpbmluZyBhIHNpbmdsZSBpbnZpc2libGUgY2hhcmFjdGVyIHVzaW5nIERPTSBtZXRob2RzIGFuZCBpbnNlcnQgaXRcbiAgICAgIG1hcmtlckVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIG1hcmtlckVsLmlkID0gbWFya2VySWQ7XG4gICAgICBtYXJrZXJFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtZWRpdGFibGUnLCAncmVtb3ZlJyk7XG4gICAgICBtYXJrZXJFbC5zdHlsZS5saW5lSGVpZ2h0ID0gJzAnO1xuICAgICAgbWFya2VyRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIG1hcmtlckVsLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShtYXJrZXJUZXh0Q2hhcikpO1xuXG4gICAgICBib3VuZGFyeVJhbmdlLmluc2VydE5vZGUobWFya2VyRWwpO1xuICAgICAgcmV0dXJuIG1hcmtlckVsO1xuICAgIH0sXG5cbiAgICBzZXRSYW5nZUJvdW5kYXJ5OiBmdW5jdGlvbihob3N0LCByYW5nZSwgbWFya2VySWQsIGF0U3RhcnQpIHtcbiAgICAgIHZhciBtYXJrZXJFbCA9IGdldE1hcmtlcihob3N0LCBtYXJrZXJJZCk7XG4gICAgICBpZiAobWFya2VyRWwpIHtcbiAgICAgICAgcmFuZ2VbYXRTdGFydCA/ICdzZXRTdGFydEJlZm9yZScgOiAnc2V0RW5kQmVmb3JlJ10obWFya2VyRWwpO1xuICAgICAgICBtYXJrZXJFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hcmtlckVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNYXJrZXIgZWxlbWVudCBoYXMgYmVlbiByZW1vdmVkLiBDYW5ub3QgcmVzdG9yZSBzZWxlY3Rpb24uJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNhdmU6IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICB2YXIgcmFuZ2VJbmZvLCBzdGFydEVsLCBlbmRFbDtcblxuICAgICAgLy8gaW5zZXJ0IG1hcmtlcnNcbiAgICAgIGlmIChyYW5nZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgZW5kRWwgPSB0aGlzLmluc2VydFJhbmdlQm91bmRhcnlNYXJrZXIocmFuZ2UsIGZhbHNlKTtcbiAgICAgICAgcmFuZ2VJbmZvID0ge1xuICAgICAgICAgIG1hcmtlcklkOiBlbmRFbC5pZCxcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZEVsID0gdGhpcy5pbnNlcnRSYW5nZUJvdW5kYXJ5TWFya2VyKHJhbmdlLCBmYWxzZSk7XG4gICAgICAgIHN0YXJ0RWwgPSB0aGlzLmluc2VydFJhbmdlQm91bmRhcnlNYXJrZXIocmFuZ2UsIHRydWUpO1xuXG4gICAgICAgIHJhbmdlSW5mbyA9IHtcbiAgICAgICAgICBzdGFydE1hcmtlcklkOiBzdGFydEVsLmlkLFxuICAgICAgICAgIGVuZE1hcmtlcklkOiBlbmRFbC5pZCxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEFkanVzdCBlYWNoIHJhbmdlJ3MgYm91bmRhcmllcyB0byBsaWUgYmV0d2VlbiBpdHMgbWFya2Vyc1xuICAgICAgaWYgKHJhbmdlLmNvbGxhcHNlZCkge1xuICAgICAgICByYW5nZS5jb2xsYXBzZUJlZm9yZShlbmRFbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZS5zZXRFbmRCZWZvcmUoZW5kRWwpO1xuICAgICAgICByYW5nZS5zZXRTdGFydEFmdGVyKHN0YXJ0RWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmFuZ2VJbmZvO1xuICAgIH0sXG5cbiAgICByZXN0b3JlOiBmdW5jdGlvbihob3N0LCByYW5nZUluZm8pIHtcbiAgICAgIGlmIChyYW5nZUluZm8ucmVzdG9yZWQpIHJldHVybjtcblxuICAgICAgdmFyIHJhbmdlID0gcmFuZ3kuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIGlmIChyYW5nZUluZm8uY29sbGFwc2VkKSB7XG4gICAgICAgIHZhciBtYXJrZXJFbCA9IGdldE1hcmtlcihob3N0LCByYW5nZUluZm8ubWFya2VySWQpO1xuICAgICAgICBpZiAobWFya2VyRWwpIHtcbiAgICAgICAgICBtYXJrZXJFbC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gICAgICAgICAgdmFyIHByZXZpb3VzTm9kZSA9IG1hcmtlckVsLnByZXZpb3VzU2libGluZztcblxuICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIHJhbmd5IGlzc3VlIDE3XG4gICAgICAgICAgaWYgKHByZXZpb3VzTm9kZSAmJiBwcmV2aW91c05vZGUubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgICAgICBtYXJrZXJFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hcmtlckVsKTtcbiAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlVG9Qb2ludChwcmV2aW91c05vZGUsIHByZXZpb3VzTm9kZS5sZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZS5jb2xsYXBzZUJlZm9yZShtYXJrZXJFbCk7XG4gICAgICAgICAgICBtYXJrZXJFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hcmtlckVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ01hcmtlciBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWQuIENhbm5vdCByZXN0b3JlIHNlbGVjdGlvbi4nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRSYW5nZUJvdW5kYXJ5KGhvc3QsIHJhbmdlLCByYW5nZUluZm8uc3RhcnRNYXJrZXJJZCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc2V0UmFuZ2VCb3VuZGFyeShob3N0LCByYW5nZSwgcmFuZ2VJbmZvLmVuZE1hcmtlcklkLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJhbmdlLm5vcm1hbGl6ZUJvdW5kYXJpZXMoKTtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9XG4gIH07XG59KSgpO1xuIiwidmFyIHJhbmd5ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3Jhbmd5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydyYW5neSddIDogbnVsbCk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBSYW5nZUNvbnRhaW5lciA9IHJlcXVpcmUoJy4vcmFuZ2UtY29udGFpbmVyJyk7XG52YXIgQ3Vyc29yID0gcmVxdWlyZSgnLi9jdXJzb3InKTtcbnZhciBTZWxlY3Rpb24gPSByZXF1aXJlKCcuL3NlbGVjdGlvbicpO1xuXG4vKipcbiAqIFRoZSBTZWxlY3Rpb25XYXRjaGVyIG1vZHVsZSB3YXRjaGVzIGZvciBzZWxlY3Rpb24gY2hhbmdlcyBpbnNpZGVcbiAqIG9mIGVkaXRhYmxlIGJsb2Nrcy5cbiAqXG4gKiBAbW9kdWxlIGNvcmVcbiAqIEBzdWJtb2R1bGUgc2VsZWN0aW9uV2F0Y2hlclxuICovXG5cbnZhciBTZWxlY3Rpb25XYXRjaGVyO1xubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25XYXRjaGVyID0gZnVuY3Rpb24oZGlzcGF0Y2hlciwgd2luKSB7XG4gIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gIHRoaXMud2luID0gd2luIHx8IHdpbmRvdztcbiAgdGhpcy5yYW5neVNlbGVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gdW5kZWZpbmVkO1xuICB0aGlzLmN1cnJlbnRSYW5nZSA9IHVuZGVmaW5lZDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm4gYSBSYW5nZUNvbnRhaW5lciBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgd2l0aGluIGFuIGVkaXRhYmxlXG4gKiBvdGhlcndpc2UgcmV0dXJuIGFuIGVtcHR5IFJhbmdlQ29udGFpbmVyXG4gKi9cblNlbGVjdGlvbldhdGNoZXIucHJvdG90eXBlLmdldFJhbmdlQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmFuZ3lTZWxlY3Rpb24gPSByYW5neS5nZXRTZWxlY3Rpb24odGhpcy53aW4pO1xuXG4gIC8vIHJhbmdlQ291bnQgaXMgMCBvciAxIGluIGFsbCBicm93c2VycyBleGNlcHQgZmlyZWZveFxuICAvLyBmaXJlZm94IGNhbiB3b3JrIHdpdGggbXVsdGlwbGUgcmFuZ2VzXG4gIC8vIChvbiBhIG1hYyBob2xkIGRvd24gdGhlIGNvbW1hbmQga2V5IHRvIHNlbGVjdCBtdWx0aXBsZSByYW5nZXMpXG4gIGlmICh0aGlzLnJhbmd5U2VsZWN0aW9uLnJhbmdlQ291bnQpIHtcbiAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmd5U2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG4gICAgdmFyIGhvc3ROb2RlID0gcGFyc2VyLmdldEhvc3QocmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuICAgIGlmIChob3N0Tm9kZSkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZUNvbnRhaW5lcihob3N0Tm9kZSwgcmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiBhbiBlbXB0eSByYW5nZSBjb250YWluZXJcbiAgcmV0dXJuIG5ldyBSYW5nZUNvbnRhaW5lcigpO1xufTtcblxuXG4vKipcbiAqIEdldHMgYSBmcmVzaCBSYW5nZUNvbnRhaW5lciB3aXRoIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBvciBjdXJzb3IuXG4gKlxuICogQHJldHVybiBSYW5nZUNvbnRhaW5lciBpbnN0YW5jZVxuICovXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5nZXRGcmVzaFJhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmdldFJhbmdlQ29udGFpbmVyKCk7XG59O1xuXG5cbi8qKlxuICogR2V0cyBhIGZyZXNoIFJhbmdlQ29udGFpbmVyIHdpdGggdGhlIGN1cnJlbnQgc2VsZWN0aW9uIG9yIGN1cnNvci5cbiAqXG4gKiBAcmV0dXJuIEVpdGhlciBhIEN1cnNvciBvciBTZWxlY3Rpb24gaW5zdGFuY2Ugb3IgdW5kZWZpbmVkIGlmXG4gKiB0aGVyZSBpcyBuZWl0aGVyIGEgc2VsZWN0aW9uIG9yIGN1cnNvci5cbiAqL1xuU2VsZWN0aW9uV2F0Y2hlci5wcm90b3R5cGUuZ2V0RnJlc2hTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJhbmdlID0gdGhpcy5nZXRSYW5nZUNvbnRhaW5lcigpO1xuXG4gIHJldHVybiByYW5nZS5pc0N1cnNvciA/XG4gICAgcmFuZ2UuZ2V0Q3Vyc29yKHRoaXMud2luKSA6XG4gICAgcmFuZ2UuZ2V0U2VsZWN0aW9uKHRoaXMud2luKTtcbn07XG5cblxuLyoqXG4gKiBHZXQgdGhlIHNlbGVjdGlvbiBzZXQgYnkgdGhlIGxhc3Qgc2VsZWN0aW9uQ2hhbmdlZCBldmVudC5cbiAqIFNvbWV0aW1lcyB0aGUgZXZlbnQgZG9lcyBub3QgZmlyZSBmYXN0IGVub3VnaCBhbmQgdGhlIHNlbGVjaXRvblxuICogeW91IGdldCBpcyBub3QgdGhlIG9uZSB0aGUgdXNlciBzZWVzLlxuICogSW4gdGhvc2UgY2FzZXMgdXNlICNnZXRGcmVzaFNlbGVjdGlvbigpXG4gKlxuICogQHJldHVybiBFaXRoZXIgYSBDdXJzb3Igb3IgU2VsZWN0aW9uIGluc3RhbmNlIG9yIHVuZGVmaW5lZCBpZlxuICogdGhlcmUgaXMgbmVpdGhlciBhIHNlbGVjdGlvbiBvciBjdXJzb3IuXG4gKi9cblNlbGVjdGlvbldhdGNoZXIucHJvdG90eXBlLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50U2VsZWN0aW9uO1xufTtcblxuXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5mb3JjZUN1cnNvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmFuZ2UgPSB0aGlzLmdldFJhbmdlQ29udGFpbmVyKCk7XG4gIHJldHVybiByYW5nZS5mb3JjZUN1cnNvcigpO1xufTtcblxuXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5zZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuZXdSYW5nZSA9IHRoaXMuZ2V0UmFuZ2VDb250YWluZXIoKTtcbiAgaWYgKG5ld1JhbmdlLmlzRGlmZmVyZW50RnJvbSh0aGlzLmN1cnJlbnRSYW5nZSkpIHtcbiAgICB2YXIgbGFzdFNlbGVjdGlvbiA9IHRoaXMuY3VycmVudFNlbGVjdGlvbjtcbiAgICB0aGlzLmN1cnJlbnRSYW5nZSA9IG5ld1JhbmdlO1xuXG4gICAgLy8gZW1wdHkgc2VsZWN0aW9uIG9yIGN1cnNvclxuICAgIGlmIChsYXN0U2VsZWN0aW9uKSB7XG4gICAgICBpZiAobGFzdFNlbGVjdGlvbi5pc0N1cnNvciAmJiAhdGhpcy5jdXJyZW50UmFuZ2UuaXNDdXJzb3IpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnY3Vyc29yJywgbGFzdFNlbGVjdGlvbi5ob3N0KTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNlbGVjdGlvbi5pc1NlbGVjdGlvbiAmJiAhdGhpcy5jdXJyZW50UmFuZ2UuaXNTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnc2VsZWN0aW9uJywgbGFzdFNlbGVjdGlvbi5ob3N0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzZXQgbmV3IHNlbGVjdGlvbiBvciBjdXJzb3IgYW5kIGZpcmUgZXZlbnRcbiAgICBpZiAodGhpcy5jdXJyZW50UmFuZ2UuaXNDdXJzb3IpIHtcbiAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IG5ldyBDdXJzb3IodGhpcy5jdXJyZW50UmFuZ2UuaG9zdCwgdGhpcy5jdXJyZW50UmFuZ2UucmFuZ2UpO1xuICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnY3Vyc29yJywgdGhpcy5jdXJyZW50U2VsZWN0aW9uLmhvc3QsIHRoaXMuY3VycmVudFNlbGVjdGlvbik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRSYW5nZS5pc1NlbGVjdGlvbikge1xuICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gbmV3IFNlbGVjdGlvbih0aGlzLmN1cnJlbnRSYW5nZS5ob3N0LCB0aGlzLmN1cnJlbnRSYW5nZS5yYW5nZSk7XG4gICAgICB0aGlzLmRpc3BhdGNoZXIubm90aWZ5KCdzZWxlY3Rpb24nLCB0aGlzLmN1cnJlbnRTZWxlY3Rpb24uaG9zdCwgdGhpcy5jdXJyZW50U2VsZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBDdXJzb3IgPSByZXF1aXJlKCcuL2N1cnNvcicpO1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcicpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG5cbi8qKlxuICogVGhlIFNlbGVjdGlvbiBtb2R1bGUgcHJvdmlkZXMgYSBjcm9zcy1icm93c2VyIGFic3RyYWN0aW9uIGxheWVyIGZvciByYW5nZVxuICogYW5kIHNlbGVjdGlvbi5cbiAqXG4gKiBAbW9kdWxlIGNvcmVcbiAqIEBzdWJtb2R1bGUgc2VsZWN0aW9uXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgLyoqXG4gICAqIENsYXNzIHRoYXQgcmVwcmVzZW50cyBhIHNlbGVjdGlvbiBhbmQgcHJvdmlkZXMgZnVuY3Rpb25hbGl0eSB0byBhY2Nlc3Mgb3JcbiAgICogbW9kaWZ5IHRoZSBzZWxlY3Rpb24uXG4gICAqXG4gICAqIEBjbGFzcyBTZWxlY3Rpb25cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICB2YXIgU2VsZWN0aW9uID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0LCByYW5neVJhbmdlKSB7XG4gICAgdGhpcy5zZXRIb3N0KGVkaXRhYmxlSG9zdCk7XG4gICAgdGhpcy5yYW5nZSA9IHJhbmd5UmFuZ2U7XG4gICAgdGhpcy5pc1NlbGVjdGlvbiA9IHRydWU7XG4gIH07XG5cbiAgLy8gYWRkIEN1cnNvciBwcm90b3RweWUgdG8gU2VsZWN0aW9uIHByb3RvdHlwZSBjaGFpblxuICB2YXIgQmFzZSA9IGZ1bmN0aW9uKCkge307XG4gIEJhc2UucHJvdG90eXBlID0gQ3Vyc29yLnByb3RvdHlwZTtcbiAgU2VsZWN0aW9uLnByb3RvdHlwZSA9ICQuZXh0ZW5kKG5ldyBCYXNlKCksIHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRleHQgaW5zaWRlIHRoZSBzZWxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHRleHRcbiAgICAgKi9cbiAgICB0ZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnJhbmdlLnRvU3RyaW5nKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaHRtbCBpbnNpZGUgdGhlIHNlbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgaHRtbFxuICAgICAqL1xuICAgIGh0bWw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmFuZ2UudG9IdG1sKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc0FsbFNlbGVjdGVkXG4gICAgICovXG4gICAgaXNBbGxTZWxlY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGFyc2VyLmlzQmVnaW5uaW5nT2ZIb3N0KFxuICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgIHRoaXMucmFuZ2Uuc3RhcnRDb250YWluZXIsXG4gICAgICAgIHRoaXMucmFuZ2Uuc3RhcnRPZmZzZXQpICYmXG4gICAgICBwYXJzZXIuaXNUZXh0RW5kT2ZIb3N0KFxuICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgIHRoaXMucmFuZ2UuZW5kQ29udGFpbmVyLFxuICAgICAgICB0aGlzLnJhbmdlLmVuZE9mZnNldCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgQ2xpZW50UmVjdHMgb2YgdGhpcyBzZWxlY3Rpb24uXG4gICAgICogVXNlIHRoaXMgaWYgeW91IHdhbnQgbW9yZSBwcmVjaXNpb24gdGhhbiBnZXRCb3VuZGluZ0NsaWVudFJlY3QgY2FuIGdpdmUuXG4gICAgICovXG4gICAgZ2V0UmVjdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvb3JkcyA9IHRoaXMucmFuZ2UubmF0aXZlUmFuZ2UuZ2V0Q2xpZW50UmVjdHMoKTtcblxuICAgICAgLy8gdG9kbzogdHJhbnNsYXRlIGludG8gYWJzb2x1dGUgcG9zaXRpb25zXG4gICAgICAvLyBqdXN0IGxpa2UgQ3Vyc29yI2dldENvb3JkaW5hdGVzKClcbiAgICAgIHJldHVybiBjb29yZHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG1ldGhvZCBsaW5rXG4gICAgICovXG4gICAgbGluazogZnVuY3Rpb24oaHJlZiwgYXR0cnMpIHtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcy5jcmVhdGVFbGVtZW50KCdhJykpO1xuICAgICAgaWYgKGhyZWYpICRsaW5rLmF0dHIoJ2hyZWYnLCBocmVmKTtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gYXR0cnMpIHtcbiAgICAgICAgJGxpbmsuYXR0cihuYW1lLCBhdHRyc1tuYW1lXSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZm9yY2VXcmFwKCRsaW5rWzBdKTtcbiAgICB9LFxuXG4gICAgdW5saW5rOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVtb3ZlRm9ybWF0dGluZygnYScpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVMaW5rOiBmdW5jdGlvbihocmVmLCBhdHRycykge1xuICAgICAgdmFyIGxpbmtzID0gdGhpcy5nZXRUYWdzQnlOYW1lKCdhJyk7XG4gICAgICBpZiAobGlua3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgdmFyIGZpcnN0TGluayA9IGxpbmtzWzBdO1xuICAgICAgICBpZiAodGhpcy5pc0V4YWN0U2VsZWN0aW9uKGZpcnN0TGluaywgJ3Zpc2libGUnKSkge1xuICAgICAgICAgIHRoaXMudW5saW5rKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5leHBhbmRUbyhmaXJzdExpbmspO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbmsoaHJlZiwgYXR0cnMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB0b2dnbGU6IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIGVsZW0gPSB0aGlzLmFkb3B0RWxlbWVudChlbGVtKTtcbiAgICAgIHRoaXMucmFuZ2UgPSBjb250ZW50LnRvZ2dsZVRhZyh0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIGVsZW0pO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIG1ha2VCb2xkXG4gICAgICovXG4gICAgbWFrZUJvbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvbGQgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoY29uZmlnLmJvbGRUYWcpO1xuICAgICAgdGhpcy5mb3JjZVdyYXAoYm9sZCk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUJvbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvbGQgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoY29uZmlnLmJvbGRUYWcpO1xuICAgICAgdGhpcy50b2dnbGUoYm9sZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnaXZlRW1waGFzaXNcbiAgICAgKi9cbiAgICBnaXZlRW1waGFzaXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVtID0gdGhpcy5jcmVhdGVFbGVtZW50KGNvbmZpZy5pdGFsaWNUYWcpO1xuICAgICAgdGhpcy5mb3JjZVdyYXAoZW0pO1xuICAgIH0sXG5cbiAgICB0b2dnbGVFbXBoYXNpczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZW0gPSB0aGlzLmNyZWF0ZUVsZW1lbnQoY29uZmlnLml0YWxpY1RhZyk7XG4gICAgICB0aGlzLnRvZ2dsZShlbSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1cnJvdW5kIHRoZSBzZWxlY3Rpb24gd2l0aCBjaGFyYWN0ZXJzIGxpa2UgcXVvdGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBzdXJyb3VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBFLmcuICfCqydcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gRS5nLiAnwrsnXG4gICAgICovXG4gICAgc3Vycm91bmQ6IGZ1bmN0aW9uKHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpIHtcbiAgICAgIHRoaXMucmFuZ2UgPSBjb250ZW50LnN1cnJvdW5kKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgc3RhcnRDaGFyYWN0ZXIsIGVuZENoYXJhY3Rlcik7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICByZW1vdmVTdXJyb3VuZDogZnVuY3Rpb24oc3RhcnRDaGFyYWN0ZXIsIGVuZENoYXJhY3Rlcikge1xuICAgICAgdGhpcy5yYW5nZSA9IGNvbnRlbnQuZGVsZXRlQ2hhcmFjdGVyKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgc3RhcnRDaGFyYWN0ZXIpO1xuICAgICAgdGhpcy5yYW5nZSA9IGNvbnRlbnQuZGVsZXRlQ2hhcmFjdGVyKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgZW5kQ2hhcmFjdGVyKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIHRvZ2dsZVN1cnJvdW5kOiBmdW5jdGlvbihzdGFydENoYXJhY3RlciwgZW5kQ2hhcmFjdGVyKSB7XG4gICAgICBpZiAodGhpcy5jb250YWluc1N0cmluZyhzdGFydENoYXJhY3RlcikgJiZcbiAgICAgICAgdGhpcy5jb250YWluc1N0cmluZyhlbmRDaGFyYWN0ZXIpKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlU3Vycm91bmQoc3RhcnRDaGFyYWN0ZXIsIGVuZENoYXJhY3Rlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnN1cnJvdW5kKHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZUZvcm1hdHRpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGFnTmFtZS4gRS5nLiAnYScgdG8gcmVtb3ZlIGFsbCBsaW5rcy5cbiAgICAgKi9cbiAgICByZW1vdmVGb3JtYXR0aW5nOiBmdW5jdGlvbih0YWdOYW1lKSB7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC5yZW1vdmVGb3JtYXR0aW5nKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgdGFnTmFtZSk7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgdGhlIGNvbnRlbnRzIGluc2lkZSB0aGUgcmFuZ2UuIEFmdGVyIHRoYXQgdGhlIHNlbGVjdGlvbiB3aWxsIGJlIGFcbiAgICAgKiBjdXJzb3IuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGRlbGV0ZUNvbnRlbnRcbiAgICAgKiBAcmV0dXJuIEN1cnNvciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGRlbGV0ZUNvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yYW5nZS5kZWxldGVDb250ZW50cygpO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodGhpcy5ob3N0LCB0aGlzLnJhbmdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwYW5kIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZXhwYW5kVG9cbiAgICAgKiBAcGFyYW0ge0RPTSBOb2RlfVxuICAgICAqL1xuICAgIGV4cGFuZFRvOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC5leHBhbmRUbyh0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIGVsZW0pO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogIENvbGxhcHNlIHRoZSBzZWxlY3Rpb24gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VsZWN0aW9uXG4gICAgICpcbiAgICAgKiAgQHJldHVybiBDdXJzb3IgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb2xsYXBzZUF0QmVnaW5uaW5nOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICB0aGlzLnJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqICBDb2xsYXBzZSB0aGUgc2VsZWN0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIHNlbGVjdGlvblxuICAgICAqXG4gICAgICogIEByZXR1cm4gQ3Vyc29yIGluc3RhbmNlXG4gICAgICovXG4gICAgY29sbGFwc2VBdEVuZDogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgdGhpcy5yYW5nZS5jb2xsYXBzZShmYWxzZSk7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodGhpcy5ob3N0LCB0aGlzLnJhbmdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV3JhcCB0aGUgc2VsZWN0aW9uIHdpdGggdGhlIHNwZWNpZmllZCB0YWcuIElmIGFueSBvdGhlciB0YWcgd2l0aFxuICAgICAqIHRoZSBzYW1lIHRhZ05hbWUgaXMgYWZmZWN0aW5nIHRoZSBzZWxlY3Rpb24gdGhpcyB0YWcgd2lsbCBiZVxuICAgICAqIHJlbW92ZSBmaXJzdC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZm9yY2VXcmFwXG4gICAgICovXG4gICAgZm9yY2VXcmFwOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICBlbGVtID0gdGhpcy5hZG9wdEVsZW1lbnQoZWxlbSk7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC5mb3JjZVdyYXAodGhpcy5ob3N0LCB0aGlzLnJhbmdlLCBlbGVtKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFncyB0aGF0IGFmZmVjdCB0aGUgY3VycmVudCBzZWxlY3Rpb24uIE9wdGlvbmFsbHkgcGFzcyBhXG4gICAgICogbWV0aG9kIHRvIGZpbHRlciB0aGUgcmV0dXJuZWQgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldFRhZ3NcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uIGZpbHRlcihub2RlKX0gW09wdGlvbmFsXSBNZXRob2QgdG8gZmlsdGVyIHRoZSByZXR1cm5lZFxuICAgICAqICAgRE9NIE5vZGVzLlxuICAgICAqIEByZXR1cm4ge0FycmF5IG9mIERPTSBOb2Rlc31cbiAgICAgKi9cbiAgICBnZXRUYWdzOiBmdW5jdGlvbihmaWx0ZXJGdW5jKSB7XG4gICAgICByZXR1cm4gY29udGVudC5nZXRUYWdzKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgZmlsdGVyRnVuYyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFncyBvZiB0aGUgc3BlY2lmaWVkIHR5cGUgdGhhdCBhZmZlY3QgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRUYWdzQnlOYW1lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWUuIEUuZy4gJ2EnIHRvIGdldCBhbGwgbGlua3MuXG4gICAgICogQHJldHVybiB7QXJyYXkgb2YgRE9NIE5vZGVzfVxuICAgICAqL1xuICAgIGdldFRhZ3NCeU5hbWU6IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICAgIHJldHVybiBjb250ZW50LmdldFRhZ3NCeU5hbWUodGhpcy5ob3N0LCB0aGlzLnJhbmdlLCB0YWdOYW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHNlbGVjdGlvbiBpcyB0aGUgc2FtZSBhcyB0aGUgZWxlbWVudHMgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGlzRXhhY3RTZWxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0RPTSBOb2RlfVxuICAgICAqIEBwYXJhbSB7ZmxhZzogIHVuZGVmaW5lZCBvciAndmlzaWJsZSd9IGlmICd2aXNpYmxlJyBpcyBwYXNzZWRcbiAgICAgKiAgIHdoaXRlc3BhY2VzIGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kIG9mIHRoZSBzZWxlY3Rpb24gd2lsbFxuICAgICAqICAgYmUgaWdub3JlZC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzRXhhY3RTZWxlY3Rpb246IGZ1bmN0aW9uKGVsZW0sIG9ubHlWaXNpYmxlKSB7XG4gICAgICByZXR1cm4gY29udGVudC5pc0V4YWN0U2VsZWN0aW9uKHRoaXMucmFuZ2UsIGVsZW0sIG9ubHlWaXNpYmxlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHNlbGVjdGlvbiBjb250YWlucyB0aGUgcGFzc2VkIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgY29udGFpbnNTdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGNvbnRhaW5zU3RyaW5nOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHJldHVybiBjb250ZW50LmNvbnRhaW5zU3RyaW5nKHRoaXMucmFuZ2UsIHN0cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBhbGwgb2NjdXJlbmNlcyBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlciBmcm9tIHRoZVxuICAgICAqIHNlbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZGVsZXRlQ2hhcmFjdGVyXG4gICAgICovXG4gICAgZGVsZXRlQ2hhcmFjdGVyOiBmdW5jdGlvbihjaGFyYWN0ZXIpIHtcbiAgICAgIHRoaXMucmFuZ2UgPSBjb250ZW50LmRlbGV0ZUNoYXJhY3Rlcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIGNoYXJhY3Rlcik7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNlbGVjdGlvbjtcbn0pKCk7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgY29udGVudCA9IHJlcXVpcmUoJy4vY29udGVudCcpO1xudmFyIGhpZ2hsaWdodFRleHQgPSByZXF1aXJlKCcuL2hpZ2hsaWdodC10ZXh0Jyk7XG52YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICAvLyBVbmljb2RlIGNoYXJhY3RlciBibG9ja3MgZm9yIGxldHRlcnMuXG4gIC8vIFNlZTogaHR0cDovL2pyZ3JhcGhpeC5uZXQvcmVzZWFyY2gvdW5pY29kZV9ibG9ja3MucGhwXG4gIC8vXG4gIC8vIFxcXFx1MDA0MS1cXFxcdTAwNUEgICAgQS1aIChCYXNpYyBMYXRpbilcbiAgLy8gXFxcXHUwMDYxLVxcXFx1MDA3QSAgICBhLXogKEJhc2ljIExhdGluKVxuICAvLyBcXFxcdTAwMzAtXFxcXHUwMDM5ICAgIDAtOSAoQmFzaWMgTGF0aW4pXG4gIC8vIFxcXFx1MDBBQSAgICAgICAgICAgIMKqICAgKExhdGluLTEgU3VwcGxlbWVudClcbiAgLy8gXFxcXHUwMEI1ICAgICAgICAgICAgwrUgICAoTGF0aW4tMSBTdXBwbGVtZW50KVxuICAvLyBcXFxcdTAwQkEgICAgICAgICAgICDCuiAgIChMYXRpbi0xIFN1cHBsZW1lbnQpXG4gIC8vIFxcXFx1MDBDMC1cXFxcdTAwRDYgICAgw4Atw5YgKExhdGluLTEgU3VwcGxlbWVudClcbiAgLy8gXFxcXHUwMEQ4LVxcXFx1MDBGNiAgICDDmC3DtiAoTGF0aW4tMSBTdXBwbGVtZW50KVxuICAvLyBcXFxcdTAwRjgtXFxcXHUwMEZGICAgIMO4LcO/IChMYXRpbi0xIFN1cHBsZW1lbnQpXG4gIC8vIFxcXFx1MDEwMC1cXFxcdTAxN0YgICAgxIAtxb8gKExhdGluIEV4dGVuZGVkLUEpXG4gIC8vIFxcXFx1MDE4MC1cXFxcdTAyNEYgICAgxoAtyY8gKExhdGluIEV4dGVuZGVkLUIpXG4gIHZhciBsZXR0ZXJDaGFycyA9ICdcXFxcdTAwNDEtXFxcXHUwMDVBXFxcXHUwMDYxLVxcXFx1MDA3QVxcXFx1MDAzMC1cXFxcdTAwMzlcXFxcdTAwQUFcXFxcdTAwQjVcXFxcdTAwQkFcXFxcdTAwQzAtXFxcXHUwMEQ2XFxcXHUwMEQ4LVxcXFx1MDBGNlxcXFx1MDBGOC1cXFxcdTAwRkZcXFxcdTAxMDAtXFxcXHUwMTdGXFxcXHUwMTgwLVxcXFx1MDI0Ric7XG5cbiAgdmFyIGVzY2FwZVJlZ0V4ID0gZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBTdHJpbmcocykucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTcGVsbGNoZWNrIGNsYXNzLlxuICAgKlxuICAgKiBAY2xhc3MgU3BlbGxjaGVja1xuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIHZhciBTcGVsbGNoZWNrID0gZnVuY3Rpb24oZWRpdGFibGUsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAgIGNoZWNrT25Gb2N1czogZmFsc2UsIC8vIGNoZWNrIG9uIGZvY3VzXG4gICAgICBjaGVja09uQ2hhbmdlOiB0cnVlLCAvLyBjaGVjayBhZnRlciBjaGFuZ2VzXG4gICAgICB0aHJvdHRsZTogMTAwMCwgLy8gdW5ib3VuY2UgcmF0ZSBpbiBtcyBiZWZvcmUgY2FsbGluZyB0aGUgc3BlbGxjaGVjayBzZXJ2aWNlIGFmdGVyIGNoYW5nZXNcbiAgICAgIHJlbW92ZU9uQ29ycmVjdGlvbjogdHJ1ZSwgLy8gcmVtb3ZlIGhpZ2hsaWdodHMgYWZ0ZXIgYSBjaGFuZ2UgaWYgdGhlIGN1cnNvciBpcyBpbnNpZGUgYSBoaWdobGlnaHRcbiAgICAgIG1hcmtlck5vZGU6ICQoJzxzcGFuIGNsYXNzPVwic3BlbGxjaGVja1wiPjwvc3Bhbj4nKSxcbiAgICAgIHNwZWxsY2hlY2tTZXJ2aWNlOiB1bmRlZmluZWRcbiAgICB9O1xuXG4gICAgdGhpcy5lZGl0YWJsZSA9IGVkaXRhYmxlO1xuICAgIHRoaXMud2luID0gZWRpdGFibGUud2luO1xuICAgIHRoaXMuY29uZmlnID0gJC5leHRlbmQoZGVmYXVsdENvbmZpZywgY29uZmlndXJhdGlvbik7XG4gICAgdGhpcy5wcmVwYXJlTWFya2VyTm9kZSgpO1xuICAgIHRoaXMuc2V0dXAoKTtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKGVkaXRhYmxlKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmNoZWNrT25Gb2N1cykge1xuICAgICAgdGhpcy5lZGl0YWJsZS5vbignZm9jdXMnLCAkLnByb3h5KHRoaXMsICdvbkZvY3VzJykpO1xuICAgICAgdGhpcy5lZGl0YWJsZS5vbignYmx1cicsICQucHJveHkodGhpcywgJ29uQmx1cicpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY29uZmlnLmNoZWNrT25DaGFuZ2UgfHwgdGhpcy5jb25maWcucmVtb3ZlT25Db3JyZWN0aW9uKSB7XG4gICAgICB0aGlzLmVkaXRhYmxlLm9uKCdjaGFuZ2UnLCAkLnByb3h5KHRoaXMsICdvbkNoYW5nZScpKTtcbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUub25Gb2N1cyA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICAgIGlmICh0aGlzLmZvY3VzZWRFZGl0YWJsZSAhPT0gZWRpdGFibGVIb3N0KSB7XG4gICAgICB0aGlzLmZvY3VzZWRFZGl0YWJsZSA9IGVkaXRhYmxlSG9zdDtcbiAgICAgIHRoaXMuZWRpdGFibGVIYXNDaGFuZ2VkKGVkaXRhYmxlSG9zdCk7XG4gICAgfVxuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLm9uQmx1ciA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICAgIGlmICh0aGlzLmZvY3VzZWRFZGl0YWJsZSA9PT0gZWRpdGFibGVIb3N0KSB7XG4gICAgICB0aGlzLmZvY3VzZWRFZGl0YWJsZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUub25DaGFuZ2UgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QpIHtcbiAgICBpZiAodGhpcy5jb25maWcuY2hlY2tPbkNoYW5nZSkge1xuICAgICAgdGhpcy5lZGl0YWJsZUhhc0NoYW5nZWQoZWRpdGFibGVIb3N0LCB0aGlzLmNvbmZpZy50aHJvdHRsZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbmZpZy5yZW1vdmVPbkNvcnJlY3Rpb24pIHtcbiAgICAgIHRoaXMucmVtb3ZlSGlnaGxpZ2h0c0F0Q3Vyc29yKGVkaXRhYmxlSG9zdCk7XG4gICAgfVxuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLnByZXBhcmVNYXJrZXJOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuY29uZmlnLm1hcmtlck5vZGU7XG4gICAgaWYgKG1hcmtlci5qcXVlcnkpIHtcbiAgICAgIG1hcmtlciA9IG1hcmtlclswXTtcbiAgICB9XG4gICAgbWFya2VyID0gY29udGVudC5hZG9wdEVsZW1lbnQobWFya2VyLCB0aGlzLndpbi5kb2N1bWVudCk7XG4gICAgdGhpcy5jb25maWcubWFya2VyTm9kZSA9IG1hcmtlcjtcblxuICAgIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ2RhdGEtZWRpdGFibGUnLCAndWktdW53cmFwJyk7XG4gICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnZGF0YS1zcGVsbGNoZWNrJywgJ3NwZWxsY2hlY2snKTtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5jcmVhdGVNYXJrZXJOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLm1hcmtlck5vZGUuY2xvbmVOb2RlKCk7XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUucmVtb3ZlSGlnaGxpZ2h0cyA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICAgICQoZWRpdGFibGVIb3N0KS5maW5kKCdbZGF0YS1zcGVsbGNoZWNrPXNwZWxsY2hlY2tdJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbSkge1xuICAgICAgY29udGVudC51bndyYXAoZWxlbSk7XG4gICAgfSk7XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUucmVtb3ZlSGlnaGxpZ2h0c0F0Q3Vyc29yID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gICAgdmFyIHdvcmRJZDtcbiAgICB2YXIgc2VsZWN0aW9uID0gdGhpcy5lZGl0YWJsZS5nZXRTZWxlY3Rpb24oZWRpdGFibGVIb3N0KTtcbiAgICBpZiAoc2VsZWN0aW9uICYmIHNlbGVjdGlvbi5pc0N1cnNvcikge1xuICAgICAgdmFyIGVsZW1lbnRBdEN1cnNvciA9IHNlbGVjdGlvbi5yYW5nZS5zdGFydENvbnRhaW5lcjtcbiAgICAgIGlmIChlbGVtZW50QXRDdXJzb3Iubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgIGVsZW1lbnRBdEN1cnNvciA9IGVsZW1lbnRBdEN1cnNvci5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgICBkbyB7XG4gICAgICAgIGlmIChlbGVtZW50QXRDdXJzb3IgPT09IGVkaXRhYmxlSG9zdCkgcmV0dXJuO1xuICAgICAgICBpZiAoIGVsZW1lbnRBdEN1cnNvci5oYXNBdHRyaWJ1dGUoJ2RhdGEtd29yZC1pZCcpICkge1xuICAgICAgICAgIHdvcmRJZCA9IGVsZW1lbnRBdEN1cnNvci5nZXRBdHRyaWJ1dGUoJ2RhdGEtd29yZC1pZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlICggKGVsZW1lbnRBdEN1cnNvciA9IGVsZW1lbnRBdEN1cnNvci5wYXJlbnROb2RlKSApO1xuXG4gICAgICBpZiAod29yZElkKSB7XG4gICAgICAgIHNlbGVjdGlvbi5yZXRhaW5WaXNpYmxlU2VsZWN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoZWRpdGFibGVIb3N0KS5maW5kKCdbZGF0YS13b3JkLWlkPScrIHdvcmRJZCArJ10nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtKSB7XG4gICAgICAgICAgICBjb250ZW50LnVud3JhcChlbGVtKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLmNyZWF0ZVJlZ2V4ID0gZnVuY3Rpb24od29yZHMpIHtcbiAgICB2YXIgZXNjYXBlZFdvcmRzID0gJC5tYXAod29yZHMsIGZ1bmN0aW9uKHdvcmQpIHtcbiAgICAgIHJldHVybiBlc2NhcGVSZWdFeCh3b3JkKTtcbiAgICB9KTtcblxuICAgIHZhciByZWdleCA9ICcnO1xuICAgIHJlZ2V4ICs9ICcoW14nICsgbGV0dGVyQ2hhcnMgKyAnXXxeKSc7XG4gICAgcmVnZXggKz0gJygnICsgZXNjYXBlZFdvcmRzLmpvaW4oJ3wnKSArICcpJztcbiAgICByZWdleCArPSAnKD89W14nICsgbGV0dGVyQ2hhcnMgKyAnXXwkKSc7XG5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgJ2cnKTtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5oaWdobGlnaHQgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QsIG1pc3NwZWxsZWRXb3Jkcykge1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBoaWdobGlnaHRzXG4gICAgdGhpcy5yZW1vdmVIaWdobGlnaHRzKGVkaXRhYmxlSG9zdCk7XG5cbiAgICAvLyBDcmVhdGUgbmV3IGhpZ2hsaWdodHNcbiAgICBpZiAobWlzc3BlbGxlZFdvcmRzICYmIG1pc3NwZWxsZWRXb3Jkcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcmVnZXggPSB0aGlzLmNyZWF0ZVJlZ2V4KG1pc3NwZWxsZWRXb3Jkcyk7XG4gICAgICB2YXIgc3BhbiA9IHRoaXMuY3JlYXRlTWFya2VyTm9kZSgpO1xuICAgICAgaGlnaGxpZ2h0VGV4dC5oaWdobGlnaHQoZWRpdGFibGVIb3N0LCByZWdleCwgc3Bhbik7XG4gICAgfVxuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLmVkaXRhYmxlSGFzQ2hhbmdlZCA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCwgdGhyb3R0bGUpIHtcbiAgICBpZiAodGhpcy50aW1lb3V0SWQgJiYgdGhpcy5jdXJyZW50RWRpdGFibGVIb3N0ID09PSBlZGl0YWJsZUhvc3QpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRoYXQuY2hlY2tTcGVsbGluZyhlZGl0YWJsZUhvc3QpO1xuICAgICAgdGhhdC5jdXJyZW50RWRpdGFibGVIb3N0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhhdC50aW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gICAgfSwgdGhyb3R0bGUgfHwgMCk7XG5cbiAgICB0aGlzLmN1cnJlbnRFZGl0YWJsZUhvc3QgPSBlZGl0YWJsZUhvc3Q7XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUuY2hlY2tTcGVsbGluZyA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgdGV4dCA9IGhpZ2hsaWdodFRleHQuZXh0cmFjdFRleHQoZWRpdGFibGVIb3N0KTtcbiAgICB0ZXh0ID0gY29udGVudC5ub3JtYWxpemVXaGl0ZXNwYWNlKHRleHQpO1xuXG4gICAgdGhpcy5jb25maWcuc3BlbGxjaGVja1NlcnZpY2UodGV4dCwgZnVuY3Rpb24obWlzc3BlbGxlZFdvcmRzKSB7XG4gICAgICB2YXIgc2VsZWN0aW9uID0gdGhhdC5lZGl0YWJsZS5nZXRTZWxlY3Rpb24oZWRpdGFibGVIb3N0KTtcbiAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgc2VsZWN0aW9uLnJldGFpblZpc2libGVTZWxlY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhhdC5oaWdobGlnaHQoZWRpdGFibGVIb3N0LCBtaXNzcGVsbGVkV29yZHMpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuaGlnaGxpZ2h0KGVkaXRhYmxlSG9zdCwgbWlzc3BlbGxlZFdvcmRzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3BlbGxjaGVjaztcbn0pKCk7XG4iLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG5cbi8vIEFsbG93cyBmb3Igc2FmZSBlcnJvciBsb2dnaW5nXG4vLyBGYWxscyBiYWNrIHRvIGNvbnNvbGUubG9nIGlmIGNvbnNvbGUuZXJyb3IgaXMgbm90IGF2YWlsYWJsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGNvbmZpZy5sb2dFcnJvcnMgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuXG4gIHZhciBhcmdzO1xuICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgYXJncyA9IGFyZ3NbMF07XG4gIH1cblxuICBpZiAod2luZG93LmNvbnNvbGUgJiYgdHlwZW9mIHdpbmRvdy5jb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoYXJncyk7XG4gIH0gZWxzZSBpZiAod2luZG93LmNvbnNvbGUpIHtcbiAgICByZXR1cm4gY29uc29sZS5sb2coYXJncyk7XG4gIH1cbn07XG4iLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG5cbi8vIEFsbG93cyBmb3Igc2FmZSBjb25zb2xlIGxvZ2dpbmdcbi8vIElmIHRoZSBsYXN0IHBhcmFtIGlzIHRoZSBzdHJpbmcgXCJ0cmFjZVwiIGNvbnNvbGUudHJhY2Ugd2lsbCBiZSBjYWxsZWRcbi8vIGNvbmZpZ3VyYXRpb246IGRpc2FibGUgd2l0aCBjb25maWcubG9nID0gZmFsc2Vcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGlmIChjb25maWcubG9nID09PSBmYWxzZSkgeyByZXR1cm47IH1cblxuICB2YXIgYXJncywgX3JlZjtcbiAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIGlmIChhcmdzLmxlbmd0aCkge1xuICAgIGlmIChhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICd0cmFjZScpIHtcbiAgICAgIGFyZ3MucG9wKCk7XG4gICAgICBpZiAoKF9yZWYgPSB3aW5kb3cuY29uc29sZSkgPyBfcmVmLnRyYWNlIDogdm9pZCAwKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICBhcmdzID0gYXJnc1swXTtcbiAgfVxuXG4gIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhhcmdzKTtcbiAgfVxufTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyIGh0bWxDaGFyYWN0ZXJzID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAnXFwnJzogJyYjMzk7J1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgdHJpbVJpZ2h0OiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbiAgICB9LFxuXG4gICAgdHJpbUxlZnQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL15cXHMrLywgJycpO1xuICAgIH0sXG5cbiAgICB0cmltOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgfSxcblxuICAgIGlzU3RyaW5nOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUdXJuIGFueSBzdHJpbmcgaW50byBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBvciByZXBsYWNlIGEgc3RyaW5nIGNvbnZlbmllbnRseS5cbiAgICAgKi9cbiAgICByZWdleHA6IGZ1bmN0aW9uKHN0ciwgZmxhZ3MpIHtcbiAgICAgIGlmICghZmxhZ3MpIGZsYWdzID0gJ2cnO1xuICAgICAgdmFyIGVzY2FwZWRTdHIgPSBzdHIucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKTtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZWRTdHIsIGZsYWdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlIEhUTUwgY2hhcmFjdGVycyA8LCA+IGFuZCAmXG4gICAgICogVXNhZ2U6IGVzY2FwZUh0bWwoJzxkaXY+Jyk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0geyBTdHJpbmcgfVxuICAgICAqIEBwYXJhbSB7IEJvb2xlYW4gfSBPcHRpb25hbC4gSWYgdHJ1ZSBcIiBhbmQgJyB3aWxsIGFsc28gYmUgZXNjYXBlZC5cbiAgICAgKiBAcmV0dXJuIHsgU3RyaW5nIH0gRXNjYXBlZCBIdG1sIHlvdSBjYW4gYXNzaWduIHRvIGlubmVySFRNTCBvZiBhbiBlbGVtZW50LlxuICAgICAqL1xuICAgIGVzY2FwZUh0bWw6IGZ1bmN0aW9uKHMsIGZvckF0dHJpYnV0ZSkge1xuICAgICAgcmV0dXJuIHMucmVwbGFjZShmb3JBdHRyaWJ1dGUgPyAvWyY8PidcIl0vZyA6IC9bJjw+XS9nLCBmdW5jdGlvbihjKSB7IC8vIFwiJ1xuICAgICAgICByZXR1cm4gaHRtbENoYXJhY3RlcnNbY107XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlIGEgc3RyaW5nIHRoZSBicm93c2VyIHdheS5cbiAgICAgKi9cbiAgICBicm93c2VyRXNjYXBlSHRtbDogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKSk7XG4gICAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbiAgICB9XG4gIH07XG59KSgpO1xuIl19

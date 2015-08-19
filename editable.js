/**
 * Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Copyright 2015, Tim Down
 * Licensed under the MIT license.
 * Version: 1.3.0
 * Build date: 10 May 2015
 */

(function(factory, root) {
    if (typeof define == "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof module != "undefined" && typeof exports == "object") {
        // Node/CommonJS style
        module.exports = factory();
    } else {
        // No AMD or CommonJS support so we place Rangy in (probably) the global variable
        root.rangy = factory();
    }
})(function() {

    var OBJECT = "object", FUNCTION = "function", UNDEFINED = "undefined";

    // Minimal set of properties required for DOM Level 2 Range compliance. Comparison constants such as START_TO_START
    // are omitted because ranges in KHTML do not have them but otherwise work perfectly well. See issue 113.
    var domRangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
        "commonAncestorContainer"];

    // Minimal set of methods required for DOM Level 2 Range compliance
    var domRangeMethods = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore",
        "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents",
        "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"];

    var textRangeProperties = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"];

    // Subset of TextRange's full set of methods that we're interested in
    var textRangeMethods = ["collapse", "compareEndPoints", "duplicate", "moveToElementText", "parentElement", "select",
        "setEndPoint", "getBoundingClientRect"];

    /*----------------------------------------------------------------------------------------------------------------*/

    // Trio of functions taken from Peter Michaux's article:
    // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
    function isHostMethod(o, p) {
        var t = typeof o[p];
        return t == FUNCTION || (!!(t == OBJECT && o[p])) || t == "unknown";
    }

    function isHostObject(o, p) {
        return !!(typeof o[p] == OBJECT && o[p]);
    }

    function isHostProperty(o, p) {
        return typeof o[p] != UNDEFINED;
    }

    // Creates a convenience function to save verbose repeated calls to tests functions
    function createMultiplePropertyTest(testFunc) {
        return function(o, props) {
            var i = props.length;
            while (i--) {
                if (!testFunc(o, props[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // Next trio of functions are a convenience to save verbose repeated calls to previous two functions
    var areHostMethods = createMultiplePropertyTest(isHostMethod);
    var areHostObjects = createMultiplePropertyTest(isHostObject);
    var areHostProperties = createMultiplePropertyTest(isHostProperty);

    function isTextRange(range) {
        return range && areHostMethods(range, textRangeMethods) && areHostProperties(range, textRangeProperties);
    }

    function getBody(doc) {
        return isHostObject(doc, "body") ? doc.body : doc.getElementsByTagName("body")[0];
    }

    var forEach = [].forEach ?
        function(arr, func) {
            arr.forEach(func);
        } :
        function(arr, func) {
            for (var i = 0, len = arr.length; i < len; ++i) {
                func(arr[i], i);
            }
        };

    var modules = {};

    var isBrowser = (typeof window != UNDEFINED && typeof document != UNDEFINED);

    var util = {
        isHostMethod: isHostMethod,
        isHostObject: isHostObject,
        isHostProperty: isHostProperty,
        areHostMethods: areHostMethods,
        areHostObjects: areHostObjects,
        areHostProperties: areHostProperties,
        isTextRange: isTextRange,
        getBody: getBody,
        forEach: forEach
    };

    var api = {
        version: "1.3.0",
        initialized: false,
        isBrowser: isBrowser,
        supported: true,
        util: util,
        features: {},
        modules: modules,
        config: {
            alertOnFail: false,
            alertOnWarn: false,
            preferTextRange: false,
            autoInitialize: (typeof rangyAutoInitialize == UNDEFINED) ? true : rangyAutoInitialize
        }
    };

    function consoleLog(msg) {
        if (typeof console != UNDEFINED && isHostMethod(console, "log")) {
            console.log(msg);
        }
    }

    function alertOrLog(msg, shouldAlert) {
        if (isBrowser && shouldAlert) {
            alert(msg);
        } else  {
            consoleLog(msg);
        }
    }

    function fail(reason) {
        api.initialized = true;
        api.supported = false;
        alertOrLog("Rangy is not supported in this environment. Reason: " + reason, api.config.alertOnFail);
    }

    api.fail = fail;

    function warn(msg) {
        alertOrLog("Rangy warning: " + msg, api.config.alertOnWarn);
    }

    api.warn = warn;

    // Add utility extend() method
    var extend;
    if ({}.hasOwnProperty) {
        util.extend = extend = function(obj, props, deep) {
            var o, p;
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    o = obj[i];
                    p = props[i];
                    if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
                        extend(o, p, true);
                    }
                    obj[i] = p;
                }
            }
            // Special case for toString, which does not show up in for...in loops in IE <= 8
            if (props.hasOwnProperty("toString")) {
                obj.toString = props.toString;
            }
            return obj;
        };

        util.createOptions = function(optionsParam, defaults) {
            var options = {};
            extend(options, defaults);
            if (optionsParam) {
                extend(options, optionsParam);
            }
            return options;
        };
    } else {
        fail("hasOwnProperty not supported");
    }

    // Test whether we're in a browser and bail out if not
    if (!isBrowser) {
        fail("Rangy can only run in a browser");
    }

    // Test whether Array.prototype.slice can be relied on for NodeLists and use an alternative toArray() if not
    (function() {
        var toArray;

        if (isBrowser) {
            var el = document.createElement("div");
            el.appendChild(document.createElement("span"));
            var slice = [].slice;
            try {
                if (slice.call(el.childNodes, 0)[0].nodeType == 1) {
                    toArray = function(arrayLike) {
                        return slice.call(arrayLike, 0);
                    };
                }
            } catch (e) {}
        }

        if (!toArray) {
            toArray = function(arrayLike) {
                var arr = [];
                for (var i = 0, len = arrayLike.length; i < len; ++i) {
                    arr[i] = arrayLike[i];
                }
                return arr;
            };
        }

        util.toArray = toArray;
    })();

    // Very simple event handler wrapper function that doesn't attempt to solve issues such as "this" handling or
    // normalization of event properties
    var addListener;
    if (isBrowser) {
        if (isHostMethod(document, "addEventListener")) {
            addListener = function(obj, eventType, listener) {
                obj.addEventListener(eventType, listener, false);
            };
        } else if (isHostMethod(document, "attachEvent")) {
            addListener = function(obj, eventType, listener) {
                obj.attachEvent("on" + eventType, listener);
            };
        } else {
            fail("Document does not have required addEventListener or attachEvent method");
        }

        util.addListener = addListener;
    }

    var initListeners = [];

    function getErrorDesc(ex) {
        return ex.message || ex.description || String(ex);
    }

    // Initialization
    function init() {
        if (!isBrowser || api.initialized) {
            return;
        }
        var testRange;
        var implementsDomRange = false, implementsTextRange = false;

        // First, perform basic feature tests

        if (isHostMethod(document, "createRange")) {
            testRange = document.createRange();
            if (areHostMethods(testRange, domRangeMethods) && areHostProperties(testRange, domRangeProperties)) {
                implementsDomRange = true;
            }
        }

        var body = getBody(document);
        if (!body || body.nodeName.toLowerCase() != "body") {
            fail("No body element found");
            return;
        }

        if (body && isHostMethod(body, "createTextRange")) {
            testRange = body.createTextRange();
            if (isTextRange(testRange)) {
                implementsTextRange = true;
            }
        }

        if (!implementsDomRange && !implementsTextRange) {
            fail("Neither Range nor TextRange are available");
            return;
        }

        api.initialized = true;
        api.features = {
            implementsDomRange: implementsDomRange,
            implementsTextRange: implementsTextRange
        };

        // Initialize modules
        var module, errorMessage;
        for (var moduleName in modules) {
            if ( (module = modules[moduleName]) instanceof Module ) {
                module.init(module, api);
            }
        }

        // Call init listeners
        for (var i = 0, len = initListeners.length; i < len; ++i) {
            try {
                initListeners[i](api);
            } catch (ex) {
                errorMessage = "Rangy init listener threw an exception. Continuing. Detail: " + getErrorDesc(ex);
                consoleLog(errorMessage);
            }
        }
    }

    function deprecationNotice(deprecated, replacement, module) {
        if (module) {
            deprecated += " in module " + module.name;
        }
        api.warn("DEPRECATED: " + deprecated + " is deprecated. Please use " +
        replacement + " instead.");
    }

    function createAliasForDeprecatedMethod(owner, deprecated, replacement, module) {
        owner[deprecated] = function() {
            deprecationNotice(deprecated, replacement, module);
            return owner[replacement].apply(owner, util.toArray(arguments));
        };
    }

    util.deprecationNotice = deprecationNotice;
    util.createAliasForDeprecatedMethod = createAliasForDeprecatedMethod;

    // Allow external scripts to initialize this library in case it's loaded after the document has loaded
    api.init = init;

    // Execute listener immediately if already initialized
    api.addInitListener = function(listener) {
        if (api.initialized) {
            listener(api);
        } else {
            initListeners.push(listener);
        }
    };

    var shimListeners = [];

    api.addShimListener = function(listener) {
        shimListeners.push(listener);
    };

    function shim(win) {
        win = win || window;
        init();

        // Notify listeners
        for (var i = 0, len = shimListeners.length; i < len; ++i) {
            shimListeners[i](win);
        }
    }

    if (isBrowser) {
        api.shim = api.createMissingNativeApi = shim;
        createAliasForDeprecatedMethod(api, "createMissingNativeApi", "shim");
    }

    function Module(name, dependencies, initializer) {
        this.name = name;
        this.dependencies = dependencies;
        this.initialized = false;
        this.supported = false;
        this.initializer = initializer;
    }

    Module.prototype = {
        init: function() {
            var requiredModuleNames = this.dependencies || [];
            for (var i = 0, len = requiredModuleNames.length, requiredModule, moduleName; i < len; ++i) {
                moduleName = requiredModuleNames[i];

                requiredModule = modules[moduleName];
                if (!requiredModule || !(requiredModule instanceof Module)) {
                    throw new Error("required module '" + moduleName + "' not found");
                }

                requiredModule.init();

                if (!requiredModule.supported) {
                    throw new Error("required module '" + moduleName + "' not supported");
                }
            }

            // Now run initializer
            this.initializer(this);
        },

        fail: function(reason) {
            this.initialized = true;
            this.supported = false;
            throw new Error(reason);
        },

        warn: function(msg) {
            api.warn("Module " + this.name + ": " + msg);
        },

        deprecationNotice: function(deprecated, replacement) {
            api.warn("DEPRECATED: " + deprecated + " in module " + this.name + " is deprecated. Please use " +
                replacement + " instead");
        },

        createError: function(msg) {
            return new Error("Error in Rangy " + this.name + " module: " + msg);
        }
    };

    function createModule(name, dependencies, initFunc) {
        var newModule = new Module(name, dependencies, function(module) {
            if (!module.initialized) {
                module.initialized = true;
                try {
                    initFunc(api, module);
                    module.supported = true;
                } catch (ex) {
                    var errorMessage = "Module '" + name + "' failed to load: " + getErrorDesc(ex);
                    consoleLog(errorMessage);
                    if (ex.stack) {
                        consoleLog(ex.stack);
                    }
                }
            }
        });
        modules[name] = newModule;
        return newModule;
    }

    api.createModule = function(name) {
        // Allow 2 or 3 arguments (second argument is an optional array of dependencies)
        var initFunc, dependencies;
        if (arguments.length == 2) {
            initFunc = arguments[1];
            dependencies = [];
        } else {
            initFunc = arguments[2];
            dependencies = arguments[1];
        }

        var module = createModule(name, dependencies, initFunc);

        // Initialize the module immediately if the core is already initialized
        if (api.initialized && api.supported) {
            module.init();
        }
    };

    api.createCoreModule = function(name, dependencies, initFunc) {
        createModule(name, dependencies, initFunc);
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Ensure rangy.rangePrototype and rangy.selectionPrototype are available immediately

    function RangePrototype() {}
    api.RangePrototype = RangePrototype;
    api.rangePrototype = new RangePrototype();

    function SelectionPrototype() {}
    api.selectionPrototype = new SelectionPrototype();

    /*----------------------------------------------------------------------------------------------------------------*/

    // DOM utility methods used by Rangy
    api.createCoreModule("DomUtil", [], function(api, module) {
        var UNDEF = "undefined";
        var util = api.util;
        var getBody = util.getBody;

        // Perform feature tests
        if (!util.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"])) {
            module.fail("document missing a Node creation method");
        }

        if (!util.isHostMethod(document, "getElementsByTagName")) {
            module.fail("document missing getElementsByTagName method");
        }

        var el = document.createElement("div");
        if (!util.areHostMethods(el, ["insertBefore", "appendChild", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]))) {
            module.fail("Incomplete Element implementation");
        }

        // innerHTML is required for Range's createContextualFragment method
        if (!util.isHostProperty(el, "innerHTML")) {
            module.fail("Element is missing innerHTML property");
        }

        var textNode = document.createTextNode("test");
        if (!util.areHostMethods(textNode, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]) ||
                !util.areHostProperties(textNode, ["data"]))) {
            module.fail("Incomplete Text Node implementation");
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Removed use of indexOf because of a bizarre bug in Opera that is thrown in one of the Acid3 tests. I haven't been
        // able to replicate it outside of the test. The bug is that indexOf returns -1 when called on an Array that
        // contains just the document as a single element and the value searched for is the document.
        var arrayContains = /*Array.prototype.indexOf ?
            function(arr, val) {
                return arr.indexOf(val) > -1;
            }:*/

            function(arr, val) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === val) {
                        return true;
                    }
                }
                return false;
            };

        // Opera 11 puts HTML elements in the null namespace, it seems, and IE 7 has undefined namespaceURI
        function isHtmlNamespace(node) {
            var ns;
            return typeof node.namespaceURI == UNDEF || ((ns = node.namespaceURI) === null || ns == "http://www.w3.org/1999/xhtml");
        }

        function parentElement(node) {
            var parent = node.parentNode;
            return (parent.nodeType == 1) ? parent : null;
        }

        function getNodeIndex(node) {
            var i = 0;
            while( (node = node.previousSibling) ) {
                ++i;
            }
            return i;
        }

        function getNodeLength(node) {
            switch (node.nodeType) {
                case 7:
                case 10:
                    return 0;
                case 3:
                case 8:
                    return node.length;
                default:
                    return node.childNodes.length;
            }
        }

        function getCommonAncestor(node1, node2) {
            var ancestors = [], n;
            for (n = node1; n; n = n.parentNode) {
                ancestors.push(n);
            }

            for (n = node2; n; n = n.parentNode) {
                if (arrayContains(ancestors, n)) {
                    return n;
                }
            }

            return null;
        }

        function isAncestorOf(ancestor, descendant, selfIsAncestor) {
            var n = selfIsAncestor ? descendant : descendant.parentNode;
            while (n) {
                if (n === ancestor) {
                    return true;
                } else {
                    n = n.parentNode;
                }
            }
            return false;
        }

        function isOrIsAncestorOf(ancestor, descendant) {
            return isAncestorOf(ancestor, descendant, true);
        }

        function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
            var p, n = selfIsAncestor ? node : node.parentNode;
            while (n) {
                p = n.parentNode;
                if (p === ancestor) {
                    return n;
                }
                n = p;
            }
            return null;
        }

        function isCharacterDataNode(node) {
            var t = node.nodeType;
            return t == 3 || t == 4 || t == 8 ; // Text, CDataSection or Comment
        }

        function isTextOrCommentNode(node) {
            if (!node) {
                return false;
            }
            var t = node.nodeType;
            return t == 3 || t == 8 ; // Text or Comment
        }

        function insertAfter(node, precedingNode) {
            var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
            if (nextNode) {
                parent.insertBefore(node, nextNode);
            } else {
                parent.appendChild(node);
            }
            return node;
        }

        // Note that we cannot use splitText() because it is bugridden in IE 9.
        function splitDataNode(node, index, positionsToPreserve) {
            var newNode = node.cloneNode(false);
            newNode.deleteData(0, index);
            node.deleteData(index, node.length - index);
            insertAfter(newNode, node);

            // Preserve positions
            if (positionsToPreserve) {
                for (var i = 0, position; position = positionsToPreserve[i++]; ) {
                    // Handle case where position was inside the portion of node after the split point
                    if (position.node == node && position.offset > index) {
                        position.node = newNode;
                        position.offset -= index;
                    }
                    // Handle the case where the position is a node offset within node's parent
                    else if (position.node == node.parentNode && position.offset > getNodeIndex(node)) {
                        ++position.offset;
                    }
                }
            }
            return newNode;
        }

        function getDocument(node) {
            if (node.nodeType == 9) {
                return node;
            } else if (typeof node.ownerDocument != UNDEF) {
                return node.ownerDocument;
            } else if (typeof node.document != UNDEF) {
                return node.document;
            } else if (node.parentNode) {
                return getDocument(node.parentNode);
            } else {
                throw module.createError("getDocument: no document found for node");
            }
        }

        function getWindow(node) {
            var doc = getDocument(node);
            if (typeof doc.defaultView != UNDEF) {
                return doc.defaultView;
            } else if (typeof doc.parentWindow != UNDEF) {
                return doc.parentWindow;
            } else {
                throw module.createError("Cannot get a window object for node");
            }
        }

        function getIframeDocument(iframeEl) {
            if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument;
            } else if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow.document;
            } else {
                throw module.createError("getIframeDocument: No Document object found for iframe element");
            }
        }

        function getIframeWindow(iframeEl) {
            if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow;
            } else if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument.defaultView;
            } else {
                throw module.createError("getIframeWindow: No Window object found for iframe element");
            }
        }

        // This looks bad. Is it worth it?
        function isWindow(obj) {
            return obj && util.isHostMethod(obj, "setTimeout") && util.isHostObject(obj, "document");
        }

        function getContentDocument(obj, module, methodName) {
            var doc;

            if (!obj) {
                doc = document;
            }

            // Test if a DOM node has been passed and obtain a document object for it if so
            else if (util.isHostProperty(obj, "nodeType")) {
                doc = (obj.nodeType == 1 && obj.tagName.toLowerCase() == "iframe") ?
                    getIframeDocument(obj) : getDocument(obj);
            }

            // Test if the doc parameter appears to be a Window object
            else if (isWindow(obj)) {
                doc = obj.document;
            }

            if (!doc) {
                throw module.createError(methodName + "(): Parameter must be a Window object or DOM node");
            }

            return doc;
        }

        function getRootContainer(node) {
            var parent;
            while ( (parent = node.parentNode) ) {
                node = parent;
            }
            return node;
        }

        function comparePoints(nodeA, offsetA, nodeB, offsetB) {
            // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
            var nodeC, root, childA, childB, n;
            if (nodeA == nodeB) {
                // Case 1: nodes are the same
                return offsetA === offsetB ? 0 : (offsetA < offsetB) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeB, nodeA, true)) ) {
                // Case 2: node C (container B or an ancestor) is a child node of A
                return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeA, nodeB, true)) ) {
                // Case 3: node C (container A or an ancestor) is a child node of B
                return getNodeIndex(nodeC) < offsetB  ? -1 : 1;
            } else {
                root = getCommonAncestor(nodeA, nodeB);
                if (!root) {
                    throw new Error("comparePoints error: nodes have no common ancestor");
                }

                // Case 4: containers are siblings or descendants of siblings
                childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
                childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

                if (childA === childB) {
                    // This shouldn't be possible
                    throw module.createError("comparePoints got to case 4 and childA and childB are the same!");
                } else {
                    n = root.firstChild;
                    while (n) {
                        if (n === childA) {
                            return -1;
                        } else if (n === childB) {
                            return 1;
                        }
                        n = n.nextSibling;
                    }
                }
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test for IE's crash (IE 6/7) or exception (IE >= 8) when a reference to garbage-collected text node is queried
        var crashyTextNodes = false;

        function isBrokenNode(node) {
            var n;
            try {
                n = node.parentNode;
                return false;
            } catch (e) {
                return true;
            }
        }

        (function() {
            var el = document.createElement("b");
            el.innerHTML = "1";
            var textNode = el.firstChild;
            el.innerHTML = "<br />";
            crashyTextNodes = isBrokenNode(textNode);

            api.features.crashyTextNodes = crashyTextNodes;
        })();

        /*----------------------------------------------------------------------------------------------------------------*/

        function inspectNode(node) {
            if (!node) {
                return "[No node]";
            }
            if (crashyTextNodes && isBrokenNode(node)) {
                return "[Broken node]";
            }
            if (isCharacterDataNode(node)) {
                return '"' + node.data + '"';
            }
            if (node.nodeType == 1) {
                var idAttr = node.id ? ' id="' + node.id + '"' : "";
                return "<" + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
            }
            return node.nodeName;
        }

        function fragmentFromNodeChildren(node) {
            var fragment = getDocument(node).createDocumentFragment(), child;
            while ( (child = node.firstChild) ) {
                fragment.appendChild(child);
            }
            return fragment;
        }

        var getComputedStyleProperty;
        if (typeof window.getComputedStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return getWindow(el).getComputedStyle(el, null)[propName];
            };
        } else if (typeof document.documentElement.currentStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return el.currentStyle ? el.currentStyle[propName] : "";
            };
        } else {
            module.fail("No means of obtaining computed style properties found");
        }

        function createTestElement(doc, html, contentEditable) {
            var body = getBody(doc);
            var el = doc.createElement("div");
            el.contentEditable = "" + !!contentEditable;
            if (html) {
                el.innerHTML = html;
            }

            // Insert the test element at the start of the body to prevent scrolling to the bottom in iOS (issue #292)
            var bodyFirstChild = body.firstChild;
            if (bodyFirstChild) {
                body.insertBefore(el, bodyFirstChild);
            } else {
                body.appendChild(el);
            }

            return el;
        }

        function removeNode(node) {
            return node.parentNode.removeChild(node);
        }

        function NodeIterator(root) {
            this.root = root;
            this._next = root;
        }

        NodeIterator.prototype = {
            _current: null,

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                var n = this._current = this._next;
                var child, next;
                if (this._current) {
                    child = n.firstChild;
                    if (child) {
                        this._next = child;
                    } else {
                        next = null;
                        while ((n !== this.root) && !(next = n.nextSibling)) {
                            n = n.parentNode;
                        }
                        this._next = next;
                    }
                }
                return this._current;
            },

            detach: function() {
                this._current = this._next = this.root = null;
            }
        };

        function createIterator(root) {
            return new NodeIterator(root);
        }

        function DomPosition(node, offset) {
            this.node = node;
            this.offset = offset;
        }

        DomPosition.prototype = {
            equals: function(pos) {
                return !!pos && this.node === pos.node && this.offset == pos.offset;
            },

            inspect: function() {
                return "[DomPosition(" + inspectNode(this.node) + ":" + this.offset + ")]";
            },

            toString: function() {
                return this.inspect();
            }
        };

        function DOMException(codeName) {
            this.code = this[codeName];
            this.codeName = codeName;
            this.message = "DOMException: " + this.codeName;
        }

        DOMException.prototype = {
            INDEX_SIZE_ERR: 1,
            HIERARCHY_REQUEST_ERR: 3,
            WRONG_DOCUMENT_ERR: 4,
            NO_MODIFICATION_ALLOWED_ERR: 7,
            NOT_FOUND_ERR: 8,
            NOT_SUPPORTED_ERR: 9,
            INVALID_STATE_ERR: 11,
            INVALID_NODE_TYPE_ERR: 24
        };

        DOMException.prototype.toString = function() {
            return this.message;
        };

        api.dom = {
            arrayContains: arrayContains,
            isHtmlNamespace: isHtmlNamespace,
            parentElement: parentElement,
            getNodeIndex: getNodeIndex,
            getNodeLength: getNodeLength,
            getCommonAncestor: getCommonAncestor,
            isAncestorOf: isAncestorOf,
            isOrIsAncestorOf: isOrIsAncestorOf,
            getClosestAncestorIn: getClosestAncestorIn,
            isCharacterDataNode: isCharacterDataNode,
            isTextOrCommentNode: isTextOrCommentNode,
            insertAfter: insertAfter,
            splitDataNode: splitDataNode,
            getDocument: getDocument,
            getWindow: getWindow,
            getIframeWindow: getIframeWindow,
            getIframeDocument: getIframeDocument,
            getBody: getBody,
            isWindow: isWindow,
            getContentDocument: getContentDocument,
            getRootContainer: getRootContainer,
            comparePoints: comparePoints,
            isBrokenNode: isBrokenNode,
            inspectNode: inspectNode,
            getComputedStyleProperty: getComputedStyleProperty,
            createTestElement: createTestElement,
            removeNode: removeNode,
            fragmentFromNodeChildren: fragmentFromNodeChildren,
            createIterator: createIterator,
            DomPosition: DomPosition
        };

        api.DOMException = DOMException;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Pure JavaScript implementation of DOM Range
    api.createCoreModule("DomRange", ["DomUtil"], function(api, module) {
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DOMException = api.DOMException;

        var isCharacterDataNode = dom.isCharacterDataNode;
        var getNodeIndex = dom.getNodeIndex;
        var isOrIsAncestorOf = dom.isOrIsAncestorOf;
        var getDocument = dom.getDocument;
        var comparePoints = dom.comparePoints;
        var splitDataNode = dom.splitDataNode;
        var getClosestAncestorIn = dom.getClosestAncestorIn;
        var getNodeLength = dom.getNodeLength;
        var arrayContains = dom.arrayContains;
        var getRootContainer = dom.getRootContainer;
        var crashyTextNodes = api.features.crashyTextNodes;

        var removeNode = dom.removeNode;

        /*----------------------------------------------------------------------------------------------------------------*/

        // Utility functions

        function isNonTextPartiallySelected(node, range) {
            return (node.nodeType != 3) &&
                   (isOrIsAncestorOf(node, range.startContainer) || isOrIsAncestorOf(node, range.endContainer));
        }

        function getRangeDocument(range) {
            return range.document || getDocument(range.startContainer);
        }

        function getRangeRoot(range) {
            return getRootContainer(range.startContainer);
        }

        function getBoundaryBeforeNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node));
        }

        function getBoundaryAfterNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node) + 1);
        }

        function insertNodeAtPosition(node, n, o) {
            var firstNodeInserted = node.nodeType == 11 ? node.firstChild : node;
            if (isCharacterDataNode(n)) {
                if (o == n.length) {
                    dom.insertAfter(node, n);
                } else {
                    n.parentNode.insertBefore(node, o == 0 ? n : splitDataNode(n, o));
                }
            } else if (o >= n.childNodes.length) {
                n.appendChild(node);
            } else {
                n.insertBefore(node, n.childNodes[o]);
            }
            return firstNodeInserted;
        }

        function rangesIntersect(rangeA, rangeB, touchingIsIntersecting) {
            assertRangeValid(rangeA);
            assertRangeValid(rangeB);

            if (getRangeDocument(rangeB) != getRangeDocument(rangeA)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }

            var startComparison = comparePoints(rangeA.startContainer, rangeA.startOffset, rangeB.endContainer, rangeB.endOffset),
                endComparison = comparePoints(rangeA.endContainer, rangeA.endOffset, rangeB.startContainer, rangeB.startOffset);

            return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
        }

        function cloneSubtree(iterator) {
            var partiallySelected;
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {
                partiallySelected = iterator.isPartiallySelectedSubtree();
                node = node.cloneNode(!partiallySelected);
                if (partiallySelected) {
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(cloneSubtree(subIterator));
                    subIterator.detach();
                }

                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function iterateSubtree(rangeIterator, func, iteratorState) {
            var it, n;
            iteratorState = iteratorState || { stop: false };
            for (var node, subRangeIterator; node = rangeIterator.next(); ) {
                if (rangeIterator.isPartiallySelectedSubtree()) {
                    if (func(node) === false) {
                        iteratorState.stop = true;
                        return;
                    } else {
                        // The node is partially selected by the Range, so we can use a new RangeIterator on the portion of
                        // the node selected by the Range.
                        subRangeIterator = rangeIterator.getSubtreeIterator();
                        iterateSubtree(subRangeIterator, func, iteratorState);
                        subRangeIterator.detach();
                        if (iteratorState.stop) {
                            return;
                        }
                    }
                } else {
                    // The whole node is selected, so we can use efficient DOM iteration to iterate over the node and its
                    // descendants
                    it = dom.createIterator(node);
                    while ( (n = it.next()) ) {
                        if (func(n) === false) {
                            iteratorState.stop = true;
                            return;
                        }
                    }
                }
            }
        }

        function deleteSubtree(iterator) {
            var subIterator;
            while (iterator.next()) {
                if (iterator.isPartiallySelectedSubtree()) {
                    subIterator = iterator.getSubtreeIterator();
                    deleteSubtree(subIterator);
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
            }
        }

        function extractSubtree(iterator) {
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {

                if (iterator.isPartiallySelectedSubtree()) {
                    node = node.cloneNode(false);
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(extractSubtree(subIterator));
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function getNodesInRange(range, nodeTypes, filter) {
            var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
            var filterExists = !!filter;
            if (filterNodeTypes) {
                regex = new RegExp("^(" + nodeTypes.join("|") + ")$");
            }

            var nodes = [];
            iterateSubtree(new RangeIterator(range, false), function(node) {
                if (filterNodeTypes && !regex.test(node.nodeType)) {
                    return;
                }
                if (filterExists && !filter(node)) {
                    return;
                }
                // Don't include a boundary container if it is a character data node and the range does not contain any
                // of its character data. See issue 190.
                var sc = range.startContainer;
                if (node == sc && isCharacterDataNode(sc) && range.startOffset == sc.length) {
                    return;
                }

                var ec = range.endContainer;
                if (node == ec && isCharacterDataNode(ec) && range.endOffset == 0) {
                    return;
                }

                nodes.push(node);
            });
            return nodes;
        }

        function inspect(range) {
            var name = (typeof range.getName == "undefined") ? "Range" : range.getName();
            return "[" + name + "(" + dom.inspectNode(range.startContainer) + ":" + range.startOffset + ", " +
                    dom.inspectNode(range.endContainer) + ":" + range.endOffset + ")]";
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // RangeIterator code partially borrows from IERange by Tim Ryan (http://github.com/timcameronryan/IERange)

        function RangeIterator(range, clonePartiallySelectedTextNodes) {
            this.range = range;
            this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;


            if (!range.collapsed) {
                this.sc = range.startContainer;
                this.so = range.startOffset;
                this.ec = range.endContainer;
                this.eo = range.endOffset;
                var root = range.commonAncestorContainer;

                if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
                    this.isSingleCharacterDataNode = true;
                    this._first = this._last = this._next = this.sc;
                } else {
                    this._first = this._next = (this.sc === root && !isCharacterDataNode(this.sc)) ?
                        this.sc.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);
                    this._last = (this.ec === root && !isCharacterDataNode(this.ec)) ?
                        this.ec.childNodes[this.eo - 1] : getClosestAncestorIn(this.ec, root, true);
                }
            }
        }

        RangeIterator.prototype = {
            _current: null,
            _next: null,
            _first: null,
            _last: null,
            isSingleCharacterDataNode: false,

            reset: function() {
                this._current = null;
                this._next = this._first;
            },

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                // Move to next node
                var current = this._current = this._next;
                if (current) {
                    this._next = (current !== this._last) ? current.nextSibling : null;

                    // Check for partially selected text nodes
                    if (isCharacterDataNode(current) && this.clonePartiallySelectedTextNodes) {
                        if (current === this.ec) {
                            (current = current.cloneNode(true)).deleteData(this.eo, current.length - this.eo);
                        }
                        if (this._current === this.sc) {
                            (current = current.cloneNode(true)).deleteData(0, this.so);
                        }
                    }
                }

                return current;
            },

            remove: function() {
                var current = this._current, start, end;

                if (isCharacterDataNode(current) && (current === this.sc || current === this.ec)) {
                    start = (current === this.sc) ? this.so : 0;
                    end = (current === this.ec) ? this.eo : current.length;
                    if (start != end) {
                        current.deleteData(start, end - start);
                    }
                } else {
                    if (current.parentNode) {
                        removeNode(current);
                    } else {
                    }
                }
            },

            // Checks if the current node is partially selected
            isPartiallySelectedSubtree: function() {
                var current = this._current;
                return isNonTextPartiallySelected(current, this.range);
            },

            getSubtreeIterator: function() {
                var subRange;
                if (this.isSingleCharacterDataNode) {
                    subRange = this.range.cloneRange();
                    subRange.collapse(false);
                } else {
                    subRange = new Range(getRangeDocument(this.range));
                    var current = this._current;
                    var startContainer = current, startOffset = 0, endContainer = current, endOffset = getNodeLength(current);

                    if (isOrIsAncestorOf(current, this.sc)) {
                        startContainer = this.sc;
                        startOffset = this.so;
                    }
                    if (isOrIsAncestorOf(current, this.ec)) {
                        endContainer = this.ec;
                        endOffset = this.eo;
                    }

                    updateBoundaries(subRange, startContainer, startOffset, endContainer, endOffset);
                }
                return new RangeIterator(subRange, this.clonePartiallySelectedTextNodes);
            },

            detach: function() {
                this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null;
            }
        };

        /*----------------------------------------------------------------------------------------------------------------*/

        var beforeAfterNodeTypes = [1, 3, 4, 5, 7, 8, 10];
        var rootContainerNodeTypes = [2, 9, 11];
        var readonlyNodeTypes = [5, 6, 10, 12];
        var insertableNodeTypes = [1, 3, 4, 5, 7, 8, 10, 11];
        var surroundNodeTypes = [1, 3, 4, 5, 7, 8];

        function createAncestorFinder(nodeTypes) {
            return function(node, selfIsAncestor) {
                var t, n = selfIsAncestor ? node : node.parentNode;
                while (n) {
                    t = n.nodeType;
                    if (arrayContains(nodeTypes, t)) {
                        return n;
                    }
                    n = n.parentNode;
                }
                return null;
            };
        }

        var getDocumentOrFragmentContainer = createAncestorFinder( [9, 11] );
        var getReadonlyAncestor = createAncestorFinder(readonlyNodeTypes);
        var getDocTypeNotationEntityAncestor = createAncestorFinder( [6, 10, 12] );

        function assertNoDocTypeNotationEntityAncestor(node, allowSelf) {
            if (getDocTypeNotationEntityAncestor(node, allowSelf)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidNodeType(node, invalidTypes) {
            if (!arrayContains(invalidTypes, node.nodeType)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidOffset(node, offset) {
            if (offset < 0 || offset > (isCharacterDataNode(node) ? node.length : node.childNodes.length)) {
                throw new DOMException("INDEX_SIZE_ERR");
            }
        }

        function assertSameDocumentOrFragment(node1, node2) {
            if (getDocumentOrFragmentContainer(node1, true) !== getDocumentOrFragmentContainer(node2, true)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        function assertNodeNotReadOnly(node) {
            if (getReadonlyAncestor(node, true)) {
                throw new DOMException("NO_MODIFICATION_ALLOWED_ERR");
            }
        }

        function assertNode(node, codeName) {
            if (!node) {
                throw new DOMException(codeName);
            }
        }

        function isValidOffset(node, offset) {
            return offset <= (isCharacterDataNode(node) ? node.length : node.childNodes.length);
        }

        function isRangeValid(range) {
            return (!!range.startContainer && !!range.endContainer &&
                    !(crashyTextNodes && (dom.isBrokenNode(range.startContainer) || dom.isBrokenNode(range.endContainer))) &&
                    getRootContainer(range.startContainer) == getRootContainer(range.endContainer) &&
                    isValidOffset(range.startContainer, range.startOffset) &&
                    isValidOffset(range.endContainer, range.endOffset));
        }

        function assertRangeValid(range) {
            if (!isRangeValid(range)) {
                throw new Error("Range error: Range is not valid. This usually happens after DOM mutation. Range: (" + range.inspect() + ")");
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test the browser's innerHTML support to decide how to implement createContextualFragment
        var styleEl = document.createElement("style");
        var htmlParsingConforms = false;
        try {
            styleEl.innerHTML = "<b>x</b>";
            htmlParsingConforms = (styleEl.firstChild.nodeType == 3); // Opera incorrectly creates an element node
        } catch (e) {
            // IE 6 and 7 throw
        }

        api.features.htmlParsingConforms = htmlParsingConforms;

        var createContextualFragment = htmlParsingConforms ?

            // Implementation as per HTML parsing spec, trusting in the browser's implementation of innerHTML. See
            // discussion and base code for this implementation at issue 67.
            // Spec: http://html5.org/specs/dom-parsing.html#extensions-to-the-range-interface
            // Thanks to Aleks Williams.
            function(fragmentStr) {
                // "Let node the context object's start's node."
                var node = this.startContainer;
                var doc = getDocument(node);

                // "If the context object's start's node is null, raise an INVALID_STATE_ERR
                // exception and abort these steps."
                if (!node) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // "Let element be as follows, depending on node's interface:"
                // Document, Document Fragment: null
                var el = null;

                // "Element: node"
                if (node.nodeType == 1) {
                    el = node;

                // "Text, Comment: node's parentElement"
                } else if (isCharacterDataNode(node)) {
                    el = dom.parentElement(node);
                }

                // "If either element is null or element's ownerDocument is an HTML document
                // and element's local name is "html" and element's namespace is the HTML
                // namespace"
                if (el === null || (
                    el.nodeName == "HTML" &&
                    dom.isHtmlNamespace(getDocument(el).documentElement) &&
                    dom.isHtmlNamespace(el)
                )) {

                // "let element be a new Element with "body" as its local name and the HTML
                // namespace as its namespace.""
                    el = doc.createElement("body");
                } else {
                    el = el.cloneNode(false);
                }

                // "If the node's document is an HTML document: Invoke the HTML fragment parsing algorithm."
                // "If the node's document is an XML document: Invoke the XML fragment parsing algorithm."
                // "In either case, the algorithm must be invoked with fragment as the input
                // and element as the context element."
                el.innerHTML = fragmentStr;

                // "If this raises an exception, then abort these steps. Otherwise, let new
                // children be the nodes returned."

                // "Let fragment be a new DocumentFragment."
                // "Append all new children to fragment."
                // "Return fragment."
                return dom.fragmentFromNodeChildren(el);
            } :

            // In this case, innerHTML cannot be trusted, so fall back to a simpler, non-conformant implementation that
            // previous versions of Rangy used (with the exception of using a body element rather than a div)
            function(fragmentStr) {
                var doc = getRangeDocument(this);
                var el = doc.createElement("body");
                el.innerHTML = fragmentStr;

                return dom.fragmentFromNodeChildren(el);
            };

        function splitRangeBoundaries(range, positionsToPreserve) {
            assertRangeValid(range);

            var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
            var startEndSame = (sc === ec);

            if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
                splitDataNode(ec, eo, positionsToPreserve);
            }

            if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
                sc = splitDataNode(sc, so, positionsToPreserve);
                if (startEndSame) {
                    eo -= so;
                    ec = sc;
                } else if (ec == sc.parentNode && eo >= getNodeIndex(sc)) {
                    eo++;
                }
                so = 0;
            }
            range.setStartAndEnd(sc, so, ec, eo);
        }

        function rangeToHtml(range) {
            assertRangeValid(range);
            var container = range.commonAncestorContainer.parentNode.cloneNode(false);
            container.appendChild( range.cloneContents() );
            return container.innerHTML;
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        var rangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
            "commonAncestorContainer"];

        var s2s = 0, s2e = 1, e2e = 2, e2s = 3;
        var n_b = 0, n_a = 1, n_b_a = 2, n_i = 3;

        util.extend(api.rangePrototype, {
            compareBoundaryPoints: function(how, range) {
                assertRangeValid(this);
                assertSameDocumentOrFragment(this.startContainer, range.startContainer);

                var nodeA, offsetA, nodeB, offsetB;
                var prefixA = (how == e2s || how == s2s) ? "start" : "end";
                var prefixB = (how == s2e || how == s2s) ? "start" : "end";
                nodeA = this[prefixA + "Container"];
                offsetA = this[prefixA + "Offset"];
                nodeB = range[prefixB + "Container"];
                offsetB = range[prefixB + "Offset"];
                return comparePoints(nodeA, offsetA, nodeB, offsetB);
            },

            insertNode: function(node) {
                assertRangeValid(this);
                assertValidNodeType(node, insertableNodeTypes);
                assertNodeNotReadOnly(this.startContainer);

                if (isOrIsAncestorOf(node, this.startContainer)) {
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }

                // No check for whether the container of the start of the Range is of a type that does not allow
                // children of the type of node: the browser's DOM implementation should do this for us when we attempt
                // to add the node

                var firstNodeInserted = insertNodeAtPosition(node, this.startContainer, this.startOffset);
                this.setStartBefore(firstNodeInserted);
            },

            cloneContents: function() {
                assertRangeValid(this);

                var clone, frag;
                if (this.collapsed) {
                    return getRangeDocument(this).createDocumentFragment();
                } else {
                    if (this.startContainer === this.endContainer && isCharacterDataNode(this.startContainer)) {
                        clone = this.startContainer.cloneNode(true);
                        clone.data = clone.data.slice(this.startOffset, this.endOffset);
                        frag = getRangeDocument(this).createDocumentFragment();
                        frag.appendChild(clone);
                        return frag;
                    } else {
                        var iterator = new RangeIterator(this, true);
                        clone = cloneSubtree(iterator);
                        iterator.detach();
                    }
                    return clone;
                }
            },

            canSurroundContents: function() {
                assertRangeValid(this);
                assertNodeNotReadOnly(this.startContainer);
                assertNodeNotReadOnly(this.endContainer);

                // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                // no non-text nodes.
                var iterator = new RangeIterator(this, true);
                var boundariesInvalid = (iterator._first && (isNonTextPartiallySelected(iterator._first, this)) ||
                        (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                iterator.detach();
                return !boundariesInvalid;
            },

            surroundContents: function(node) {
                assertValidNodeType(node, surroundNodeTypes);

                if (!this.canSurroundContents()) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // Extract the contents
                var content = this.extractContents();

                // Clear the children of the node
                if (node.hasChildNodes()) {
                    while (node.lastChild) {
                        node.removeChild(node.lastChild);
                    }
                }

                // Insert the new node and add the extracted contents
                insertNodeAtPosition(node, this.startContainer, this.startOffset);
                node.appendChild(content);

                this.selectNode(node);
            },

            cloneRange: function() {
                assertRangeValid(this);
                var range = new Range(getRangeDocument(this));
                var i = rangeProperties.length, prop;
                while (i--) {
                    prop = rangeProperties[i];
                    range[prop] = this[prop];
                }
                return range;
            },

            toString: function() {
                assertRangeValid(this);
                var sc = this.startContainer;
                if (sc === this.endContainer && isCharacterDataNode(sc)) {
                    return (sc.nodeType == 3 || sc.nodeType == 4) ? sc.data.slice(this.startOffset, this.endOffset) : "";
                } else {
                    var textParts = [], iterator = new RangeIterator(this, true);
                    iterateSubtree(iterator, function(node) {
                        // Accept only text or CDATA nodes, not comments
                        if (node.nodeType == 3 || node.nodeType == 4) {
                            textParts.push(node.data);
                        }
                    });
                    iterator.detach();
                    return textParts.join("");
                }
            },

            // The methods below are all non-standard. The following batch were introduced by Mozilla but have since
            // been removed from Mozilla.

            compareNode: function(node) {
                assertRangeValid(this);

                var parent = node.parentNode;
                var nodeIndex = getNodeIndex(node);

                if (!parent) {
                    throw new DOMException("NOT_FOUND_ERR");
                }

                var startComparison = this.comparePoint(parent, nodeIndex),
                    endComparison = this.comparePoint(parent, nodeIndex + 1);

                if (startComparison < 0) { // Node starts before
                    return (endComparison > 0) ? n_b_a : n_b;
                } else {
                    return (endComparison > 0) ? n_a : n_i;
                }
            },

            comparePoint: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                if (comparePoints(node, offset, this.startContainer, this.startOffset) < 0) {
                    return -1;
                } else if (comparePoints(node, offset, this.endContainer, this.endOffset) > 0) {
                    return 1;
                }
                return 0;
            },

            createContextualFragment: createContextualFragment,

            toHtml: function() {
                return rangeToHtml(this);
            },

            // touchingIsIntersecting determines whether this method considers a node that borders a range intersects
            // with it (as in WebKit) or not (as in Gecko pre-1.9, and the default)
            intersectsNode: function(node, touchingIsIntersecting) {
                assertRangeValid(this);
                if (getRootContainer(node) != getRangeRoot(this)) {
                    return false;
                }

                var parent = node.parentNode, offset = getNodeIndex(node);
                if (!parent) {
                    return true;
                }

                var startComparison = comparePoints(parent, offset, this.endContainer, this.endOffset),
                    endComparison = comparePoints(parent, offset + 1, this.startContainer, this.startOffset);

                return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
            },

            isPointInRange: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                return (comparePoints(node, offset, this.startContainer, this.startOffset) >= 0) &&
                       (comparePoints(node, offset, this.endContainer, this.endOffset) <= 0);
            },

            // The methods below are non-standard and invented by me.

            // Sharing a boundary start-to-end or end-to-start does not count as intersection.
            intersectsRange: function(range) {
                return rangesIntersect(this, range, false);
            },

            // Sharing a boundary start-to-end or end-to-start does count as intersection.
            intersectsOrTouchesRange: function(range) {
                return rangesIntersect(this, range, true);
            },

            intersection: function(range) {
                if (this.intersectsRange(range)) {
                    var startComparison = comparePoints(this.startContainer, this.startOffset, range.startContainer, range.startOffset),
                        endComparison = comparePoints(this.endContainer, this.endOffset, range.endContainer, range.endOffset);

                    var intersectionRange = this.cloneRange();
                    if (startComparison == -1) {
                        intersectionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (endComparison == 1) {
                        intersectionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return intersectionRange;
                }
                return null;
            },

            union: function(range) {
                if (this.intersectsOrTouchesRange(range)) {
                    var unionRange = this.cloneRange();
                    if (comparePoints(range.startContainer, range.startOffset, this.startContainer, this.startOffset) == -1) {
                        unionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (comparePoints(range.endContainer, range.endOffset, this.endContainer, this.endOffset) == 1) {
                        unionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return unionRange;
                } else {
                    throw new DOMException("Ranges do not intersect");
                }
            },

            containsNode: function(node, allowPartial) {
                if (allowPartial) {
                    return this.intersectsNode(node, false);
                } else {
                    return this.compareNode(node) == n_i;
                }
            },

            containsNodeContents: function(node) {
                return this.comparePoint(node, 0) >= 0 && this.comparePoint(node, getNodeLength(node)) <= 0;
            },

            containsRange: function(range) {
                var intersection = this.intersection(range);
                return intersection !== null && range.equals(intersection);
            },

            containsNodeText: function(node) {
                var nodeRange = this.cloneRange();
                nodeRange.selectNode(node);
                var textNodes = nodeRange.getNodes([3]);
                if (textNodes.length > 0) {
                    nodeRange.setStart(textNodes[0], 0);
                    var lastTextNode = textNodes.pop();
                    nodeRange.setEnd(lastTextNode, lastTextNode.length);
                    return this.containsRange(nodeRange);
                } else {
                    return this.containsNodeContents(node);
                }
            },

            getNodes: function(nodeTypes, filter) {
                assertRangeValid(this);
                return getNodesInRange(this, nodeTypes, filter);
            },

            getDocument: function() {
                return getRangeDocument(this);
            },

            collapseBefore: function(node) {
                this.setEndBefore(node);
                this.collapse(false);
            },

            collapseAfter: function(node) {
                this.setStartAfter(node);
                this.collapse(true);
            },

            getBookmark: function(containerNode) {
                var doc = getRangeDocument(this);
                var preSelectionRange = api.createRange(doc);
                containerNode = containerNode || dom.getBody(doc);
                preSelectionRange.selectNodeContents(containerNode);
                var range = this.intersection(preSelectionRange);
                var start = 0, end = 0;
                if (range) {
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;
                    end = start + range.toString().length;
                }

                return {
                    start: start,
                    end: end,
                    containerNode: containerNode
                };
            },

            moveToBookmark: function(bookmark) {
                var containerNode = bookmark.containerNode;
                var charIndex = 0;
                this.setStart(containerNode, 0);
                this.collapse(true);
                var nodeStack = [containerNode], node, foundStart = false, stop = false;
                var nextCharIndex, i, childNodes;

                while (!stop && (node = nodeStack.pop())) {
                    if (node.nodeType == 3) {
                        nextCharIndex = charIndex + node.length;
                        if (!foundStart && bookmark.start >= charIndex && bookmark.start <= nextCharIndex) {
                            this.setStart(node, bookmark.start - charIndex);
                            foundStart = true;
                        }
                        if (foundStart && bookmark.end >= charIndex && bookmark.end <= nextCharIndex) {
                            this.setEnd(node, bookmark.end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    } else {
                        childNodes = node.childNodes;
                        i = childNodes.length;
                        while (i--) {
                            nodeStack.push(childNodes[i]);
                        }
                    }
                }
            },

            getName: function() {
                return "DomRange";
            },

            equals: function(range) {
                return Range.rangesEqual(this, range);
            },

            isValid: function() {
                return isRangeValid(this);
            },

            inspect: function() {
                return inspect(this);
            },

            detach: function() {
                // In DOM4, detach() is now a no-op.
            }
        });

        function copyComparisonConstantsToObject(obj) {
            obj.START_TO_START = s2s;
            obj.START_TO_END = s2e;
            obj.END_TO_END = e2e;
            obj.END_TO_START = e2s;

            obj.NODE_BEFORE = n_b;
            obj.NODE_AFTER = n_a;
            obj.NODE_BEFORE_AND_AFTER = n_b_a;
            obj.NODE_INSIDE = n_i;
        }

        function copyComparisonConstants(constructor) {
            copyComparisonConstantsToObject(constructor);
            copyComparisonConstantsToObject(constructor.prototype);
        }

        function createRangeContentRemover(remover, boundaryUpdater) {
            return function() {
                assertRangeValid(this);

                var sc = this.startContainer, so = this.startOffset, root = this.commonAncestorContainer;

                var iterator = new RangeIterator(this, true);

                // Work out where to position the range after content removal
                var node, boundary;
                if (sc !== root) {
                    node = getClosestAncestorIn(sc, root, true);
                    boundary = getBoundaryAfterNode(node);
                    sc = boundary.node;
                    so = boundary.offset;
                }

                // Check none of the range is read-only
                iterateSubtree(iterator, assertNodeNotReadOnly);

                iterator.reset();

                // Remove the content
                var returnValue = remover(iterator);
                iterator.detach();

                // Move to the new position
                boundaryUpdater(this, sc, so, sc, so);

                return returnValue;
            };
        }

        function createPrototypeRange(constructor, boundaryUpdater) {
            function createBeforeAfterNodeSetter(isBefore, isStart) {
                return function(node) {
                    assertValidNodeType(node, beforeAfterNodeTypes);
                    assertValidNodeType(getRootContainer(node), rootContainerNodeTypes);

                    var boundary = (isBefore ? getBoundaryBeforeNode : getBoundaryAfterNode)(node);
                    (isStart ? setRangeStart : setRangeEnd)(this, boundary.node, boundary.offset);
                };
            }

            function setRangeStart(range, node, offset) {
                var ec = range.endContainer, eo = range.endOffset;
                if (node !== range.startContainer || offset !== range.startOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(ec) || comparePoints(node, offset, ec, eo) == 1) {
                        ec = node;
                        eo = offset;
                    }
                    boundaryUpdater(range, node, offset, ec, eo);
                }
            }

            function setRangeEnd(range, node, offset) {
                var sc = range.startContainer, so = range.startOffset;
                if (node !== range.endContainer || offset !== range.endOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(sc) || comparePoints(node, offset, sc, so) == -1) {
                        sc = node;
                        so = offset;
                    }
                    boundaryUpdater(range, sc, so, node, offset);
                }
            }

            // Set up inheritance
            var F = function() {};
            F.prototype = api.rangePrototype;
            constructor.prototype = new F();

            util.extend(constructor.prototype, {
                setStart: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeStart(this, node, offset);
                },

                setEnd: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeEnd(this, node, offset);
                },

                /**
                 * Convenience method to set a range's start and end boundaries. Overloaded as follows:
                 * - Two parameters (node, offset) creates a collapsed range at that position
                 * - Three parameters (node, startOffset, endOffset) creates a range contained with node starting at
                 *   startOffset and ending at endOffset
                 * - Four parameters (startNode, startOffset, endNode, endOffset) creates a range starting at startOffset in
                 *   startNode and ending at endOffset in endNode
                 */
                setStartAndEnd: function() {
                    var args = arguments;
                    var sc = args[0], so = args[1], ec = sc, eo = so;

                    switch (args.length) {
                        case 3:
                            eo = args[2];
                            break;
                        case 4:
                            ec = args[2];
                            eo = args[3];
                            break;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },

                setBoundary: function(node, offset, isStart) {
                    this["set" + (isStart ? "Start" : "End")](node, offset);
                },

                setStartBefore: createBeforeAfterNodeSetter(true, true),
                setStartAfter: createBeforeAfterNodeSetter(false, true),
                setEndBefore: createBeforeAfterNodeSetter(true, false),
                setEndAfter: createBeforeAfterNodeSetter(false, false),

                collapse: function(isStart) {
                    assertRangeValid(this);
                    if (isStart) {
                        boundaryUpdater(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset);
                    } else {
                        boundaryUpdater(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset);
                    }
                },

                selectNodeContents: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, true);

                    boundaryUpdater(this, node, 0, node, getNodeLength(node));
                },

                selectNode: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, false);
                    assertValidNodeType(node, beforeAfterNodeTypes);

                    var start = getBoundaryBeforeNode(node), end = getBoundaryAfterNode(node);
                    boundaryUpdater(this, start.node, start.offset, end.node, end.offset);
                },

                extractContents: createRangeContentRemover(extractSubtree, boundaryUpdater),

                deleteContents: createRangeContentRemover(deleteSubtree, boundaryUpdater),

                canSurroundContents: function() {
                    assertRangeValid(this);
                    assertNodeNotReadOnly(this.startContainer);
                    assertNodeNotReadOnly(this.endContainer);

                    // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                    // no non-text nodes.
                    var iterator = new RangeIterator(this, true);
                    var boundariesInvalid = (iterator._first && isNonTextPartiallySelected(iterator._first, this) ||
                            (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                    iterator.detach();
                    return !boundariesInvalid;
                },

                splitBoundaries: function() {
                    splitRangeBoundaries(this);
                },

                splitBoundariesPreservingPositions: function(positionsToPreserve) {
                    splitRangeBoundaries(this, positionsToPreserve);
                },

                normalizeBoundaries: function() {
                    assertRangeValid(this);

                    var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;

                    var mergeForward = function(node) {
                        var sibling = node.nextSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            ec = node;
                            eo = node.length;
                            node.appendData(sibling.data);
                            removeNode(sibling);
                        }
                    };

                    var mergeBackward = function(node) {
                        var sibling = node.previousSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            sc = node;
                            var nodeLength = node.length;
                            so = sibling.length;
                            node.insertData(0, sibling.data);
                            removeNode(sibling);
                            if (sc == ec) {
                                eo += so;
                                ec = sc;
                            } else if (ec == node.parentNode) {
                                var nodeIndex = getNodeIndex(node);
                                if (eo == nodeIndex) {
                                    ec = node;
                                    eo = nodeLength;
                                } else if (eo > nodeIndex) {
                                    eo--;
                                }
                            }
                        }
                    };

                    var normalizeStart = true;
                    var sibling;

                    if (isCharacterDataNode(ec)) {
                        if (eo == ec.length) {
                            mergeForward(ec);
                        } else if (eo == 0) {
                            sibling = ec.previousSibling;
                            if (sibling && sibling.nodeType == ec.nodeType) {
                                eo = sibling.length;
                                if (sc == ec) {
                                    normalizeStart = false;
                                }
                                sibling.appendData(ec.data);
                                removeNode(ec);
                                ec = sibling;
                            }
                        }
                    } else {
                        if (eo > 0) {
                            var endNode = ec.childNodes[eo - 1];
                            if (endNode && isCharacterDataNode(endNode)) {
                                mergeForward(endNode);
                            }
                        }
                        normalizeStart = !this.collapsed;
                    }

                    if (normalizeStart) {
                        if (isCharacterDataNode(sc)) {
                            if (so == 0) {
                                mergeBackward(sc);
                            } else if (so == sc.length) {
                                sibling = sc.nextSibling;
                                if (sibling && sibling.nodeType == sc.nodeType) {
                                    if (ec == sibling) {
                                        ec = sc;
                                        eo += sc.length;
                                    }
                                    sc.appendData(sibling.data);
                                    removeNode(sibling);
                                }
                            }
                        } else {
                            if (so < sc.childNodes.length) {
                                var startNode = sc.childNodes[so];
                                if (startNode && isCharacterDataNode(startNode)) {
                                    mergeBackward(startNode);
                                }
                            }
                        }
                    } else {
                        sc = ec;
                        so = eo;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },

                collapseToPoint: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);
                    this.setStartAndEnd(node, offset);
                }
            });

            copyComparisonConstants(constructor);
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Updates commonAncestorContainer and collapsed after boundary change
        function updateCollapsedAndCommonAncestor(range) {
            range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
            range.commonAncestorContainer = range.collapsed ?
                range.startContainer : dom.getCommonAncestor(range.startContainer, range.endContainer);
        }

        function updateBoundaries(range, startContainer, startOffset, endContainer, endOffset) {
            range.startContainer = startContainer;
            range.startOffset = startOffset;
            range.endContainer = endContainer;
            range.endOffset = endOffset;
            range.document = dom.getDocument(startContainer);

            updateCollapsedAndCommonAncestor(range);
        }

        function Range(doc) {
            this.startContainer = doc;
            this.startOffset = 0;
            this.endContainer = doc;
            this.endOffset = 0;
            this.document = doc;
            updateCollapsedAndCommonAncestor(this);
        }

        createPrototypeRange(Range, updateBoundaries);

        util.extend(Range, {
            rangeProperties: rangeProperties,
            RangeIterator: RangeIterator,
            copyComparisonConstants: copyComparisonConstants,
            createPrototypeRange: createPrototypeRange,
            inspect: inspect,
            toHtml: rangeToHtml,
            getRangeDocument: getRangeDocument,
            rangesEqual: function(r1, r2) {
                return r1.startContainer === r2.startContainer &&
                    r1.startOffset === r2.startOffset &&
                    r1.endContainer === r2.endContainer &&
                    r1.endOffset === r2.endOffset;
            }
        });

        api.DomRange = Range;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Wrappers for the browser's native DOM Range and/or TextRange implementation
    api.createCoreModule("WrappedRange", ["DomRange"], function(api, module) {
        var WrappedRange, WrappedTextRange;
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DomRange = api.DomRange;
        var getBody = dom.getBody;
        var getContentDocument = dom.getContentDocument;
        var isCharacterDataNode = dom.isCharacterDataNode;


        /*----------------------------------------------------------------------------------------------------------------*/

        if (api.features.implementsDomRange) {
            // This is a wrapper around the browser's native DOM Range. It has two aims:
            // - Provide workarounds for specific browser bugs
            // - provide convenient extensions, which are inherited from Rangy's DomRange

            (function() {
                var rangeProto;
                var rangeProperties = DomRange.rangeProperties;

                function updateRangeProperties(range) {
                    var i = rangeProperties.length, prop;
                    while (i--) {
                        prop = rangeProperties[i];
                        range[prop] = range.nativeRange[prop];
                    }
                    // Fix for broken collapsed property in IE 9.
                    range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
                }

                function updateNativeRange(range, startContainer, startOffset, endContainer, endOffset) {
                    var startMoved = (range.startContainer !== startContainer || range.startOffset != startOffset);
                    var endMoved = (range.endContainer !== endContainer || range.endOffset != endOffset);
                    var nativeRangeDifferent = !range.equals(range.nativeRange);

                    // Always set both boundaries for the benefit of IE9 (see issue 35)
                    if (startMoved || endMoved || nativeRangeDifferent) {
                        range.setEnd(endContainer, endOffset);
                        range.setStart(startContainer, startOffset);
                    }
                }

                var createBeforeAfterNodeSetter;

                WrappedRange = function(range) {
                    if (!range) {
                        throw module.createError("WrappedRange: Range must be specified");
                    }
                    this.nativeRange = range;
                    updateRangeProperties(this);
                };

                DomRange.createPrototypeRange(WrappedRange, updateNativeRange);

                rangeProto = WrappedRange.prototype;

                rangeProto.selectNode = function(node) {
                    this.nativeRange.selectNode(node);
                    updateRangeProperties(this);
                };

                rangeProto.cloneContents = function() {
                    return this.nativeRange.cloneContents();
                };

                // Due to a long-standing Firefox bug that I have not been able to find a reliable way to detect,
                // insertNode() is never delegated to the native range.

                rangeProto.surroundContents = function(node) {
                    this.nativeRange.surroundContents(node);
                    updateRangeProperties(this);
                };

                rangeProto.collapse = function(isStart) {
                    this.nativeRange.collapse(isStart);
                    updateRangeProperties(this);
                };

                rangeProto.cloneRange = function() {
                    return new WrappedRange(this.nativeRange.cloneRange());
                };

                rangeProto.refresh = function() {
                    updateRangeProperties(this);
                };

                rangeProto.toString = function() {
                    return this.nativeRange.toString();
                };

                // Create test range and node for feature detection

                var testTextNode = document.createTextNode("test");
                getBody(document).appendChild(testTextNode);
                var range = document.createRange();

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for Firefox 2 bug that prevents moving the start of a Range to a point after its current end and
                // correct for it

                range.setStart(testTextNode, 0);
                range.setEnd(testTextNode, 0);

                try {
                    range.setStart(testTextNode, 1);

                    rangeProto.setStart = function(node, offset) {
                        this.nativeRange.setStart(node, offset);
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        this.nativeRange.setEnd(node, offset);
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name) {
                        return function(node) {
                            this.nativeRange[name](node);
                            updateRangeProperties(this);
                        };
                    };

                } catch(ex) {

                    rangeProto.setStart = function(node, offset) {
                        try {
                            this.nativeRange.setStart(node, offset);
                        } catch (ex) {
                            this.nativeRange.setEnd(node, offset);
                            this.nativeRange.setStart(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        try {
                            this.nativeRange.setEnd(node, offset);
                        } catch (ex) {
                            this.nativeRange.setStart(node, offset);
                            this.nativeRange.setEnd(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name, oppositeName) {
                        return function(node) {
                            try {
                                this.nativeRange[name](node);
                            } catch (ex) {
                                this.nativeRange[oppositeName](node);
                                this.nativeRange[name](node);
                            }
                            updateRangeProperties(this);
                        };
                    };
                }

                rangeProto.setStartBefore = createBeforeAfterNodeSetter("setStartBefore", "setEndBefore");
                rangeProto.setStartAfter = createBeforeAfterNodeSetter("setStartAfter", "setEndAfter");
                rangeProto.setEndBefore = createBeforeAfterNodeSetter("setEndBefore", "setStartBefore");
                rangeProto.setEndAfter = createBeforeAfterNodeSetter("setEndAfter", "setStartAfter");

                /*--------------------------------------------------------------------------------------------------------*/

                // Always use DOM4-compliant selectNodeContents implementation: it's simpler and less code than testing
                // whether the native implementation can be trusted
                rangeProto.selectNodeContents = function(node) {
                    this.setStartAndEnd(node, 0, dom.getNodeLength(node));
                };

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for and correct WebKit bug that has the behaviour of compareBoundaryPoints round the wrong way for
                // constants START_TO_END and END_TO_START: https://bugs.webkit.org/show_bug.cgi?id=20738

                range.selectNodeContents(testTextNode);
                range.setEnd(testTextNode, 3);

                var range2 = document.createRange();
                range2.selectNodeContents(testTextNode);
                range2.setEnd(testTextNode, 4);
                range2.setStart(testTextNode, 2);

                if (range.compareBoundaryPoints(range.START_TO_END, range2) == -1 &&
                        range.compareBoundaryPoints(range.END_TO_START, range2) == 1) {
                    // This is the wrong way round, so correct for it

                    rangeProto.compareBoundaryPoints = function(type, range) {
                        range = range.nativeRange || range;
                        if (type == range.START_TO_END) {
                            type = range.END_TO_START;
                        } else if (type == range.END_TO_START) {
                            type = range.START_TO_END;
                        }
                        return this.nativeRange.compareBoundaryPoints(type, range);
                    };
                } else {
                    rangeProto.compareBoundaryPoints = function(type, range) {
                        return this.nativeRange.compareBoundaryPoints(type, range.nativeRange || range);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for IE deleteContents() and extractContents() bug and correct it. See issue 107.

                var el = document.createElement("div");
                el.innerHTML = "123";
                var textNode = el.firstChild;
                var body = getBody(document);
                body.appendChild(el);

                range.setStart(textNode, 1);
                range.setEnd(textNode, 2);
                range.deleteContents();

                if (textNode.data == "13") {
                    // Behaviour is correct per DOM4 Range so wrap the browser's implementation of deleteContents() and
                    // extractContents()
                    rangeProto.deleteContents = function() {
                        this.nativeRange.deleteContents();
                        updateRangeProperties(this);
                    };

                    rangeProto.extractContents = function() {
                        var frag = this.nativeRange.extractContents();
                        updateRangeProperties(this);
                        return frag;
                    };
                } else {
                }

                body.removeChild(el);
                body = null;

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for existence of createContextualFragment and delegate to it if it exists
                if (util.isHostMethod(range, "createContextualFragment")) {
                    rangeProto.createContextualFragment = function(fragmentStr) {
                        return this.nativeRange.createContextualFragment(fragmentStr);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Clean up
                getBody(document).removeChild(testTextNode);

                rangeProto.getName = function() {
                    return "WrappedRange";
                };

                api.WrappedRange = WrappedRange;

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return doc.createRange();
                };
            })();
        }

        if (api.features.implementsTextRange) {
            /*
            This is a workaround for a bug where IE returns the wrong container element from the TextRange's parentElement()
            method. For example, in the following (where pipes denote the selection boundaries):

            <ul id="ul"><li id="a">| a </li><li id="b"> b |</li></ul>

            var range = document.selection.createRange();
            alert(range.parentElement().id); // Should alert "ul" but alerts "b"

            This method returns the common ancestor node of the following:
            - the parentElement() of the textRange
            - the parentElement() of the textRange after calling collapse(true)
            - the parentElement() of the textRange after calling collapse(false)
            */
            var getTextRangeContainerElement = function(textRange) {
                var parentEl = textRange.parentElement();
                var range = textRange.duplicate();
                range.collapse(true);
                var startEl = range.parentElement();
                range = textRange.duplicate();
                range.collapse(false);
                var endEl = range.parentElement();
                var startEndContainer = (startEl == endEl) ? startEl : dom.getCommonAncestor(startEl, endEl);

                return startEndContainer == parentEl ? startEndContainer : dom.getCommonAncestor(parentEl, startEndContainer);
            };

            var textRangeIsCollapsed = function(textRange) {
                return textRange.compareEndPoints("StartToEnd", textRange) == 0;
            };

            // Gets the boundary of a TextRange expressed as a node and an offset within that node. This function started
            // out as an improved version of code found in Tim Cameron Ryan's IERange (http://code.google.com/p/ierange/)
            // but has grown, fixing problems with line breaks in preformatted text, adding workaround for IE TextRange
            // bugs, handling for inputs and images, plus optimizations.
            var getTextRangeBoundaryPosition = function(textRange, wholeRangeContainerElement, isStart, isCollapsed, startInfo) {
                var workingRange = textRange.duplicate();
                workingRange.collapse(isStart);
                var containerElement = workingRange.parentElement();

                // Sometimes collapsing a TextRange that's at the start of a text node can move it into the previous node, so
                // check for that
                if (!dom.isOrIsAncestorOf(wholeRangeContainerElement, containerElement)) {
                    containerElement = wholeRangeContainerElement;
                }


                // Deal with nodes that cannot "contain rich HTML markup". In practice, this means form inputs, images and
                // similar. See http://msdn.microsoft.com/en-us/library/aa703950%28VS.85%29.aspx
                if (!containerElement.canHaveHTML) {
                    var pos = new DomPosition(containerElement.parentNode, dom.getNodeIndex(containerElement));
                    return {
                        boundaryPosition: pos,
                        nodeInfo: {
                            nodeIndex: pos.offset,
                            containerElement: pos.node
                        }
                    };
                }

                var workingNode = dom.getDocument(containerElement).createElement("span");

                // Workaround for HTML5 Shiv's insane violation of document.createElement(). See Rangy issue 104 and HTML5
                // Shiv issue 64: https://github.com/aFarkas/html5shiv/issues/64
                if (workingNode.parentNode) {
                    dom.removeNode(workingNode);
                }

                var comparison, workingComparisonType = isStart ? "StartToStart" : "StartToEnd";
                var previousNode, nextNode, boundaryPosition, boundaryNode;
                var start = (startInfo && startInfo.containerElement == containerElement) ? startInfo.nodeIndex : 0;
                var childNodeCount = containerElement.childNodes.length;
                var end = childNodeCount;

                // Check end first. Code within the loop assumes that the endth child node of the container is definitely
                // after the range boundary.
                var nodeIndex = end;

                while (true) {
                    if (nodeIndex == childNodeCount) {
                        containerElement.appendChild(workingNode);
                    } else {
                        containerElement.insertBefore(workingNode, containerElement.childNodes[nodeIndex]);
                    }
                    workingRange.moveToElementText(workingNode);
                    comparison = workingRange.compareEndPoints(workingComparisonType, textRange);
                    if (comparison == 0 || start == end) {
                        break;
                    } else if (comparison == -1) {
                        if (end == start + 1) {
                            // We know the endth child node is after the range boundary, so we must be done.
                            break;
                        } else {
                            start = nodeIndex;
                        }
                    } else {
                        end = (end == start + 1) ? start : nodeIndex;
                    }
                    nodeIndex = Math.floor((start + end) / 2);
                    containerElement.removeChild(workingNode);
                }


                // We've now reached or gone past the boundary of the text range we're interested in
                // so have identified the node we want
                boundaryNode = workingNode.nextSibling;

                if (comparison == -1 && boundaryNode && isCharacterDataNode(boundaryNode)) {
                    // This is a character data node (text, comment, cdata). The working range is collapsed at the start of
                    // the node containing the text range's boundary, so we move the end of the working range to the
                    // boundary point and measure the length of its text to get the boundary's offset within the node.
                    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

                    var offset;

                    if (/[\r\n]/.test(boundaryNode.data)) {
                        /*
                        For the particular case of a boundary within a text node containing rendered line breaks (within a
                        <pre> element, for example), we need a slightly complicated approach to get the boundary's offset in
                        IE. The facts:

                        - Each line break is represented as \r in the text node's data/nodeValue properties
                        - Each line break is represented as \r\n in the TextRange's 'text' property
                        - The 'text' property of the TextRange does not contain trailing line breaks

                        To get round the problem presented by the final fact above, we can use the fact that TextRange's
                        moveStart() and moveEnd() methods return the actual number of characters moved, which is not
                        necessarily the same as the number of characters it was instructed to move. The simplest approach is
                        to use this to store the characters moved when moving both the start and end of the range to the
                        start of the document body and subtracting the start offset from the end offset (the
                        "move-negative-gazillion" method). However, this is extremely slow when the document is large and
                        the range is near the end of it. Clearly doing the mirror image (i.e. moving the range boundaries to
                        the end of the document) has the same problem.

                        Another approach that works is to use moveStart() to move the start boundary of the range up to the
                        end boundary one character at a time and incrementing a counter with the value returned by the
                        moveStart() call. However, the check for whether the start boundary has reached the end boundary is
                        expensive, so this method is slow (although unlike "move-negative-gazillion" is largely unaffected
                        by the location of the range within the document).

                        The approach used below is a hybrid of the two methods above. It uses the fact that a string
                        containing the TextRange's 'text' property with each \r\n converted to a single \r character cannot
                        be longer than the text of the TextRange, so the start of the range is moved that length initially
                        and then a character at a time to make up for any trailing line breaks not contained in the 'text'
                        property. This has good performance in most situations compared to the previous two methods.
                        */
                        var tempRange = workingRange.duplicate();
                        var rangeLength = tempRange.text.replace(/\r\n/g, "\r").length;

                        offset = tempRange.moveStart("character", rangeLength);
                        while ( (comparison = tempRange.compareEndPoints("StartToEnd", tempRange)) == -1) {
                            offset++;
                            tempRange.moveStart("character", 1);
                        }
                    } else {
                        offset = workingRange.text.length;
                    }
                    boundaryPosition = new DomPosition(boundaryNode, offset);
                } else {

                    // If the boundary immediately follows a character data node and this is the end boundary, we should favour
                    // a position within that, and likewise for a start boundary preceding a character data node
                    previousNode = (isCollapsed || !isStart) && workingNode.previousSibling;
                    nextNode = (isCollapsed || isStart) && workingNode.nextSibling;
                    if (nextNode && isCharacterDataNode(nextNode)) {
                        boundaryPosition = new DomPosition(nextNode, 0);
                    } else if (previousNode && isCharacterDataNode(previousNode)) {
                        boundaryPosition = new DomPosition(previousNode, previousNode.data.length);
                    } else {
                        boundaryPosition = new DomPosition(containerElement, dom.getNodeIndex(workingNode));
                    }
                }

                // Clean up
                dom.removeNode(workingNode);

                return {
                    boundaryPosition: boundaryPosition,
                    nodeInfo: {
                        nodeIndex: nodeIndex,
                        containerElement: containerElement
                    }
                };
            };

            // Returns a TextRange representing the boundary of a TextRange expressed as a node and an offset within that
            // node. This function started out as an optimized version of code found in Tim Cameron Ryan's IERange
            // (http://code.google.com/p/ierange/)
            var createBoundaryTextRange = function(boundaryPosition, isStart) {
                var boundaryNode, boundaryParent, boundaryOffset = boundaryPosition.offset;
                var doc = dom.getDocument(boundaryPosition.node);
                var workingNode, childNodes, workingRange = getBody(doc).createTextRange();
                var nodeIsDataNode = isCharacterDataNode(boundaryPosition.node);

                if (nodeIsDataNode) {
                    boundaryNode = boundaryPosition.node;
                    boundaryParent = boundaryNode.parentNode;
                } else {
                    childNodes = boundaryPosition.node.childNodes;
                    boundaryNode = (boundaryOffset < childNodes.length) ? childNodes[boundaryOffset] : null;
                    boundaryParent = boundaryPosition.node;
                }

                // Position the range immediately before the node containing the boundary
                workingNode = doc.createElement("span");

                // Making the working element non-empty element persuades IE to consider the TextRange boundary to be within
                // the element rather than immediately before or after it
                workingNode.innerHTML = "&#feff;";

                // insertBefore is supposed to work like appendChild if the second parameter is null. However, a bug report
                // for IERange suggests that it can crash the browser: http://code.google.com/p/ierange/issues/detail?id=12
                if (boundaryNode) {
                    boundaryParent.insertBefore(workingNode, boundaryNode);
                } else {
                    boundaryParent.appendChild(workingNode);
                }

                workingRange.moveToElementText(workingNode);
                workingRange.collapse(!isStart);

                // Clean up
                boundaryParent.removeChild(workingNode);

                // Move the working range to the text offset, if required
                if (nodeIsDataNode) {
                    workingRange[isStart ? "moveStart" : "moveEnd"]("character", boundaryOffset);
                }

                return workingRange;
            };

            /*------------------------------------------------------------------------------------------------------------*/

            // This is a wrapper around a TextRange, providing full DOM Range functionality using rangy's DomRange as a
            // prototype

            WrappedTextRange = function(textRange) {
                this.textRange = textRange;
                this.refresh();
            };

            WrappedTextRange.prototype = new DomRange(document);

            WrappedTextRange.prototype.refresh = function() {
                var start, end, startBoundary;

                // TextRange's parentElement() method cannot be trusted. getTextRangeContainerElement() works around that.
                var rangeContainerElement = getTextRangeContainerElement(this.textRange);

                if (textRangeIsCollapsed(this.textRange)) {
                    end = start = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true,
                        true).boundaryPosition;
                } else {
                    startBoundary = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true, false);
                    start = startBoundary.boundaryPosition;

                    // An optimization used here is that if the start and end boundaries have the same parent element, the
                    // search scope for the end boundary can be limited to exclude the portion of the element that precedes
                    // the start boundary
                    end = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, false, false,
                        startBoundary.nodeInfo).boundaryPosition;
                }

                this.setStart(start.node, start.offset);
                this.setEnd(end.node, end.offset);
            };

            WrappedTextRange.prototype.getName = function() {
                return "WrappedTextRange";
            };

            DomRange.copyComparisonConstants(WrappedTextRange);

            var rangeToTextRange = function(range) {
                if (range.collapsed) {
                    return createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                } else {
                    var startRange = createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                    var endRange = createBoundaryTextRange(new DomPosition(range.endContainer, range.endOffset), false);
                    var textRange = getBody( DomRange.getRangeDocument(range) ).createTextRange();
                    textRange.setEndPoint("StartToStart", startRange);
                    textRange.setEndPoint("EndToEnd", endRange);
                    return textRange;
                }
            };

            WrappedTextRange.rangeToTextRange = rangeToTextRange;

            WrappedTextRange.prototype.toTextRange = function() {
                return rangeToTextRange(this);
            };

            api.WrappedTextRange = WrappedTextRange;

            // IE 9 and above have both implementations and Rangy makes both available. The next few lines sets which
            // implementation to use by default.
            if (!api.features.implementsDomRange || api.config.preferTextRange) {
                // Add WrappedTextRange as the Range property of the global object to allow expression like Range.END_TO_END to work
                var globalObj = (function(f) { return f("return this;")(); })(Function);
                if (typeof globalObj.Range == "undefined") {
                    globalObj.Range = WrappedTextRange;
                }

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return getBody(doc).createTextRange();
                };

                api.WrappedRange = WrappedTextRange;
            }
        }

        api.createRange = function(doc) {
            doc = getContentDocument(doc, module, "createRange");
            return new api.WrappedRange(api.createNativeRange(doc));
        };

        api.createRangyRange = function(doc) {
            doc = getContentDocument(doc, module, "createRangyRange");
            return new DomRange(doc);
        };

        util.createAliasForDeprecatedMethod(api, "createIframeRange", "createRange");
        util.createAliasForDeprecatedMethod(api, "createIframeRangyRange", "createRangyRange");

        api.addShimListener(function(win) {
            var doc = win.document;
            if (typeof doc.createRange == "undefined") {
                doc.createRange = function() {
                    return api.createRange(doc);
                };
            }
            doc = win = null;
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // This module creates a selection object wrapper that conforms as closely as possible to the Selection specification
    // in the HTML Editing spec (http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
    api.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(api, module) {
        api.config.checkSelectionRanges = true;

        var BOOLEAN = "boolean";
        var NUMBER = "number";
        var dom = api.dom;
        var util = api.util;
        var isHostMethod = util.isHostMethod;
        var DomRange = api.DomRange;
        var WrappedRange = api.WrappedRange;
        var DOMException = api.DOMException;
        var DomPosition = dom.DomPosition;
        var getNativeSelection;
        var selectionIsCollapsed;
        var features = api.features;
        var CONTROL = "Control";
        var getDocument = dom.getDocument;
        var getBody = dom.getBody;
        var rangesEqual = DomRange.rangesEqual;


        // Utility function to support direction parameters in the API that may be a string ("backward", "backwards",
        // "forward" or "forwards") or a Boolean (true for backwards).
        function isDirectionBackward(dir) {
            return (typeof dir == "string") ? /^backward(s)?$/i.test(dir) : !!dir;
        }

        function getWindow(win, methodName) {
            if (!win) {
                return window;
            } else if (dom.isWindow(win)) {
                return win;
            } else if (win instanceof WrappedSelection) {
                return win.win;
            } else {
                var doc = dom.getContentDocument(win, module, methodName);
                return dom.getWindow(doc);
            }
        }

        function getWinSelection(winParam) {
            return getWindow(winParam, "getWinSelection").getSelection();
        }

        function getDocSelection(winParam) {
            return getWindow(winParam, "getDocSelection").document.selection;
        }

        function winSelectionIsBackward(sel) {
            var backward = false;
            if (sel.anchorNode) {
                backward = (dom.comparePoints(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset) == 1);
            }
            return backward;
        }

        // Test for the Range/TextRange and Selection features required
        // Test for ability to retrieve selection
        var implementsWinGetSelection = isHostMethod(window, "getSelection"),
            implementsDocSelection = util.isHostObject(document, "selection");

        features.implementsWinGetSelection = implementsWinGetSelection;
        features.implementsDocSelection = implementsDocSelection;

        var useDocumentSelection = implementsDocSelection && (!implementsWinGetSelection || api.config.preferTextRange);

        if (useDocumentSelection) {
            getNativeSelection = getDocSelection;
            api.isSelectionValid = function(winParam) {
                var doc = getWindow(winParam, "isSelectionValid").document, nativeSel = doc.selection;

                // Check whether the selection TextRange is actually contained within the correct document
                return (nativeSel.type != "None" || getDocument(nativeSel.createRange().parentElement()) == doc);
            };
        } else if (implementsWinGetSelection) {
            getNativeSelection = getWinSelection;
            api.isSelectionValid = function() {
                return true;
            };
        } else {
            module.fail("Neither document.selection or window.getSelection() detected.");
            return false;
        }

        api.getNativeSelection = getNativeSelection;

        var testSelection = getNativeSelection();

        // In Firefox, the selection is null in an iframe with display: none. See issue #138.
        if (!testSelection) {
            module.fail("Native selection was null (possibly issue 138?)");
            return false;
        }

        var testRange = api.createNativeRange(document);
        var body = getBody(document);

        // Obtaining a range from a selection
        var selectionHasAnchorAndFocus = util.areHostProperties(testSelection,
            ["anchorNode", "focusNode", "anchorOffset", "focusOffset"]);

        features.selectionHasAnchorAndFocus = selectionHasAnchorAndFocus;

        // Test for existence of native selection extend() method
        var selectionHasExtend = isHostMethod(testSelection, "extend");
        features.selectionHasExtend = selectionHasExtend;

        // Test if rangeCount exists
        var selectionHasRangeCount = (typeof testSelection.rangeCount == NUMBER);
        features.selectionHasRangeCount = selectionHasRangeCount;

        var selectionSupportsMultipleRanges = false;
        var collapsedNonEditableSelectionsSupported = true;

        var addRangeBackwardToNative = selectionHasExtend ?
            function(nativeSelection, range) {
                var doc = DomRange.getRangeDocument(range);
                var endRange = api.createRange(doc);
                endRange.collapseToPoint(range.endContainer, range.endOffset);
                nativeSelection.addRange(getNativeRange(endRange));
                nativeSelection.extend(range.startContainer, range.startOffset);
            } : null;

        if (util.areHostMethods(testSelection, ["addRange", "getRangeAt", "removeAllRanges"]) &&
                typeof testSelection.rangeCount == NUMBER && features.implementsDomRange) {

            (function() {
                // Previously an iframe was used but this caused problems in some circumstances in IE, so tests are
                // performed on the current document's selection. See issue 109.

                // Note also that if a selection previously existed, it is wiped and later restored by these tests. This
                // will result in the selection direction begin reversed if the original selection was backwards and the
                // browser does not support setting backwards selections (Internet Explorer, I'm looking at you).
                var sel = window.getSelection();
                if (sel) {
                    // Store the current selection
                    var originalSelectionRangeCount = sel.rangeCount;
                    var selectionHasMultipleRanges = (originalSelectionRangeCount > 1);
                    var originalSelectionRanges = [];
                    var originalSelectionBackward = winSelectionIsBackward(sel);
                    for (var i = 0; i < originalSelectionRangeCount; ++i) {
                        originalSelectionRanges[i] = sel.getRangeAt(i);
                    }

                    // Create some test elements
                    var testEl = dom.createTestElement(document, "", false);
                    var textNode = testEl.appendChild( document.createTextNode("\u00a0\u00a0\u00a0") );

                    // Test whether the native selection will allow a collapsed selection within a non-editable element
                    var r1 = document.createRange();

                    r1.setStart(textNode, 1);
                    r1.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(r1);
                    collapsedNonEditableSelectionsSupported = (sel.rangeCount == 1);
                    sel.removeAllRanges();

                    // Test whether the native selection is capable of supporting multiple ranges.
                    if (!selectionHasMultipleRanges) {
                        // Doing the original feature test here in Chrome 36 (and presumably later versions) prints a
                        // console error of "Discontiguous selection is not supported." that cannot be suppressed. There's
                        // nothing we can do about this while retaining the feature test so we have to resort to a browser
                        // sniff. I'm not happy about it. See
                        // https://code.google.com/p/chromium/issues/detail?id=399791
                        var chromeMatch = window.navigator.appVersion.match(/Chrome\/(.*?) /);
                        if (chromeMatch && parseInt(chromeMatch[1]) >= 36) {
                            selectionSupportsMultipleRanges = false;
                        } else {
                            var r2 = r1.cloneRange();
                            r1.setStart(textNode, 0);
                            r2.setEnd(textNode, 3);
                            r2.setStart(textNode, 2);
                            sel.addRange(r1);
                            sel.addRange(r2);
                            selectionSupportsMultipleRanges = (sel.rangeCount == 2);
                        }
                    }

                    // Clean up
                    dom.removeNode(testEl);
                    sel.removeAllRanges();

                    for (i = 0; i < originalSelectionRangeCount; ++i) {
                        if (i == 0 && originalSelectionBackward) {
                            if (addRangeBackwardToNative) {
                                addRangeBackwardToNative(sel, originalSelectionRanges[i]);
                            } else {
                                api.warn("Rangy initialization: original selection was backwards but selection has been restored forwards because the browser does not support Selection.extend");
                                sel.addRange(originalSelectionRanges[i]);
                            }
                        } else {
                            sel.addRange(originalSelectionRanges[i]);
                        }
                    }
                }
            })();
        }

        features.selectionSupportsMultipleRanges = selectionSupportsMultipleRanges;
        features.collapsedNonEditableSelectionsSupported = collapsedNonEditableSelectionsSupported;

        // ControlRanges
        var implementsControlRange = false, testControlRange;

        if (body && isHostMethod(body, "createControlRange")) {
            testControlRange = body.createControlRange();
            if (util.areHostProperties(testControlRange, ["item", "add"])) {
                implementsControlRange = true;
            }
        }
        features.implementsControlRange = implementsControlRange;

        // Selection collapsedness
        if (selectionHasAnchorAndFocus) {
            selectionIsCollapsed = function(sel) {
                return sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset;
            };
        } else {
            selectionIsCollapsed = function(sel) {
                return sel.rangeCount ? sel.getRangeAt(sel.rangeCount - 1).collapsed : false;
            };
        }

        function updateAnchorAndFocusFromRange(sel, range, backward) {
            var anchorPrefix = backward ? "end" : "start", focusPrefix = backward ? "start" : "end";
            sel.anchorNode = range[anchorPrefix + "Container"];
            sel.anchorOffset = range[anchorPrefix + "Offset"];
            sel.focusNode = range[focusPrefix + "Container"];
            sel.focusOffset = range[focusPrefix + "Offset"];
        }

        function updateAnchorAndFocusFromNativeSelection(sel) {
            var nativeSel = sel.nativeSelection;
            sel.anchorNode = nativeSel.anchorNode;
            sel.anchorOffset = nativeSel.anchorOffset;
            sel.focusNode = nativeSel.focusNode;
            sel.focusOffset = nativeSel.focusOffset;
        }

        function updateEmptySelection(sel) {
            sel.anchorNode = sel.focusNode = null;
            sel.anchorOffset = sel.focusOffset = 0;
            sel.rangeCount = 0;
            sel.isCollapsed = true;
            sel._ranges.length = 0;
        }

        function getNativeRange(range) {
            var nativeRange;
            if (range instanceof DomRange) {
                nativeRange = api.createNativeRange(range.getDocument());
                nativeRange.setEnd(range.endContainer, range.endOffset);
                nativeRange.setStart(range.startContainer, range.startOffset);
            } else if (range instanceof WrappedRange) {
                nativeRange = range.nativeRange;
            } else if (features.implementsDomRange && (range instanceof dom.getWindow(range.startContainer).Range)) {
                nativeRange = range;
            }
            return nativeRange;
        }

        function rangeContainsSingleElement(rangeNodes) {
            if (!rangeNodes.length || rangeNodes[0].nodeType != 1) {
                return false;
            }
            for (var i = 1, len = rangeNodes.length; i < len; ++i) {
                if (!dom.isAncestorOf(rangeNodes[0], rangeNodes[i])) {
                    return false;
                }
            }
            return true;
        }

        function getSingleElementFromRange(range) {
            var nodes = range.getNodes();
            if (!rangeContainsSingleElement(nodes)) {
                throw module.createError("getSingleElementFromRange: range " + range.inspect() + " did not consist of a single element");
            }
            return nodes[0];
        }

        // Simple, quick test which only needs to distinguish between a TextRange and a ControlRange
        function isTextRange(range) {
            return !!range && typeof range.text != "undefined";
        }

        function updateFromTextRange(sel, range) {
            // Create a Range from the selected TextRange
            var wrappedRange = new WrappedRange(range);
            sel._ranges = [wrappedRange];

            updateAnchorAndFocusFromRange(sel, wrappedRange, false);
            sel.rangeCount = 1;
            sel.isCollapsed = wrappedRange.collapsed;
        }

        function updateControlSelection(sel) {
            // Update the wrapped selection based on what's now in the native selection
            sel._ranges.length = 0;
            if (sel.docSelection.type == "None") {
                updateEmptySelection(sel);
            } else {
                var controlRange = sel.docSelection.createRange();
                if (isTextRange(controlRange)) {
                    // This case (where the selection type is "Control" and calling createRange() on the selection returns
                    // a TextRange) can happen in IE 9. It happens, for example, when all elements in the selected
                    // ControlRange have been removed from the ControlRange and removed from the document.
                    updateFromTextRange(sel, controlRange);
                } else {
                    sel.rangeCount = controlRange.length;
                    var range, doc = getDocument(controlRange.item(0));
                    for (var i = 0; i < sel.rangeCount; ++i) {
                        range = api.createRange(doc);
                        range.selectNode(controlRange.item(i));
                        sel._ranges.push(range);
                    }
                    sel.isCollapsed = sel.rangeCount == 1 && sel._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], false);
                }
            }
        }

        function addRangeToControlSelection(sel, range) {
            var controlRange = sel.docSelection.createRange();
            var rangeElement = getSingleElementFromRange(range);

            // Create a new ControlRange containing all the elements in the selected ControlRange plus the element
            // contained by the supplied range
            var doc = getDocument(controlRange.item(0));
            var newControlRange = getBody(doc).createControlRange();
            for (var i = 0, len = controlRange.length; i < len; ++i) {
                newControlRange.add(controlRange.item(i));
            }
            try {
                newControlRange.add(rangeElement);
            } catch (ex) {
                throw module.createError("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
            }
            newControlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        var getSelectionRangeAt;

        if (isHostMethod(testSelection, "getRangeAt")) {
            // try/catch is present because getRangeAt() must have thrown an error in some browser and some situation.
            // Unfortunately, I didn't write a comment about the specifics and am now scared to take it out. Let that be a
            // lesson to us all, especially me.
            getSelectionRangeAt = function(sel, index) {
                try {
                    return sel.getRangeAt(index);
                } catch (ex) {
                    return null;
                }
            };
        } else if (selectionHasAnchorAndFocus) {
            getSelectionRangeAt = function(sel) {
                var doc = getDocument(sel.anchorNode);
                var range = api.createRange(doc);
                range.setStartAndEnd(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);

                // Handle the case when the selection was selected backwards (from the end to the start in the
                // document)
                if (range.collapsed !== this.isCollapsed) {
                    range.setStartAndEnd(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
                }

                return range;
            };
        }

        function WrappedSelection(selection, docSelection, win) {
            this.nativeSelection = selection;
            this.docSelection = docSelection;
            this._ranges = [];
            this.win = win;
            this.refresh();
        }

        WrappedSelection.prototype = api.selectionPrototype;

        function deleteProperties(sel) {
            sel.win = sel.anchorNode = sel.focusNode = sel._ranges = null;
            sel.rangeCount = sel.anchorOffset = sel.focusOffset = 0;
            sel.detached = true;
        }

        var cachedRangySelections = [];

        function actOnCachedSelection(win, action) {
            var i = cachedRangySelections.length, cached, sel;
            while (i--) {
                cached = cachedRangySelections[i];
                sel = cached.selection;
                if (action == "deleteAll") {
                    deleteProperties(sel);
                } else if (cached.win == win) {
                    if (action == "delete") {
                        cachedRangySelections.splice(i, 1);
                        return true;
                    } else {
                        return sel;
                    }
                }
            }
            if (action == "deleteAll") {
                cachedRangySelections.length = 0;
            }
            return null;
        }

        var getSelection = function(win) {
            // Check if the parameter is a Rangy Selection object
            if (win && win instanceof WrappedSelection) {
                win.refresh();
                return win;
            }

            win = getWindow(win, "getNativeSelection");

            var sel = actOnCachedSelection(win);
            var nativeSel = getNativeSelection(win), docSel = implementsDocSelection ? getDocSelection(win) : null;
            if (sel) {
                sel.nativeSelection = nativeSel;
                sel.docSelection = docSel;
                sel.refresh();
            } else {
                sel = new WrappedSelection(nativeSel, docSel, win);
                cachedRangySelections.push( { win: win, selection: sel } );
            }
            return sel;
        };

        api.getSelection = getSelection;

        util.createAliasForDeprecatedMethod(api, "getIframeSelection", "getSelection");

        var selProto = WrappedSelection.prototype;

        function createControlSelection(sel, ranges) {
            // Ensure that the selection becomes of type "Control"
            var doc = getDocument(ranges[0].startContainer);
            var controlRange = getBody(doc).createControlRange();
            for (var i = 0, el, len = ranges.length; i < len; ++i) {
                el = getSingleElementFromRange(ranges[i]);
                try {
                    controlRange.add(el);
                } catch (ex) {
                    throw module.createError("setRanges(): Element within one of the specified Ranges could not be added to control selection (does it have layout?)");
                }
            }
            controlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        // Selecting a range
        if (!useDocumentSelection && selectionHasAnchorAndFocus && util.areHostMethods(testSelection, ["removeAllRanges", "addRange"])) {
            selProto.removeAllRanges = function() {
                this.nativeSelection.removeAllRanges();
                updateEmptySelection(this);
            };

            var addRangeBackward = function(sel, range) {
                addRangeBackwardToNative(sel.nativeSelection, range);
                sel.refresh();
            };

            if (selectionHasRangeCount) {
                selProto.addRange = function(range, direction) {
                    if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                        addRangeToControlSelection(this, range);
                    } else {
                        if (isDirectionBackward(direction) && selectionHasExtend) {
                            addRangeBackward(this, range);
                        } else {
                            var previousRangeCount;
                            if (selectionSupportsMultipleRanges) {
                                previousRangeCount = this.rangeCount;
                            } else {
                                this.removeAllRanges();
                                previousRangeCount = 0;
                            }
                            // Clone the native range so that changing the selected range does not affect the selection.
                            // This is contrary to the spec but is the only way to achieve consistency between browsers. See
                            // issue 80.
                            var clonedNativeRange = getNativeRange(range).cloneRange();
                            try {
                                this.nativeSelection.addRange(clonedNativeRange);
                            } catch (ex) {
                            }

                            // Check whether adding the range was successful
                            this.rangeCount = this.nativeSelection.rangeCount;

                            if (this.rangeCount == previousRangeCount + 1) {
                                // The range was added successfully

                                // Check whether the range that we added to the selection is reflected in the last range extracted from
                                // the selection
                                if (api.config.checkSelectionRanges) {
                                    var nativeRange = getSelectionRangeAt(this.nativeSelection, this.rangeCount - 1);
                                    if (nativeRange && !rangesEqual(nativeRange, range)) {
                                        // Happens in WebKit with, for example, a selection placed at the start of a text node
                                        range = new WrappedRange(nativeRange);
                                    }
                                }
                                this._ranges[this.rangeCount - 1] = range;
                                updateAnchorAndFocusFromRange(this, range, selectionIsBackward(this.nativeSelection));
                                this.isCollapsed = selectionIsCollapsed(this);
                            } else {
                                // The range was not added successfully. The simplest thing is to refresh
                                this.refresh();
                            }
                        }
                    }
                };
            } else {
                selProto.addRange = function(range, direction) {
                    if (isDirectionBackward(direction) && selectionHasExtend) {
                        addRangeBackward(this, range);
                    } else {
                        this.nativeSelection.addRange(getNativeRange(range));
                        this.refresh();
                    }
                };
            }

            selProto.setRanges = function(ranges) {
                if (implementsControlRange && implementsDocSelection && ranges.length > 1) {
                    createControlSelection(this, ranges);
                } else {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        this.addRange(ranges[i]);
                    }
                }
            };
        } else if (isHostMethod(testSelection, "empty") && isHostMethod(testRange, "select") &&
                   implementsControlRange && useDocumentSelection) {

            selProto.removeAllRanges = function() {
                // Added try/catch as fix for issue #21
                try {
                    this.docSelection.empty();

                    // Check for empty() not working (issue #24)
                    if (this.docSelection.type != "None") {
                        // Work around failure to empty a control selection by instead selecting a TextRange and then
                        // calling empty()
                        var doc;
                        if (this.anchorNode) {
                            doc = getDocument(this.anchorNode);
                        } else if (this.docSelection.type == CONTROL) {
                            var controlRange = this.docSelection.createRange();
                            if (controlRange.length) {
                                doc = getDocument( controlRange.item(0) );
                            }
                        }
                        if (doc) {
                            var textRange = getBody(doc).createTextRange();
                            textRange.select();
                            this.docSelection.empty();
                        }
                    }
                } catch(ex) {}
                updateEmptySelection(this);
            };

            selProto.addRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    addRangeToControlSelection(this, range);
                } else {
                    api.WrappedTextRange.rangeToTextRange(range).select();
                    this._ranges[0] = range;
                    this.rangeCount = 1;
                    this.isCollapsed = this._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(this, range, false);
                }
            };

            selProto.setRanges = function(ranges) {
                this.removeAllRanges();
                var rangeCount = ranges.length;
                if (rangeCount > 1) {
                    createControlSelection(this, ranges);
                } else if (rangeCount) {
                    this.addRange(ranges[0]);
                }
            };
        } else {
            module.fail("No means of selecting a Range or TextRange was found");
            return false;
        }

        selProto.getRangeAt = function(index) {
            if (index < 0 || index >= this.rangeCount) {
                throw new DOMException("INDEX_SIZE_ERR");
            } else {
                // Clone the range to preserve selection-range independence. See issue 80.
                return this._ranges[index].cloneRange();
            }
        };

        var refreshSelection;

        if (useDocumentSelection) {
            refreshSelection = function(sel) {
                var range;
                if (api.isSelectionValid(sel.win)) {
                    range = sel.docSelection.createRange();
                } else {
                    range = getBody(sel.win.document).createTextRange();
                    range.collapse(true);
                }

                if (sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else if (isTextRange(range)) {
                    updateFromTextRange(sel, range);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else if (isHostMethod(testSelection, "getRangeAt") && typeof testSelection.rangeCount == NUMBER) {
            refreshSelection = function(sel) {
                if (implementsControlRange && implementsDocSelection && sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else {
                    sel._ranges.length = sel.rangeCount = sel.nativeSelection.rangeCount;
                    if (sel.rangeCount) {
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            sel._ranges[i] = new api.WrappedRange(sel.nativeSelection.getRangeAt(i));
                        }
                        updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], selectionIsBackward(sel.nativeSelection));
                        sel.isCollapsed = selectionIsCollapsed(sel);
                    } else {
                        updateEmptySelection(sel);
                    }
                }
            };
        } else if (selectionHasAnchorAndFocus && typeof testSelection.isCollapsed == BOOLEAN && typeof testRange.collapsed == BOOLEAN && features.implementsDomRange) {
            refreshSelection = function(sel) {
                var range, nativeSel = sel.nativeSelection;
                if (nativeSel.anchorNode) {
                    range = getSelectionRangeAt(nativeSel, 0);
                    sel._ranges = [range];
                    sel.rangeCount = 1;
                    updateAnchorAndFocusFromNativeSelection(sel);
                    sel.isCollapsed = selectionIsCollapsed(sel);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else {
            module.fail("No means of obtaining a Range or TextRange from the user's selection was found");
            return false;
        }

        selProto.refresh = function(checkForChanges) {
            var oldRanges = checkForChanges ? this._ranges.slice(0) : null;
            var oldAnchorNode = this.anchorNode, oldAnchorOffset = this.anchorOffset;

            refreshSelection(this);
            if (checkForChanges) {
                // Check the range count first
                var i = oldRanges.length;
                if (i != this._ranges.length) {
                    return true;
                }

                // Now check the direction. Checking the anchor position is the same is enough since we're checking all the
                // ranges after this
                if (this.anchorNode != oldAnchorNode || this.anchorOffset != oldAnchorOffset) {
                    return true;
                }

                // Finally, compare each range in turn
                while (i--) {
                    if (!rangesEqual(oldRanges[i], this._ranges[i])) {
                        return true;
                    }
                }
                return false;
            }
        };

        // Removal of a single range
        var removeRangeManually = function(sel, range) {
            var ranges = sel.getAllRanges();
            sel.removeAllRanges();
            for (var i = 0, len = ranges.length; i < len; ++i) {
                if (!rangesEqual(range, ranges[i])) {
                    sel.addRange(ranges[i]);
                }
            }
            if (!sel.rangeCount) {
                updateEmptySelection(sel);
            }
        };

        if (implementsControlRange && implementsDocSelection) {
            selProto.removeRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    var controlRange = this.docSelection.createRange();
                    var rangeElement = getSingleElementFromRange(range);

                    // Create a new ControlRange containing all the elements in the selected ControlRange minus the
                    // element contained by the supplied range
                    var doc = getDocument(controlRange.item(0));
                    var newControlRange = getBody(doc).createControlRange();
                    var el, removed = false;
                    for (var i = 0, len = controlRange.length; i < len; ++i) {
                        el = controlRange.item(i);
                        if (el !== rangeElement || removed) {
                            newControlRange.add(controlRange.item(i));
                        } else {
                            removed = true;
                        }
                    }
                    newControlRange.select();

                    // Update the wrapped selection based on what's now in the native selection
                    updateControlSelection(this);
                } else {
                    removeRangeManually(this, range);
                }
            };
        } else {
            selProto.removeRange = function(range) {
                removeRangeManually(this, range);
            };
        }

        // Detecting if a selection is backward
        var selectionIsBackward;
        if (!useDocumentSelection && selectionHasAnchorAndFocus && features.implementsDomRange) {
            selectionIsBackward = winSelectionIsBackward;

            selProto.isBackward = function() {
                return selectionIsBackward(this);
            };
        } else {
            selectionIsBackward = selProto.isBackward = function() {
                return false;
            };
        }

        // Create an alias for backwards compatibility. From 1.3, everything is "backward" rather than "backwards"
        selProto.isBackwards = selProto.isBackward;

        // Selection stringifier
        // This is conformant to the old HTML5 selections draft spec but differs from WebKit and Mozilla's implementation.
        // The current spec does not yet define this method.
        selProto.toString = function() {
            var rangeTexts = [];
            for (var i = 0, len = this.rangeCount; i < len; ++i) {
                rangeTexts[i] = "" + this._ranges[i];
            }
            return rangeTexts.join("");
        };

        function assertNodeInSameDocument(sel, node) {
            if (sel.win.document != getDocument(node)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        // No current browser conforms fully to the spec for this method, so Rangy's own method is always used
        selProto.collapse = function(node, offset) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.collapseToPoint(node, offset);
            this.setSingleRange(range);
            this.isCollapsed = true;
        };

        selProto.collapseToStart = function() {
            if (this.rangeCount) {
                var range = this._ranges[0];
                this.collapse(range.startContainer, range.startOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        selProto.collapseToEnd = function() {
            if (this.rangeCount) {
                var range = this._ranges[this.rangeCount - 1];
                this.collapse(range.endContainer, range.endOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        // The spec is very specific on how selectAllChildren should be implemented and not all browsers implement it as
        // specified so the native implementation is never used by Rangy.
        selProto.selectAllChildren = function(node) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.selectNodeContents(node);
            this.setSingleRange(range);
        };

        selProto.deleteFromDocument = function() {
            // Sepcial behaviour required for IE's control selections
            if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                var controlRange = this.docSelection.createRange();
                var element;
                while (controlRange.length) {
                    element = controlRange.item(0);
                    controlRange.remove(element);
                    dom.removeNode(element);
                }
                this.refresh();
            } else if (this.rangeCount) {
                var ranges = this.getAllRanges();
                if (ranges.length) {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        ranges[i].deleteContents();
                    }
                    // The spec says nothing about what the selection should contain after calling deleteContents on each
                    // range. Firefox moves the selection to where the final selected range was, so we emulate that
                    this.addRange(ranges[len - 1]);
                }
            }
        };

        // The following are non-standard extensions
        selProto.eachRange = function(func, returnValue) {
            for (var i = 0, len = this._ranges.length; i < len; ++i) {
                if ( func( this.getRangeAt(i) ) ) {
                    return returnValue;
                }
            }
        };

        selProto.getAllRanges = function() {
            var ranges = [];
            this.eachRange(function(range) {
                ranges.push(range);
            });
            return ranges;
        };

        selProto.setSingleRange = function(range, direction) {
            this.removeAllRanges();
            this.addRange(range, direction);
        };

        selProto.callMethodOnEachRange = function(methodName, params) {
            var results = [];
            this.eachRange( function(range) {
                results.push( range[methodName].apply(range, params || []) );
            } );
            return results;
        };

        function createStartOrEndSetter(isStart) {
            return function(node, offset) {
                var range;
                if (this.rangeCount) {
                    range = this.getRangeAt(0);
                    range["set" + (isStart ? "Start" : "End")](node, offset);
                } else {
                    range = api.createRange(this.win.document);
                    range.setStartAndEnd(node, offset);
                }
                this.setSingleRange(range, this.isBackward());
            };
        }

        selProto.setStart = createStartOrEndSetter(true);
        selProto.setEnd = createStartOrEndSetter(false);

        // Add select() method to Range prototype. Any existing selection will be removed.
        api.rangePrototype.select = function(direction) {
            getSelection( this.getDocument() ).setSingleRange(this, direction);
        };

        selProto.changeEachRange = function(func) {
            var ranges = [];
            var backward = this.isBackward();

            this.eachRange(function(range) {
                func(range);
                ranges.push(range);
            });

            this.removeAllRanges();
            if (backward && ranges.length == 1) {
                this.addRange(ranges[0], "backward");
            } else {
                this.setRanges(ranges);
            }
        };

        selProto.containsNode = function(node, allowPartial) {
            return this.eachRange( function(range) {
                return range.containsNode(node, allowPartial);
            }, true ) || false;
        };

        selProto.getBookmark = function(containerNode) {
            return {
                backward: this.isBackward(),
                rangeBookmarks: this.callMethodOnEachRange("getBookmark", [containerNode])
            };
        };

        selProto.moveToBookmark = function(bookmark) {
            var selRanges = [];
            for (var i = 0, rangeBookmark, range; rangeBookmark = bookmark.rangeBookmarks[i++]; ) {
                range = api.createRange(this.win);
                range.moveToBookmark(rangeBookmark);
                selRanges.push(range);
            }
            if (bookmark.backward) {
                this.setSingleRange(selRanges[0], "backward");
            } else {
                this.setRanges(selRanges);
            }
        };

        selProto.saveRanges = function() {
            return {
                backward: this.isBackward(),
                ranges: this.callMethodOnEachRange("cloneRange")
            };
        };

        selProto.restoreRanges = function(selRanges) {
            this.removeAllRanges();
            for (var i = 0, range; range = selRanges.ranges[i]; ++i) {
                this.addRange(range, (selRanges.backward && i == 0));
            }
        };

        selProto.toHtml = function() {
            var rangeHtmls = [];
            this.eachRange(function(range) {
                rangeHtmls.push( DomRange.toHtml(range) );
            });
            return rangeHtmls.join("");
        };

        if (features.implementsTextRange) {
            selProto.getNativeTextRange = function() {
                var sel, textRange;
                if ( (sel = this.docSelection) ) {
                    var range = sel.createRange();
                    if (isTextRange(range)) {
                        return range;
                    } else {
                        throw module.createError("getNativeTextRange: selection is a control selection");
                    }
                } else if (this.rangeCount > 0) {
                    return api.WrappedTextRange.rangeToTextRange( this.getRangeAt(0) );
                } else {
                    throw module.createError("getNativeTextRange: selection contains no range");
                }
            };
        }

        function inspect(sel) {
            var rangeInspects = [];
            var anchor = new DomPosition(sel.anchorNode, sel.anchorOffset);
            var focus = new DomPosition(sel.focusNode, sel.focusOffset);
            var name = (typeof sel.getName == "function") ? sel.getName() : "Selection";

            if (typeof sel.rangeCount != "undefined") {
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    rangeInspects[i] = DomRange.inspect(sel.getRangeAt(i));
                }
            }
            return "[" + name + "(Ranges: " + rangeInspects.join(", ") +
                    ")(anchor: " + anchor.inspect() + ", focus: " + focus.inspect() + "]";
        }

        selProto.getName = function() {
            return "WrappedSelection";
        };

        selProto.inspect = function() {
            return inspect(this);
        };

        selProto.detach = function() {
            actOnCachedSelection(this.win, "delete");
            deleteProperties(this);
        };

        WrappedSelection.detachAll = function() {
            actOnCachedSelection(null, "deleteAll");
        };

        WrappedSelection.inspect = inspect;
        WrappedSelection.isDirectionBackward = isDirectionBackward;

        api.Selection = WrappedSelection;

        api.selectionPrototype = selProto;

        api.addShimListener(function(win) {
            if (typeof win.getSelection == "undefined") {
                win.getSelection = function() {
                    return getSelection(win);
                };
            }
            win = null;
        });
    });


    /*----------------------------------------------------------------------------------------------------------------*/

    // Wait for document to load before initializing
    var docReady = false;

    var loadHandler = function(e) {
        if (!docReady) {
            docReady = true;
            if (!api.initialized && api.config.autoInitialize) {
                init();
            }
        }
    };

    if (isBrowser) {
        // Test whether the document has already been loaded and initialize immediately if so
        if (document.readyState == "complete") {
            loadHandler();
        } else {
            if (isHostMethod(document, "addEventListener")) {
                document.addEventListener("DOMContentLoaded", loadHandler, false);
            }

            // Add a fallback in case the DOMContentLoaded event isn't supported
            addListener(window, "load", loadHandler);
        }
    }

    return api;
}, this);

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2015
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
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
      , chromeBook = /CrOS/.test(ua)
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
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
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
    } else if (chromeBook) {
      result = {
        name: 'Chrome'
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/chrome.+? edge/i.test(ua)) {
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
        (result.yandexbrowser && result.version >= 15) ||
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
var $ = require('jquery');
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

},{"./config":4,"./node-type":16,"./util/string":25,"jquery":"jquery"}],4:[function(require,module,exports){

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
var rangy = require('rangy');
var $ = require('jquery');
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

},{"./node-type":16,"./parser":17,"./range-save-restore":19,"./util/string":25,"jquery":"jquery","rangy":"rangy"}],6:[function(require,module,exports){
var rangy = require('rangy');
var $ = require('jquery');
var config = require('./config');
var error = require('./util/error');
var parser = require('./parser');
var content = require('./content');
var clipboard = require('./clipboard');
var Dispatcher = require('./dispatcher');
var Cursor = require('./cursor');
var Spellcheck = require('./spellcheck');
var createDefaultEvents = require('./create-default-events');
var browser = require('bowser');

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

},{"./clipboard":3,"./config":4,"./content":5,"./create-default-events":8,"./cursor":9,"./dispatcher":10,"./parser":17,"./spellcheck":22,"./util/error":23,"bowser":1,"jquery":"jquery","rangy":"rangy"}],7:[function(require,module,exports){
var $ = require('jquery');
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

},{"./block":2,"./content":5,"./parser":17,"./util/log":24,"jquery":"jquery"}],8:[function(require,module,exports){
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
var rangy = require('rangy');
var $ = require('jquery');
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

},{"./content":5,"./node-type":16,"./parser":17,"./range-save-restore":19,"./util/error":23,"./util/string":25,"jquery":"jquery","rangy":"rangy"}],10:[function(require,module,exports){
var $ = require('jquery');
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

},{"./clipboard":3,"./config":4,"./eventable":11,"./feature-detection":12,"./keyboard":14,"./selection-watcher":20,"jquery":"jquery"}],11:[function(require,module,exports){

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
var browser = require('bowser');

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
var rangy = require('rangy');
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

},{"./node-iterator":15,"./node-type":16,"rangy":"rangy"}],14:[function(require,module,exports){
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
var $ = require('jquery');
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

},{"./config":4,"./node-type":16,"./util/string":25,"jquery":"jquery"}],18:[function(require,module,exports){
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
var rangy = require('rangy');
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

},{"./node-type":16,"./util/error":23,"rangy":"rangy"}],20:[function(require,module,exports){
var rangy = require('rangy');
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

},{"./cursor":9,"./parser":17,"./range-container":18,"./selection":21,"rangy":"rangy"}],21:[function(require,module,exports){
var $ = require('jquery');
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

},{"./config":4,"./content":5,"./cursor":9,"./parser":17,"jquery":"jquery"}],22:[function(require,module,exports){
var $ = require('jquery');
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

},{"./content":5,"./highlight-text":13,"./node-type":16,"jquery":"jquery"}],23:[function(require,module,exports){
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

},{}],"jquery":[function(require,module,exports){
module.exports = $;

},{}],"rangy":[function(require,module,exports){
module.exports = rangy;

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYm93c2VyL2Jvd3Nlci5qcyIsInNyYy9ibG9jay5qcyIsInNyYy9jbGlwYm9hcmQuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2NvbnRlbnQuanMiLCJzcmMvY29yZS5qcyIsInNyYy9jcmVhdGUtZGVmYXVsdC1iZWhhdmlvci5qcyIsInNyYy9jcmVhdGUtZGVmYXVsdC1ldmVudHMuanMiLCJzcmMvY3Vyc29yLmpzIiwic3JjL2Rpc3BhdGNoZXIuanMiLCJzcmMvZXZlbnRhYmxlLmpzIiwic3JjL2ZlYXR1cmUtZGV0ZWN0aW9uLmpzIiwic3JjL2hpZ2hsaWdodC10ZXh0LmpzIiwic3JjL2tleWJvYXJkLmpzIiwic3JjL25vZGUtaXRlcmF0b3IuanMiLCJzcmMvbm9kZS10eXBlLmpzIiwic3JjL3BhcnNlci5qcyIsInNyYy9yYW5nZS1jb250YWluZXIuanMiLCJzcmMvcmFuZ2Utc2F2ZS1yZXN0b3JlLmpzIiwic3JjL3NlbGVjdGlvbi13YXRjaGVyLmpzIiwic3JjL3NlbGVjdGlvbi5qcyIsInNyYy9zcGVsbGNoZWNrLmpzIiwic3JjL3V0aWwvZXJyb3IuanMiLCJzcmMvdXRpbC9sb2cuanMiLCJzcmMvdXRpbC9zdHJpbmcuanMiLCJzcmMvbW9kdWxlcy9qcXVlcnkuanMiLCJzcmMvbW9kdWxlcy9yYW5neS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBOztBQ0RBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gICogQm93c2VyIC0gYSBicm93c2VyIGRldGVjdG9yXG4gICogaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib3dzZXJcbiAgKiBNSVQgTGljZW5zZSB8IChjKSBEdXN0aW4gRGlheiAyMDE1XG4gICovXG5cbiFmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbikge1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0oJ2Jvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAgKiBTZWUgdXNlcmFnZW50cy5qcyBmb3IgZXhhbXBsZXMgb2YgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICovXG5cbiAgdmFyIHQgPSB0cnVlXG5cbiAgZnVuY3Rpb24gZGV0ZWN0KHVhKSB7XG5cbiAgICBmdW5jdGlvbiBnZXRGaXJzdE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNlY29uZE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMl0pIHx8ICcnO1xuICAgIH1cblxuICAgIHZhciBpb3NkZXZpY2UgPSBnZXRGaXJzdE1hdGNoKC8oaXBvZHxpcGhvbmV8aXBhZCkvaSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBsaWtlQW5kcm9pZCA9IC9saWtlIGFuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBhbmRyb2lkID0gIWxpa2VBbmRyb2lkICYmIC9hbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgY2hyb21lQm9vayA9IC9Dck9TLy50ZXN0KHVhKVxuICAgICAgLCBlZGdlVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2VkZ2VcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHZlcnNpb25JZGVudGlmaWVyID0gZ2V0Rmlyc3RNYXRjaCgvdmVyc2lvblxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdGFibGV0ID0gL3RhYmxldC9pLnRlc3QodWEpXG4gICAgICAsIG1vYmlsZSA9ICF0YWJsZXQgJiYgL1teLV1tb2JpL2kudGVzdCh1YSlcbiAgICAgICwgcmVzdWx0XG5cbiAgICBpZiAoL29wZXJhfG9wci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICwgb3BlcmE6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86b3BlcmF8b3ByKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgveWFicm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1lhbmRleCBCcm93c2VyJ1xuICAgICAgLCB5YW5kZXhicm93c2VyOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OnlhYnJvd3NlcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3dpbmRvd3MgcGhvbmUvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgd2luZG93c3Bob25lOiB0XG4gICAgICB9XG4gICAgICBpZiAoZWRnZVZlcnNpb24pIHtcbiAgICAgICAgcmVzdWx0Lm1zZWRnZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdC5tc2llID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2llbW9iaWxlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXNpZXx0cmlkZW50L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ludGVybmV0IEV4cGxvcmVyJ1xuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om1zaWUgfHJ2OikoXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaHJvbWVCb29rKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIGNocm9tZUJvb2s6IHRcbiAgICAgICwgY2hyb21lOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9jaHJvbWUuKz8gZWRnZS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNaWNyb3NvZnQgRWRnZSdcbiAgICAgICwgbXNlZGdlOiB0XG4gICAgICAsIHZlcnNpb246IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWV8Y3Jpb3N8Y3Jtby9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIGNocm9tZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lIDogaW9zZGV2aWNlID09ICdpcGhvbmUnID8gJ2lQaG9uZScgOiBpb3NkZXZpY2UgPT0gJ2lwYWQnID8gJ2lQYWQnIDogJ2lQb2QnXG4gICAgICB9XG4gICAgICAvLyBXVEY6IHZlcnNpb24gaXMgbm90IHBhcnQgb2YgdXNlciBhZ2VudCBpbiB3ZWIgYXBwc1xuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NhaWxmaXNoL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhaWxmaXNoJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWwpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zaWxrL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9ICB7XG4gICAgICAgIG5hbWU6ICdBbWF6b24gU2lsaydcbiAgICAgICwgc2lsazogdFxuICAgICAgLCB2ZXJzaW9uIDogZ2V0Rmlyc3RNYXRjaCgvc2lsa1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3BoYW50b20vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUGhhbnRvbUpTJ1xuICAgICAgLCBwaGFudG9tOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3BoYW50b21qc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2JsYWNrYmVycnl8XFxiYmJcXGQrL2kudGVzdCh1YSkgfHwgL3JpbVxcc3RhYmxldC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCbGFja0JlcnJ5J1xuICAgICAgLCBibGFja2JlcnJ5OiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL2JsYWNrYmVycnlbXFxkXStcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC8od2VifGhwdylvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXZWJPUydcbiAgICAgICwgd2Vib3M6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvdyg/OmViKT9vc2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgICAgL3RvdWNocGFkXFwvL2kudGVzdCh1YSkgJiYgKHJlc3VsdC50b3VjaHBhZCA9IHQpXG4gICAgfVxuICAgIGVsc2UgaWYgKC9iYWRhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JhZGEnXG4gICAgICAsIGJhZGE6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZG9sZmluXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL3RpemVuL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiBnZXRGaXJzdE1hdGNoKC9eKC4qKVxcLyguKikgLyksXG4gICAgICAgIHZlcnNpb246IGdldFNlY29uZE1hdGNoKC9eKC4qKVxcLyguKikgLylcbiAgICAgfTtcbiAgIH1cblxuICAgIC8vIHNldCB3ZWJraXQgb3IgZ2Vja28gZmxhZyBmb3IgYnJvd3NlcnMgYmFzZWQgb24gdGhlc2UgZW5naW5lc1xuICAgIGlmICghcmVzdWx0Lm1zZWRnZSAmJiAvKGFwcGxlKT93ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIldlYmtpdFwiXG4gICAgICByZXN1bHQud2Via2l0ID0gdFxuICAgICAgaWYgKCFyZXN1bHQudmVyc2lvbiAmJiB2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0Lm9wZXJhICYmIC9nZWNrb1xcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiR2Vja29cIlxuICAgICAgcmVzdWx0LmdlY2tvID0gdFxuICAgICAgcmVzdWx0LnZlcnNpb24gPSByZXN1bHQudmVyc2lvbiB8fCBnZXRGaXJzdE1hdGNoKC9nZWNrb1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICB9XG5cbiAgICAvLyBzZXQgT1MgZmxhZ3MgZm9yIHBsYXRmb3JtcyB0aGF0IGhhdmUgbXVsdGlwbGUgYnJvd3NlcnNcbiAgICBpZiAoIXJlc3VsdC5tc2VkZ2UgJiYgKGFuZHJvaWQgfHwgcmVzdWx0LnNpbGspKSB7XG4gICAgICByZXN1bHQuYW5kcm9pZCA9IHRcbiAgICB9IGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0W2lvc2RldmljZV0gPSB0XG4gICAgICByZXN1bHQuaW9zID0gdFxuICAgIH1cblxuICAgIC8vIE9TIHZlcnNpb24gZXh0cmFjdGlvblxuICAgIHZhciBvc1ZlcnNpb24gPSAnJztcbiAgICBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL29zIChcXGQrKFtfXFxzXVxcZCspKikgbGlrZSBtYWMgb3MgeC9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2FuZHJvaWRbIFxcLy1dKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53ZWJvcykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvKD86d2VifGhwdylvc1xcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmxhY2tiZXJyeSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvcmltXFxzdGFibGV0XFxzb3NcXHMoXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJhZGEpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2JhZGFcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LnRpemVuKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC90aXplbltcXC9cXHNdKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9XG4gICAgaWYgKG9zVmVyc2lvbikge1xuICAgICAgcmVzdWx0Lm9zdmVyc2lvbiA9IG9zVmVyc2lvbjtcbiAgICB9XG5cbiAgICAvLyBkZXZpY2UgdHlwZSBleHRyYWN0aW9uXG4gICAgdmFyIG9zTWFqb3JWZXJzaW9uID0gb3NWZXJzaW9uLnNwbGl0KCcuJylbMF07XG4gICAgaWYgKHRhYmxldCB8fCBpb3NkZXZpY2UgPT0gJ2lwYWQnIHx8IChhbmRyb2lkICYmIChvc01ham9yVmVyc2lvbiA9PSAzIHx8IChvc01ham9yVmVyc2lvbiA9PSA0ICYmICFtb2JpbGUpKSkgfHwgcmVzdWx0LnNpbGspIHtcbiAgICAgIHJlc3VsdC50YWJsZXQgPSB0XG4gICAgfSBlbHNlIGlmIChtb2JpbGUgfHwgaW9zZGV2aWNlID09ICdpcGhvbmUnIHx8IGlvc2RldmljZSA9PSAnaXBvZCcgfHwgYW5kcm9pZCB8fCByZXN1bHQuYmxhY2tiZXJyeSB8fCByZXN1bHQud2Vib3MgfHwgcmVzdWx0LmJhZGEpIHtcbiAgICAgIHJlc3VsdC5tb2JpbGUgPSB0XG4gICAgfVxuXG4gICAgLy8gR3JhZGVkIEJyb3dzZXIgU3VwcG9ydFxuICAgIC8vIGh0dHA6Ly9kZXZlbG9wZXIueWFob28uY29tL3l1aS9hcnRpY2xlcy9nYnNcbiAgICBpZiAocmVzdWx0Lm1zZWRnZSB8fFxuICAgICAgICAocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTApIHx8XG4gICAgICAgIChyZXN1bHQueWFuZGV4YnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSAxNSkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA+PSAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5ibGFja2JlcnJ5ICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjEpXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmEgPSB0O1xuICAgIH1cbiAgICBlbHNlIGlmICgocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPCAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPCAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uIDwgMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPCA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uIDwgMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA8IDYpXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmMgPSB0XG4gICAgfSBlbHNlIHJlc3VsdC54ID0gdFxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgdmFyIGJvd3NlciA9IGRldGVjdCh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci51c2VyQWdlbnQgOiAnJylcblxuICBib3dzZXIudGVzdCA9IGZ1bmN0aW9uIChicm93c2VyTGlzdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJvd3Nlckxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBicm93c2VySXRlbSA9IGJyb3dzZXJMaXN0W2ldO1xuICAgICAgaWYgKHR5cGVvZiBicm93c2VySXRlbT09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoYnJvd3Nlckl0ZW0gaW4gYm93c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3Qgc28gd2UgY2FuXG4gICAqIHJldXNlIGl0IHRvIHRlc3Qgb3RoZXIgdXNlciBhZ2VudHMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBmdXR1cmUgdGVzdHMuXG4gICAqL1xuICBib3dzZXIuX2RldGVjdCA9IGRldGVjdDtcblxuICByZXR1cm4gYm93c2VyXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBnZXRTaWJsaW5nID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgc2libGluZyA9IGVsZW1lbnRbdHlwZV07XG4gICAgICBpZiAoc2libGluZyAmJiBzaWJsaW5nLmdldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykpIHJldHVybiBzaWJsaW5nO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6IGdldFNpYmxpbmcoJ25leHRFbGVtZW50U2libGluZycpLFxuICAgIHByZXZpb3VzOiBnZXRTaWJsaW5nKCdwcmV2aW91c0VsZW1lbnRTaWJsaW5nJyksXG4gIH07XG59KSgpO1xuIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4vdXRpbC9zdHJpbmcnKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgYWxsb3dlZEVsZW1lbnRzLCByZXF1aXJlZEF0dHJpYnV0ZXMsIHRyYW5zZm9ybUVsZW1lbnRzO1xuICB2YXIgYmxvY2tMZXZlbEVsZW1lbnRzLCBzcGxpdEludG9CbG9ja3M7XG4gIHZhciB3aGl0ZXNwYWNlT25seSA9IC9eXFxzKiQvO1xuICB2YXIgYmxvY2tQbGFjZWhvbGRlciA9ICc8IS0tIEJMT0NLIC0tPic7XG5cbiAgdmFyIHVwZGF0ZUNvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgaSwgbmFtZSwgcnVsZXMgPSBjb25maWcucGFzdGVkSHRtbFJ1bGVzO1xuICAgIGFsbG93ZWRFbGVtZW50cyA9IHJ1bGVzLmFsbG93ZWRFbGVtZW50cyB8fCB7fTtcbiAgICByZXF1aXJlZEF0dHJpYnV0ZXMgPSBydWxlcy5yZXF1aXJlZEF0dHJpYnV0ZXMgfHwge307XG4gICAgdHJhbnNmb3JtRWxlbWVudHMgPSBydWxlcy50cmFuc2Zvcm1FbGVtZW50cyB8fCB7fTtcblxuICAgIGJsb2NrTGV2ZWxFbGVtZW50cyA9IHt9O1xuICAgIGZvciAoaSA9IDA7IGkgPCBydWxlcy5ibG9ja0xldmVsRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5hbWUgPSBydWxlcy5ibG9ja0xldmVsRWxlbWVudHNbaV07XG4gICAgICBibG9ja0xldmVsRWxlbWVudHNbbmFtZV0gPSB0cnVlO1xuICAgIH1cbiAgICBzcGxpdEludG9CbG9ja3MgPSB7fTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcnVsZXMuc3BsaXRJbnRvQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuYW1lID0gcnVsZXMuc3BsaXRJbnRvQmxvY2tzW2ldO1xuICAgICAgc3BsaXRJbnRvQmxvY2tzW25hbWVdID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgdXBkYXRlQ29uZmlnKGNvbmZpZyk7XG5cbiAgcmV0dXJuIHtcblxuICAgIHVwZGF0ZUNvbmZpZzogdXBkYXRlQ29uZmlnLFxuXG4gICAgcGFzdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvciwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb2N1bWVudCA9IGVsZW1lbnQub3duZXJEb2N1bWVudDtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGNvbmZpZy5wYXN0aW5nQXR0cmlidXRlLCB0cnVlKTtcblxuICAgICAgaWYgKGN1cnNvci5pc1NlbGVjdGlvbikge1xuICAgICAgICBjdXJzb3IgPSBjdXJzb3IuZGVsZXRlQ29udGVudCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBwbGFjZWhvbGRlciBhbmQgc2V0IHRoZSBmb2N1cyB0byB0aGUgcGFzdGVob2xkZXJcbiAgICAgIC8vIHRvIHJlZGlyZWN0IHRoZSBicm93c2VyIHBhc3RpbmcgaW50byB0aGUgcGFzdGVob2xkZXIuXG4gICAgICBjdXJzb3Iuc2F2ZSgpO1xuICAgICAgdmFyIHBhc3RlSG9sZGVyID0gdGhpcy5pbmplY3RQYXN0ZWhvbGRlcihkb2N1bWVudCk7XG4gICAgICBwYXN0ZUhvbGRlci5mb2N1cygpO1xuXG4gICAgICAvLyBVc2UgYSB0aW1lb3V0IHRvIGdpdmUgdGhlIGJyb3dzZXIgc29tZSB0aW1lIHRvIHBhc3RlIHRoZSBjb250ZW50LlxuICAgICAgLy8gQWZ0ZXIgdGhhdCBncmFiIHRoZSBwYXN0ZWQgY29udGVudCwgZmlsdGVyIGl0IGFuZCByZXN0b3JlIHRoZSBmb2N1cy5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmxvY2tzO1xuXG4gICAgICAgIGJsb2NrcyA9IF90aGlzLnBhcnNlQ29udGVudChwYXN0ZUhvbGRlcik7XG4gICAgICAgICQocGFzdGVIb2xkZXIpLnJlbW92ZSgpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShjb25maWcucGFzdGluZ0F0dHJpYnV0ZSk7XG5cbiAgICAgICAgY3Vyc29yLnJlc3RvcmUoKTtcbiAgICAgICAgY2FsbGJhY2soYmxvY2tzLCBjdXJzb3IpO1xuXG4gICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgaW5qZWN0UGFzdGVob2xkZXI6IGZ1bmN0aW9uKGRvY3VtZW50KSB7XG4gICAgICB2YXIgcGFzdGVIb2xkZXIgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxuICAgICAgICAuYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSlcbiAgICAgICAgLmNzcyh7XG4gICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgcmlnaHQ6ICc1cHgnLFxuICAgICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgICAgd2lkdGg6ICcxcHgnLFxuICAgICAgICAgIGhlaWdodDogJzFweCcsXG4gICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgIG91dGxpbmU6ICdub25lJ1xuICAgICAgICB9KVswXTtcblxuICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQocGFzdGVIb2xkZXIpO1xuICAgICAgcmV0dXJuIHBhc3RlSG9sZGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiAtIFBhcnNlIHBhc3RlZCBjb250ZW50XG4gICAgICogLSBTcGxpdCBpdCB1cCBpbnRvIGJsb2Nrc1xuICAgICAqIC0gY2xlYW4gYW5kIG5vcm1hbGl6ZSBldmVyeSBibG9ja1xuICAgICAqXG4gICAgICogQHBhcmFtIHtET00gbm9kZX0gQSBjb250YWluZXIgd2hlcmUgdGhlIHBhc3RlZCBjb250ZW50IGlzIGxvY2F0ZWQuXG4gICAgICogQHJldHVybnMge0FycmF5IG9mIFN0cmluZ3N9IEFuIGFycmF5IG9mIGNsZWFuZWQgaW5uZXJIVE1MIGxpa2Ugc3RyaW5ncy5cbiAgICAgKi9cbiAgICBwYXJzZUNvbnRlbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblxuICAgICAgLy8gRmlsdGVyIHBhc3RlZCBjb250ZW50XG4gICAgICB2YXIgcGFzdGVkU3RyaW5nID0gdGhpcy5maWx0ZXJIdG1sRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgIC8vIEhhbmRsZSBCbG9ja3NcbiAgICAgIHZhciBibG9ja3MgPSBwYXN0ZWRTdHJpbmcuc3BsaXQoYmxvY2tQbGFjZWhvbGRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBibG9ja3NbaV07XG5cbiAgICAgICAgLy8gQ2xlYW4gV2hpdGVzYXBjZVxuICAgICAgICBlbnRyeSA9IHRoaXMuY2xlYW5XaGl0ZXNwYWNlKGVudHJ5KTtcblxuICAgICAgICAvLyBUcmltIHBhc3RlZCBUZXh0XG4gICAgICAgIGVudHJ5ID0gc3RyaW5nLnRyaW0oZW50cnkpO1xuXG4gICAgICAgIGJsb2Nrc1tpXSA9IGVudHJ5O1xuICAgICAgfVxuXG4gICAgICBibG9ja3MgPSBibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiAhd2hpdGVzcGFjZU9ubHkudGVzdChlbnRyeSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9LFxuXG4gICAgZmlsdGVySHRtbEVsZW1lbnRzOiBmdW5jdGlvbihlbGVtLCBwYXJlbnRzKSB7XG4gICAgICBpZiAoIXBhcmVudHMpIHBhcmVudHMgPSBbXTtcblxuICAgICAgdmFyIGNoaWxkLCBjb250ZW50ID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW0uY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZCA9IGVsZW0uY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSkge1xuICAgICAgICAgIHZhciBjaGlsZENvbnRlbnQgPSB0aGlzLmZpbHRlckh0bWxFbGVtZW50cyhjaGlsZCwgcGFyZW50cyk7XG4gICAgICAgICAgY29udGVudCArPSB0aGlzLmNvbmRpdGlvbmFsTm9kZVdyYXAoY2hpbGQsIGNoaWxkQ29udGVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hpbGQubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgICAgLy8gRXNjYXBlIEhUTUwgY2hhcmFjdGVycyA8LCA+IGFuZCAmXG4gICAgICAgICAgY29udGVudCArPSBzdHJpbmcuZXNjYXBlSHRtbChjaGlsZC5ub2RlVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0sXG5cbiAgICBjb25kaXRpb25hbE5vZGVXcmFwOiBmdW5jdGlvbihjaGlsZCwgY29udGVudCkge1xuICAgICAgdmFyIG5vZGVOYW1lID0gY2hpbGQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIG5vZGVOYW1lID0gdGhpcy50cmFuc2Zvcm1Ob2RlTmFtZShub2RlTmFtZSk7XG5cbiAgICAgIGlmICggdGhpcy5zaG91bGRLZWVwTm9kZShub2RlTmFtZSwgY2hpbGQpICkge1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuZmlsdGVyQXR0cmlidXRlcyhub2RlTmFtZSwgY2hpbGQpO1xuICAgICAgICBpZiAobm9kZU5hbWUgPT09ICdicicpIHtcbiAgICAgICAgICByZXR1cm4gJzwnKyBub2RlTmFtZSArIGF0dHJpYnV0ZXMgKyc+JztcbiAgICAgICAgfSBlbHNlIGlmICggIXdoaXRlc3BhY2VPbmx5LnRlc3QoY29udGVudCkgKSB7XG4gICAgICAgICAgcmV0dXJuICc8Jysgbm9kZU5hbWUgKyBhdHRyaWJ1dGVzICsnPicrIGNvbnRlbnQgKyc8LycrIG5vZGVOYW1lICsnPic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzcGxpdEludG9CbG9ja3Nbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrUGxhY2Vob2xkZXIgKyBjb250ZW50ICsgYmxvY2tQbGFjZWhvbGRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChibG9ja0xldmVsRWxlbWVudHNbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgLy8gcHJldmVudCBtaXNzaW5nIHdoaXRlc3BhY2UgYmV0d2VlbiB0ZXh0IHdoZW4gYmxvY2stbGV2ZWxcbiAgICAgICAgICAvLyBlbGVtZW50cyBhcmUgcmVtb3ZlZC5cbiAgICAgICAgICByZXR1cm4gY29udGVudCArICcgJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaWx0ZXJBdHRyaWJ1dGVzOiBmdW5jdGlvbihub2RlTmFtZSwgbm9kZSkge1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSAnJztcblxuICAgICAgZm9yICh2YXIgaT0wLCBsZW49KG5vZGUuYXR0cmlidXRlcyB8fCBbXSkubGVuZ3RoOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBuYW1lICA9IG5vZGUuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICB2YXIgdmFsdWUgPSBub2RlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICAgIGlmICgoYWxsb3dlZEVsZW1lbnRzW25vZGVOYW1lXVtuYW1lXSkgJiYgdmFsdWUpIHtcbiAgICAgICAgICBhdHRyaWJ1dGVzICs9ICcgJyArIG5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybU5vZGVOYW1lOiBmdW5jdGlvbihub2RlTmFtZSkge1xuICAgICAgaWYgKHRyYW5zZm9ybUVsZW1lbnRzW25vZGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtRWxlbWVudHNbbm9kZU5hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYXNSZXF1aXJlZEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKG5vZGVOYW1lLCBub2RlKSB7XG4gICAgICB2YXIgYXR0ck5hbWUsIGF0dHJWYWx1ZTtcbiAgICAgIHZhciByZXF1aXJlZEF0dHJzID0gcmVxdWlyZWRBdHRyaWJ1dGVzW25vZGVOYW1lXTtcbiAgICAgIGlmIChyZXF1aXJlZEF0dHJzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWRBdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGF0dHJOYW1lID0gcmVxdWlyZWRBdHRyc1tpXTtcbiAgICAgICAgICBhdHRyVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgICAgaWYgKCFhdHRyVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzaG91bGRLZWVwTm9kZTogZnVuY3Rpb24obm9kZU5hbWUsIG5vZGUpIHtcbiAgICAgIHJldHVybiBhbGxvd2VkRWxlbWVudHNbbm9kZU5hbWVdICYmIHRoaXMuaGFzUmVxdWlyZWRBdHRyaWJ1dGVzKG5vZGVOYW1lLCBub2RlKTtcbiAgICB9LFxuXG4gICAgY2xlYW5XaGl0ZXNwYWNlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBjbGVhbmVkU3RyID0gc3RyLnJlcGxhY2UoLyguKShcXHUwMEEwKS9nLCBmdW5jdGlvbihtYXRjaCwgZ3JvdXAxLCBncm91cDIsIG9mZnNldCwgc3RyaW5nKSB7XG4gICAgICAgIGlmICggL1tcXHUwMDIwXS8udGVzdChncm91cDEpICkge1xuICAgICAgICAgIHJldHVybiBncm91cDEgKyAnXFx1MDBBMCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGdyb3VwMSArICcgJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gY2xlYW5lZFN0cjtcbiAgICB9XG5cbiAgfTtcblxufSkoKTtcbiIsIlxuLyoqXG4gKiBEZWZpbmVzIGFsbCBzdXBwb3J0ZWQgZXZlbnQgdHlwZXMgYnkgRWRpdGFibGUuSlMgYW5kIHByb3ZpZGVzIGRlZmF1bHRcbiAqIGltcGxlbWVudGF0aW9ucyBmb3IgdGhlbSBkZWZpbmVkIGluIHt7I2Nyb3NzTGluayBcIkJlaGF2aW9yXCJ9fXt7L2Nyb3NzTGlua319XG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZzogZmFsc2UsXG4gIGxvZ0Vycm9yczogdHJ1ZSxcbiAgZWRpdGFibGVDbGFzczogJ2pzLWVkaXRhYmxlJyxcbiAgZWRpdGFibGVEaXNhYmxlZENsYXNzOiAnanMtZWRpdGFibGUtZGlzYWJsZWQnLFxuICBwYXN0aW5nQXR0cmlidXRlOiAnZGF0YS1lZGl0YWJsZS1pcy1wYXN0aW5nJyxcbiAgYm9sZFRhZzogJ3N0cm9uZycsXG4gIGl0YWxpY1RhZzogJ2VtJyxcblxuICAvLyBSdWxlcyB0aGF0IGFyZSBhcHBsaWVkIHdoZW4gZmlsdGVyaW5nIHBhc3RlZCBjb250ZW50XG4gIHBhc3RlZEh0bWxSdWxlczoge1xuXG4gICAgLy8gRWxlbWVudHMgYW5kIHRoZWlyIGF0dHJpYnV0ZXMgdG8ga2VlcCBpbiBwYXN0ZWQgdGV4dFxuICAgIGFsbG93ZWRFbGVtZW50czoge1xuICAgICAgJ2EnOiB7XG4gICAgICAgICdocmVmJzogdHJ1ZVxuICAgICAgfSxcbiAgICAgICdzdHJvbmcnOiB7fSxcbiAgICAgICdlbSc6IHt9LFxuICAgICAgJ2JyJzoge31cbiAgICB9LFxuXG4gICAgLy8gRWxlbWVudHMgdGhhdCBoYXZlIHJlcXVpcmVkIGF0dHJpYnV0ZXMuXG4gICAgLy8gSWYgdGhlc2UgYXJlIG5vdCBwcmVzZW50IHRoZSBlbGVtZW50cyBhcmUgZmlsdGVyZWQgb3V0LlxuICAgIC8vIFJlcXVpcmVkIGF0dHJpYnV0ZXMgaGF2ZSB0byBiZSBwcmVzZW50IGluIHRoZSAnYWxsb3dlZCcgb2JqZWN0XG4gICAgLy8gYXMgd2VsbCBpZiB0aGV5IHNob3VsZCBub3QgYmUgZmlsdGVyZWQgb3V0LlxuICAgIHJlcXVpcmVkQXR0cmlidXRlczoge1xuICAgICAgJ2EnOiBbJ2hyZWYnXVxuICAgIH0sXG5cbiAgICAvLyBFbGVtZW50cyB0aGF0IHNob3VsZCBiZSB0cmFuc2Zvcm1lZCBpbnRvIG90aGVyIGVsZW1lbnRzXG4gICAgdHJhbnNmb3JtRWxlbWVudHM6IHtcbiAgICAgICdiJzogJ3N0cm9uZycsXG4gICAgICAnaSc6ICdlbSdcbiAgICB9LFxuXG4gICAgLy8gQSBsaXN0IG9mIGVsZW1lbnRzIHdoaWNoIHNob3VsZCBiZSBzcGxpdCBpbnRvIHBhcmFncmFwaHMuXG4gICAgc3BsaXRJbnRvQmxvY2tzOiBbJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ3AnLCAnYmxvY2txdW90ZSddLFxuXG4gICAgLy8gQSBsaXN0IG9mIEhUTUwgYmxvY2sgbGV2ZWwgZWxlbWVudHMuXG4gICAgYmxvY2tMZXZlbEVsZW1lbnRzOiBbJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ2RpdicsICdwJywgJ3ByZScsICdocicsICdibG9ja3F1b3RlJywgJ2FydGljbGUnLCAnZmlndXJlJywgJ2hlYWRlcicsICdmb290ZXInLCAndWwnLCAnb2wnLCAnbGknLCAnc2VjdGlvbicsICd0YWJsZScsICd2aWRlbyddXG4gIH1cblxufTtcblxuIiwidmFyIHJhbmd5ID0gcmVxdWlyZSgncmFuZ3knKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpO1xudmFyIHJhbmdlU2F2ZVJlc3RvcmUgPSByZXF1aXJlKCcuL3JhbmdlLXNhdmUtcmVzdG9yZScpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi91dGlsL3N0cmluZycpO1xuXG52YXIgY29udGVudDtcbm1vZHVsZS5leHBvcnRzID0gY29udGVudCA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgcmVzdG9yZVJhbmdlID0gZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIGZ1bmMpIHtcbiAgICByYW5nZSA9IHJhbmdlU2F2ZVJlc3RvcmUuc2F2ZShyYW5nZSk7XG4gICAgZnVuYy5jYWxsKGNvbnRlbnQpO1xuICAgIHJldHVybiByYW5nZVNhdmVSZXN0b3JlLnJlc3RvcmUoaG9zdCwgcmFuZ2UpO1xuICB9O1xuXG4gIHZhciB6ZXJvV2lkdGhTcGFjZSA9IC9cXHUyMDBCL2c7XG4gIHZhciB6ZXJvV2lkdGhOb25CcmVha2luZ1NwYWNlID0gL1xcdUZFRkYvZztcbiAgdmFyIHdoaXRlc3BhY2VFeGNlcHRTcGFjZSA9IC9bXlxcUyBdL2c7XG5cbiAgcmV0dXJuIHtcblxuICAgIC8qKlxuICAgICAqIENsZWFuIHVwIHRoZSBIdG1sLlxuICAgICAqL1xuICAgIHRpZHlIdG1sOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAvLyBpZiAoZWxlbWVudC5ub3JtYWxpemUpIGVsZW1lbnQubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLm5vcm1hbGl6ZVRhZ3MoZWxlbWVudCk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGVtcHR5IHRhZ3MgYW5kIG1lcmdlIGNvbnNlY3V0aXZlIHRhZ3MgKHRoZXkgbXVzdCBoYXZlIHRoZSBzYW1lXG4gICAgICogYXR0cmlidXRlcykuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIG5vcm1hbGl6ZVRhZ3NcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBwcm9jZXNzLlxuICAgICAqL1xuICAgIG5vcm1hbGl6ZVRhZ3M6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBpLCBqLCBub2RlLCBzaWJsaW5nO1xuXG4gICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9kZSA9IGVsZW1lbnQuY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgaWYgKCFub2RlKSBjb250aW51ZTtcblxuICAgICAgICAvLyBza2lwIGVtcHR5IHRhZ3MsIHNvIHRoZXknbGwgZ2V0IHJlbW92ZWRcbiAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgIT09ICdCUicgJiYgIW5vZGUudGV4dENvbnRlbnQpIGNvbnRpbnVlO1xuXG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSAmJiBub2RlLm5vZGVOYW1lICE9PSAnQlInKSB7XG4gICAgICAgICAgc2libGluZyA9IG5vZGU7XG4gICAgICAgICAgd2hpbGUgKChzaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZykgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghcGFyc2VyLmlzU2FtZU5vZGUoc2libGluZywgbm9kZSkpXG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgc2libGluZy5jaGlsZE5vZGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoc2libGluZy5jaGlsZE5vZGVzW2pdLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNpYmxpbmcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzaWJsaW5nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLm5vcm1hbGl6ZVRhZ3Mobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZVdoaXRlc3BhY2U6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2Uod2hpdGVzcGFjZUV4Y2VwdFNwYWNlLCAnICcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhbiB0aGUgZWxlbWVudCBmcm9tIGNoYXJhY3RlciwgdGFncywgZXRjLi4uIGFkZGVkIGJ5IHRoZSBwbHVnaW4gbG9naWMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGNsZWFuSW50ZXJuYWxzXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHJvY2Vzcy5cbiAgICAgKi9cbiAgICBjbGVhbkludGVybmFsczogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgLy8gVXNlcyBleHRyYWN0IGNvbnRlbnQgZm9yIHNpbXBsaWNpdHkuIEEgY3VzdG9tIG1ldGhvZFxuICAgICAgLy8gdGhhdCBkb2VzIG5vdCBjbG9uZSB0aGUgZWxlbWVudCBjb3VsZCBiZSBmYXN0ZXIgaWYgbmVlZGVkLlxuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmV4dHJhY3RDb250ZW50KGVsZW1lbnQsIHRydWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0cyB0aGUgY29udGVudCBmcm9tIGEgaG9zdCBlbGVtZW50LlxuICAgICAqIERvZXMgbm90IHRvdWNoIG9yIGNoYW5nZSB0aGUgaG9zdC4gSnVzdCByZXR1cm5zXG4gICAgICogdGhlIGNvbnRlbnQgYW5kIHJlbW92ZXMgZWxlbWVudHMgbWFya2VkIGZvciByZW1vdmFsIGJ5IGVkaXRhYmxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtET00gbm9kZSBvciBkb2N1bWVudCBmcmFtZ2VudH0gRWxlbWVudCB3aGVyZSB0byBjbGVhbiBvdXQgdGhlIGlubmVySFRNTC4gSWYgeW91IHBhc3MgYSBkb2N1bWVudCBmcmFnbWVudCBpdCB3aWxsIGJlIGVtcHR5IGFmdGVyIHRoaXMgY2FsbC5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IEZsYWcgd2hldGhlciB0byBrZWVwIHVpIGVsZW1lbnRzIGxpa2Ugc3BlbGxjaGVja2luZyBoaWdobGlnaHRzLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBjbGVhbmVkIGlubmVySFRNTCBvZiB0aGUgcGFzc2VkIGVsZW1lbnQgb3IgZG9jdW1lbnQgZnJhZ21lbnQuXG4gICAgICovXG4gICAgZXh0cmFjdENvbnRlbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGtlZXBVaUVsZW1lbnRzKSB7XG4gICAgICB2YXIgaW5uZXJIdG1sO1xuICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IG5vZGVUeXBlLmRvY3VtZW50RnJhZ21lbnROb2RlKSB7XG4gICAgICAgIGlubmVySHRtbCA9IHRoaXMuZ2V0SW5uZXJIdG1sT2ZGcmFnbWVudChlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlubmVySHRtbCA9IGVsZW1lbnQuaW5uZXJIVE1MO1xuICAgICAgfVxuXG4gICAgICBpbm5lckh0bWwgPSBpbm5lckh0bWwucmVwbGFjZSh6ZXJvV2lkdGhOb25CcmVha2luZ1NwYWNlLCAnJyk7IC8vIFVzZWQgZm9yIGZvcmNpbmcgaW5saW5lIGVsbWVudHMgdG8gaGF2ZSBhIGhlaWdodFxuICAgICAgaW5uZXJIdG1sID0gaW5uZXJIdG1sLnJlcGxhY2UoemVyb1dpZHRoU3BhY2UsICc8YnI+Jyk7IC8vIFVzZWQgZm9yIGNyb3NzLWJyb3dzZXIgbmV3bGluZXNcblxuICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjbG9uZS5pbm5lckhUTUwgPSBpbm5lckh0bWw7XG4gICAgICB0aGlzLnVud3JhcEludGVybmFsTm9kZXMoY2xvbmUsIGtlZXBVaUVsZW1lbnRzKTtcblxuICAgICAgcmV0dXJuIGNsb25lLmlubmVySFRNTDtcbiAgICB9LFxuXG4gICAgZ2V0SW5uZXJIdG1sT2ZGcmFnbWVudDogZnVuY3Rpb24oZG9jdW1lbnRGcmFnbWVudCkge1xuICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50RnJhZ21lbnQpO1xuICAgICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGRvY3VtZW50IGZyYWdtZW50IGZyb20gYW4gaHRtbCBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZS5nLiAnc29tZSBodG1sIDxzcGFuPnRleHQ8L3NwYW4+LidcbiAgICAgKi9cbiAgICBjcmVhdGVGcmFnbWVudEZyb21TdHJpbmc6IGZ1bmN0aW9uKGh0bWxTdHJpbmcpIHtcbiAgICAgIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgIHZhciBjb250ZW50cyA9ICQoJzxkaXY+JykuaHRtbChodG1sU3RyaW5nKS5jb250ZW50cygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZWwgPSBjb250ZW50c1tpXTtcbiAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH0sXG5cbiAgICBhZG9wdEVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGUsIGRvYykge1xuICAgICAgaWYgKG5vZGUub3duZXJEb2N1bWVudCAhPT0gZG9jKSB7XG4gICAgICAgIHJldHVybiBkb2MuYWRvcHROb2RlKG5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYSBzbGlnaHQgdmFyaWF0aW9uIG9mIHRoZSBjbG9uZUNvbnRlbnRzIG1ldGhvZCBvZiBhIHJhbmd5UmFuZ2UuXG4gICAgICogSXQgd2lsbCByZXR1cm4gYSBmcmFnbWVudCB3aXRoIHRoZSBjbG9uZWQgY29udGVudHMgb2YgdGhlIHJhbmdlXG4gICAgICogd2l0aG91dCB0aGUgY29tbW9uQW5jZXN0b3JFbGVtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtyYW5neVJhbmdlfVxuICAgICAqIEByZXR1cm4ge0RvY3VtZW50RnJhZ21lbnR9XG4gICAgICovXG4gICAgY2xvbmVSYW5nZUNvbnRlbnRzOiBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgdmFyIHJhbmdlRnJhZ21lbnQgPSByYW5nZS5jbG9uZUNvbnRlbnRzKCk7XG4gICAgICB2YXIgcGFyZW50ID0gcmFuZ2VGcmFnbWVudC5jaGlsZE5vZGVzWzBdO1xuICAgICAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgd2hpbGUgKHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChwYXJlbnQuY2hpbGROb2Rlc1swXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBlbGVtZW50cyB0aGF0IHdlcmUgaW5zZXJ0ZWQgZm9yIGludGVybmFsIG9yIHVzZXIgaW50ZXJmYWNlIHB1cnBvc2VzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0RPTSBub2RlfVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gd2hldGhlciB0byBrZWVwIHVpIGVsZW1lbnRzIGxpa2Ugc3BlbGxjaGVja2luZyBoaWdobGlnaHRzXG4gICAgICogQ3VycmVudGx5OlxuICAgICAqIC0gU2F2ZWQgcmFuZ2VzXG4gICAgICovXG4gICAgdW53cmFwSW50ZXJuYWxOb2RlczogZnVuY3Rpb24oc2libGluZywga2VlcFVpRWxlbWVudHMpIHtcbiAgICAgIHdoaWxlIChzaWJsaW5nKSB7XG4gICAgICAgIHZhciBuZXh0U2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgaWYgKHNpYmxpbmcubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlKSB7XG4gICAgICAgICAgdmFyIGF0dHIgPSBzaWJsaW5nLmdldEF0dHJpYnV0ZSgnZGF0YS1lZGl0YWJsZScpO1xuXG4gICAgICAgICAgaWYgKHNpYmxpbmcuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy51bndyYXBJbnRlcm5hbE5vZGVzKHNpYmxpbmcuZmlyc3RDaGlsZCwga2VlcFVpRWxlbWVudHMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhdHRyID09PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgJChzaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGF0dHIgPT09ICd1bndyYXAnKSB7XG4gICAgICAgICAgICB0aGlzLnVud3JhcChzaWJsaW5nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGF0dHIgPT09ICd1aS1yZW1vdmUnICYmICFrZWVwVWlFbGVtZW50cykge1xuICAgICAgICAgICAgJChzaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGF0dHIgPT09ICd1aS11bndyYXAnICYmICFrZWVwVWlFbGVtZW50cykge1xuICAgICAgICAgICAgdGhpcy51bndyYXAoc2libGluZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNpYmxpbmcgPSBuZXh0U2libGluZztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCB0YWdzIHRoYXQgc3RhcnQgb3IgZW5kIGluc2lkZSB0aGUgcmFuZ2VcbiAgICAgKi9cbiAgICBnZXRUYWdzOiBmdW5jdGlvbihob3N0LCByYW5nZSwgZmlsdGVyRnVuYykge1xuICAgICAgdmFyIHRhZ3MgPSB0aGlzLmdldElubmVyVGFncyhyYW5nZSwgZmlsdGVyRnVuYyk7XG5cbiAgICAgIC8vIGdldCBhbGwgdGFncyB0aGF0IHN1cnJvdW5kIHRoZSByYW5nZVxuICAgICAgdmFyIG5vZGUgPSByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcjtcbiAgICAgIHdoaWxlIChub2RlICE9PSBob3N0KSB7XG4gICAgICAgIGlmICghZmlsdGVyRnVuYyB8fCBmaWx0ZXJGdW5jKG5vZGUpKSB7XG4gICAgICAgICAgdGFncy5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFncztcbiAgICB9LFxuXG4gICAgZ2V0VGFnc0J5TmFtZTogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHRhZ05hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRhZ3MoaG9zdCwgcmFuZ2UsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09IHRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhZ3MgdGhhdCBzdGFydCBvciBlbmQgaW5zaWRlIHRoZSByYW5nZVxuICAgICAqL1xuICAgIGdldElubmVyVGFnczogZnVuY3Rpb24ocmFuZ2UsIGZpbHRlckZ1bmMpIHtcbiAgICAgIHJldHVybiByYW5nZS5nZXROb2Rlcyhbbm9kZVR5cGUuZWxlbWVudE5vZGVdLCBmaWx0ZXJGdW5jKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtIGFuIGFycmF5IG9mIGVsZW1lbnRzIGludG8gYSBhbiBhcnJheVxuICAgICAqIG9mIHRhZ25hbWVzIGluIHVwcGVyY2FzZVxuICAgICAqXG4gICAgICogQHJldHVybiBleGFtcGxlOiBbJ1NUUk9ORycsICdCJ11cbiAgICAgKi9cbiAgICBnZXRUYWdOYW1lczogZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgIHZhciBuYW1lcyA9IFtdO1xuICAgICAgaWYgKCFlbGVtZW50cykgcmV0dXJuIG5hbWVzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5hbWVzLnB1c2goZWxlbWVudHNbaV0ubm9kZU5hbWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWVzO1xuICAgIH0sXG5cbiAgICBpc0FmZmVjdGVkQnk6IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCB0YWdOYW1lKSB7XG4gICAgICB2YXIgZWxlbTtcbiAgICAgIHZhciB0YWdzID0gdGhpcy5nZXRUYWdzKGhvc3QsIHJhbmdlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtID0gdGFnc1tpXTtcbiAgICAgICAgaWYgKGVsZW0ubm9kZU5hbWUgPT09IHRhZ05hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHJhbmdlIHNlbGVjdHMgYWxsIG9mIHRoZSBlbGVtZW50cyBjb250ZW50cyxcbiAgICAgKiBub3QgbGVzcyBvciBtb3JlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHZpc2libGU6IE9ubHkgY29tcGFyZSB2aXNpYmxlIHRleHQuIFRoYXQgd2F5IGl0IGRvZXMgbm90XG4gICAgICogICBtYXR0ZXIgaWYgdGhlIHVzZXIgc2VsZWN0cyBhbiBhZGRpdGlvbmFsIHdoaXRlc3BhY2Ugb3Igbm90LlxuICAgICAqL1xuICAgIGlzRXhhY3RTZWxlY3Rpb246IGZ1bmN0aW9uKHJhbmdlLCBlbGVtLCB2aXNpYmxlKSB7XG4gICAgICB2YXIgZWxlbVJhbmdlID0gcmFuZ3kuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIGVsZW1SYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbSk7XG4gICAgICBpZiAocmFuZ2UuaW50ZXJzZWN0c1JhbmdlKGVsZW1SYW5nZSkpIHtcbiAgICAgICAgdmFyIHJhbmdlVGV4dCA9IHJhbmdlLnRvU3RyaW5nKCk7XG4gICAgICAgIHZhciBlbGVtVGV4dCA9ICQoZWxlbSkudGV4dCgpO1xuXG4gICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgcmFuZ2VUZXh0ID0gc3RyaW5nLnRyaW0ocmFuZ2VUZXh0KTtcbiAgICAgICAgICBlbGVtVGV4dCA9IHN0cmluZy50cmltKGVsZW1UZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByYW5nZVRleHQgIT09ICcnICYmIHJhbmdlVGV4dCA9PT0gZWxlbVRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGV4cGFuZFRvOiBmdW5jdGlvbihob3N0LCByYW5nZSwgZWxlbSkge1xuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW0pO1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0sXG5cbiAgICB0b2dnbGVUYWc6IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCBlbGVtKSB7XG4gICAgICB2YXIgZWxlbXMgPSB0aGlzLmdldFRhZ3NCeU5hbWUoaG9zdCwgcmFuZ2UsIGVsZW0ubm9kZU5hbWUpO1xuXG4gICAgICBpZiAoZWxlbXMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgdGhpcy5pc0V4YWN0U2VsZWN0aW9uKHJhbmdlLCBlbGVtc1swXSwgJ3Zpc2libGUnKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVGb3JtYXR0aW5nKGhvc3QsIHJhbmdlLCBlbGVtLm5vZGVOYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZm9yY2VXcmFwKGhvc3QsIHJhbmdlLCBlbGVtKTtcbiAgICB9LFxuXG4gICAgaXNXcmFwcGFibGU6IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICByZXR1cm4gcmFuZ2UuY2FuU3Vycm91bmRDb250ZW50cygpO1xuICAgIH0sXG5cbiAgICBmb3JjZVdyYXA6IGZ1bmN0aW9uKGhvc3QsIHJhbmdlLCBlbGVtKSB7XG4gICAgICByYW5nZSA9IHJlc3RvcmVSYW5nZShob3N0LCByYW5nZSwgZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5udWtlKGhvc3QsIHJhbmdlLCBlbGVtLm5vZGVOYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyByZW1vdmUgYWxsIHRhZ3MgaWYgdGhlIHJhbmdlIGlzIG5vdCB3cmFwcGFibGVcbiAgICAgIGlmICghdGhpcy5pc1dyYXBwYWJsZShyYW5nZSkpIHtcbiAgICAgICAgcmFuZ2UgPSByZXN0b3JlUmFuZ2UoaG9zdCwgcmFuZ2UsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdGhpcy5udWtlKGhvc3QsIHJhbmdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMud3JhcChyYW5nZSwgZWxlbSk7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIHdyYXA6IGZ1bmN0aW9uKHJhbmdlLCBlbGVtKSB7XG4gICAgICBlbGVtID0gc3RyaW5nLmlzU3RyaW5nKGVsZW0pID9cbiAgICAgICAgJChlbGVtKVswXSA6XG4gICAgICAgIGVsZW07XG5cbiAgICAgIGlmICh0aGlzLmlzV3JhcHBhYmxlKHJhbmdlKSkge1xuICAgICAgICB2YXIgYSA9IHJhbmdlLnN1cnJvdW5kQ29udGVudHMoZWxlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnY29udGVudC53cmFwKCk6IGNhbiBub3Qgc3Vycm91bmQgcmFuZ2UnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdW53cmFwOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pO1xuICAgICAgdmFyIGNvbnRlbnRzID0gJGVsZW0uY29udGVudHMoKTtcbiAgICAgIGlmIChjb250ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29udGVudHMudW53cmFwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkZWxlbS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlRm9ybWF0dGluZzogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHRhZ05hbWUpIHtcbiAgICAgIHJldHVybiByZXN0b3JlUmFuZ2UoaG9zdCwgcmFuZ2UsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMubnVrZShob3N0LCByYW5nZSwgdGFnTmFtZSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW53cmFwIGFsbCB0YWdzIHRoaXMgcmFuZ2UgaXMgYWZmZWN0ZWQgYnkuXG4gICAgICogQ2FuIGFsc28gYWZmZWN0IGNvbnRlbnQgb3V0c2lkZSBvZiB0aGUgcmFuZ2UuXG4gICAgICovXG4gICAgbnVrZTogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHRhZ05hbWUpIHtcbiAgICAgIHZhciB0YWdzID0gdGhpcy5nZXRUYWdzKGhvc3QsIHJhbmdlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZWxlbSA9IHRhZ3NbaV07XG4gICAgICAgIGlmICggZWxlbS5ub2RlTmFtZSAhPT0gJ0JSJyAmJiAoIXRhZ05hbWUgfHwgZWxlbS5ub2RlTmFtZSA9PT0gdGFnTmFtZS50b1VwcGVyQ2FzZSgpKSApIHtcbiAgICAgICAgICB0aGlzLnVud3JhcChlbGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgYSBzaW5nbGUgY2hhcmFjdGVyIChvciBzdHJpbmcpIGJlZm9yZSBvciBhZnRlciB0aGVcbiAgICAgKiB0aGUgcmFuZ2UuXG4gICAgICovXG4gICAgaW5zZXJ0Q2hhcmFjdGVyOiBmdW5jdGlvbihyYW5nZSwgY2hhcmFjdGVyLCBhdFN0YXJ0KSB7XG4gICAgICB2YXIgaW5zZXJ0RWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjaGFyYWN0ZXIpO1xuXG4gICAgICB2YXIgYm91bmRhcnlSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgIGJvdW5kYXJ5UmFuZ2UuY29sbGFwc2UoYXRTdGFydCk7XG4gICAgICBib3VuZGFyeVJhbmdlLmluc2VydE5vZGUoaW5zZXJ0RWwpO1xuXG4gICAgICBpZiAoYXRTdGFydCkge1xuICAgICAgICByYW5nZS5zZXRTdGFydEJlZm9yZShpbnNlcnRFbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZS5zZXRFbmRBZnRlcihpbnNlcnRFbCk7XG4gICAgICB9XG4gICAgICByYW5nZS5ub3JtYWxpemVCb3VuZGFyaWVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1cnJvdW5kIHRoZSByYW5nZSB3aXRoIGNoYXJhY3RlcnMgbGlrZSBzdGFydCBhbmQgZW5kIHF1b3Rlcy5cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgc3Vycm91bmRcbiAgICAgKi9cbiAgICBzdXJyb3VuZDogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpIHtcbiAgICAgIGlmICghZW5kQ2hhcmFjdGVyKSBlbmRDaGFyYWN0ZXIgPSBzdGFydENoYXJhY3RlcjtcbiAgICAgIHRoaXMuaW5zZXJ0Q2hhcmFjdGVyKHJhbmdlLCBlbmRDaGFyYWN0ZXIsIGZhbHNlKTtcbiAgICAgIHRoaXMuaW5zZXJ0Q2hhcmFjdGVyKHJhbmdlLCBzdGFydENoYXJhY3RlciwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBjaGFyYWN0ZXIgZnJvbSB0aGUgdGV4dCB3aXRoaW4gYSByYW5nZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZGVsZXRlQ2hhcmFjdGVyXG4gICAgICovXG4gICAgZGVsZXRlQ2hhcmFjdGVyOiBmdW5jdGlvbihob3N0LCByYW5nZSwgY2hhcmFjdGVyKSB7XG4gICAgICBpZiAodGhpcy5jb250YWluc1N0cmluZyhyYW5nZSwgY2hhcmFjdGVyKSkge1xuICAgICAgICByYW5nZS5zcGxpdEJvdW5kYXJpZXMoKTtcbiAgICAgICAgcmFuZ2UgPSByZXN0b3JlUmFuZ2UoaG9zdCwgcmFuZ2UsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjaGFyUmVnZXhwID0gc3RyaW5nLnJlZ2V4cChjaGFyYWN0ZXIpO1xuXG4gICAgICAgICAgdmFyIHRleHROb2RlcyA9IHJhbmdlLmdldE5vZGVzKFtub2RlVHlwZS50ZXh0Tm9kZV0sIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5vZGVWYWx1ZS5zZWFyY2goY2hhclJlZ2V4cCkgPj0gMDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRleHROb2Rlc1tpXTtcbiAgICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gbm9kZS5ub2RlVmFsdWUucmVwbGFjZShjaGFyUmVnZXhwLCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmFuZ2Uubm9ybWFsaXplQm91bmRhcmllcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIGNvbnRhaW5zU3RyaW5nOiBmdW5jdGlvbihyYW5nZSwgc3RyKSB7XG4gICAgICB2YXIgdGV4dCA9IHJhbmdlLnRvU3RyaW5nKCk7XG4gICAgICByZXR1cm4gdGV4dC5pbmRleE9mKHN0cikgPj0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW53cmFwIGFsbCB0YWdzIHRoaXMgcmFuZ2UgaXMgYWZmZWN0ZWQgYnkuXG4gICAgICogQ2FuIGFsc28gYWZmZWN0IGNvbnRlbnQgb3V0c2lkZSBvZiB0aGUgcmFuZ2UuXG4gICAgICovXG4gICAgbnVrZVRhZzogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIHRhZ05hbWUpIHtcbiAgICAgIHZhciB0YWdzID0gdGhpcy5nZXRUYWdzKGhvc3QsIHJhbmdlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZWxlbSA9IHRhZ3NbaV07XG4gICAgICAgIGlmIChlbGVtLm5vZGVOYW1lID09PSB0YWdOYW1lKVxuICAgICAgICAgIHRoaXMudW53cmFwKGVsZW0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pKCk7XG4iLCJ2YXIgcmFuZ3kgPSByZXF1aXJlKCdyYW5neScpO1xudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIGVycm9yID0gcmVxdWlyZSgnLi91dGlsL2Vycm9yJyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBjb250ZW50ID0gcmVxdWlyZSgnLi9jb250ZW50Jyk7XG52YXIgY2xpcGJvYXJkID0gcmVxdWlyZSgnLi9jbGlwYm9hcmQnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9kaXNwYXRjaGVyJyk7XG52YXIgQ3Vyc29yID0gcmVxdWlyZSgnLi9jdXJzb3InKTtcbnZhciBTcGVsbGNoZWNrID0gcmVxdWlyZSgnLi9zcGVsbGNoZWNrJyk7XG52YXIgY3JlYXRlRGVmYXVsdEV2ZW50cyA9IHJlcXVpcmUoJy4vY3JlYXRlLWRlZmF1bHQtZXZlbnRzJyk7XG52YXIgYnJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpO1xuXG4vKipcbiAqIFRoZSBDb3JlIG1vZHVsZSBwcm92aWRlcyB0aGUgRWRpdGFibGUgY2xhc3MgdGhhdCBkZWZpbmVzIHRoZSBFZGl0YWJsZS5KU1xuICogQVBJIGFuZCBpcyB0aGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgRWRpdGFibGUuSlMuXG4gKiBJdCBhbHNvIHByb3ZpZGVzIHRoZSBjdXJzb3IgbW9kdWxlIGZvciBjcm9zcy1icm93c2VyIGN1cnNvcnMsIGFuZCB0aGUgZG9tXG4gKiBzdWJtb2R1bGUuXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKi9cblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIEVkaXRhYmxlLkpTIEFQSSB0aGF0IGlzIGV4dGVybmFsbHkgdmlzaWJsZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlndXJhdGlvbiBmb3IgdGhpcyBlZGl0YWJsZSBpbnN0YW5jZS5cbiAqICAgd2luZG93OiBUaGUgd2luZG93IHdoZXJlIHRvIGF0dGFjaCB0aGUgZWRpdGFibGUgZXZlbnRzLlxuICogICBkZWZhdWx0QmVoYXZpb3I6IHtCb29sZWFufSBMb2FkIGRlZmF1bHQtYmVoYXZpb3IuanMuXG4gKiAgIG1vdXNlTW92ZVNlbGVjdGlvbkNoYW5nZXM6IHtCb29sZWFufSBXaGV0aGVyIHRvIGdldCBjdXJzb3IgYW5kIHNlbGVjdGlvbiBldmVudHMgb24gbW91c2Vtb3ZlLlxuICogICBicm93c2VyU3BlbGxjaGVjazoge0Jvb2xlYW59IFNldCB0aGUgc3BlbGxjaGVjayBhdHRyaWJ1dGUgb24gZWRpdGFibGUgZWxlbWVudHNcbiAqXG4gKiBAY2xhc3MgRWRpdGFibGVcbiAqL1xudmFyIEVkaXRhYmxlID0gZnVuY3Rpb24oaW5zdGFuY2VDb25maWcpIHtcbiAgdmFyIGRlZmF1bHRJbnN0YW5jZUNvbmZpZyA9IHtcbiAgICB3aW5kb3c6IHdpbmRvdyxcbiAgICBkZWZhdWx0QmVoYXZpb3I6IHRydWUsXG4gICAgbW91c2VNb3ZlU2VsZWN0aW9uQ2hhbmdlczogZmFsc2UsXG4gICAgYnJvd3NlclNwZWxsY2hlY2s6IHRydWVcbiAgfTtcblxuICB0aGlzLmNvbmZpZyA9ICQuZXh0ZW5kKGRlZmF1bHRJbnN0YW5jZUNvbmZpZywgaW5zdGFuY2VDb25maWcpO1xuICB0aGlzLndpbiA9IHRoaXMuY29uZmlnLndpbmRvdztcbiAgdGhpcy5lZGl0YWJsZVNlbGVjdG9yID0gJy4nICsgY29uZmlnLmVkaXRhYmxlQ2xhc3M7XG5cbiAgaWYgKCFyYW5neS5pbml0aWFsaXplZCkge1xuICAgIHJhbmd5LmluaXQoKTtcbiAgfVxuXG4gIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKHRoaXMpO1xuICBpZiAodGhpcy5jb25maWcuZGVmYXVsdEJlaGF2aW9yID09PSB0cnVlKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKGNyZWF0ZURlZmF1bHRFdmVudHModGhpcykpO1xuICB9XG59O1xuXG4vLyBFeHBvc2UgbW9kdWxlcyBhbmQgZWRpdGFibGVcbkVkaXRhYmxlLnBhcnNlciA9IHBhcnNlcjtcbkVkaXRhYmxlLmNvbnRlbnQgPSBjb250ZW50O1xuRWRpdGFibGUuYnJvd3NlciA9IGJyb3dzZXI7XG53aW5kb3cuRWRpdGFibGUgPSBFZGl0YWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0YWJsZTtcblxuLyoqXG4gKiBTZXQgY29uZmlndXJhdGlvbiBvcHRpb25zIHRoYXQgYWZmZWN0IGFsbCBlZGl0YWJsZVxuICogaW5zdGFuY2VzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWwgY29uZmlndXJhdGlvbiBvcHRpb25zIChkZWZhdWx0cyBhcmUgZGVmaW5lZCBpbiBjb25maWcuanMpXG4gKiAgIGxvZzoge0Jvb2xlYW59XG4gKiAgIGxvZ0Vycm9yczoge0Jvb2xlYW59XG4gKiAgIGVkaXRhYmxlQ2xhc3M6IHtTdHJpbmd9IGUuZy4gJ2pzLWVkaXRhYmxlJ1xuICogICBlZGl0YWJsZURpc2FibGVkQ2xhc3M6IHtTdHJpbmd9IGUuZy4gJ2pzLWVkaXRhYmxlLWRpc2FibGVkJ1xuICogICBwYXN0aW5nQXR0cmlidXRlOiB7U3RyaW5nfSBkZWZhdWx0OiBlLmcuICdkYXRhLWVkaXRhYmxlLWlzLXBhc3RpbmcnXG4gKiAgIGJvbGRUYWc6IGUuZy4gJzxzdHJvbmc+J1xuICogICBpdGFsaWNUYWc6IGUuZy4gJzxlbT4nXG4gKi9cbkVkaXRhYmxlLmdsb2JhbENvbmZpZyA9IGZ1bmN0aW9uKGdsb2JhbENvbmZpZykge1xuICAkLmV4dGVuZChjb25maWcsIGdsb2JhbENvbmZpZyk7XG4gIGNsaXBib2FyZC51cGRhdGVDb25maWcoY29uZmlnKTtcbn07XG5cblxuLyoqXG4gKiBBZGRzIHRoZSBFZGl0YWJsZS5KUyBBUEkgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50cy5cbiAqIE9wcG9zaXRlIG9mIHt7I2Nyb3NzTGluayBcIkVkaXRhYmxlL3JlbW92ZVwifX17ey9jcm9zc0xpbmt9fS5cbiAqIENhbGxzIGRpc3BhdGNoZXIuc2V0dXAgdG8gc2V0dXAgYWxsIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAbWV0aG9kIGFkZFxuICogQHBhcmFtIHtIVE1MRWxlbWVudHxBcnJheShIVE1MRWxlbWVudCl8U3RyaW5nfSB0YXJnZXQgQSBIVE1MRWxlbWVudCwgYW5cbiAqICAgIGFycmF5IG9mIEhUTUxFbGVtZW50IG9yIGEgcXVlcnkgc2VsZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgd2hlcmVcbiAqICAgIHRoZSBBUEkgc2hvdWxkIGJlIGFkZGVkIG9uLlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHRoaXMuZW5hYmxlKCQodGFyZ2V0KSk7XG4gIC8vIHRvZG86IGNoZWNrIGNzcyB3aGl0ZXNwYWNlIHNldHRpbmdzXG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIEVkaXRhYmxlLkpTIEFQSSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudHMuXG4gKiBPcHBvc2l0ZSBvZiB7eyNjcm9zc0xpbmsgXCJFZGl0YWJsZS9hZGRcIn19e3svY3Jvc3NMaW5rfX0uXG4gKlxuICogQG1ldGhvZCByZW1vdmVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8QXJyYXkoSFRNTEVsZW1lbnQpfFN0cmluZ30gdGFyZ2V0IEEgSFRNTEVsZW1lbnQsIGFuXG4gKiAgICBhcnJheSBvZiBIVE1MRWxlbWVudCBvciBhIHF1ZXJ5IHNlbGVjdG9yIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHdoZXJlXG4gKiAgICB0aGUgQVBJIHNob3VsZCBiZSByZW1vdmVkIGZyb20uXG4gKiBAY2hhaW5hYmxlXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgdmFyICR0YXJnZXQgPSAkKHRhcmdldCk7XG4gIHRoaXMuZGlzYWJsZSgkdGFyZ2V0KTtcbiAgJHRhcmdldC5yZW1vdmVDbGFzcyhjb25maWcuZWRpdGFibGVEaXNhYmxlZENsYXNzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgRWRpdGFibGUuSlMgQVBJIGZyb20gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50cy5cbiAqIFRoZSB0YXJnZXQgZWxlbWVudHMgYXJlIG1hcmtlZCBhcyBkaXNhYmxlZC5cbiAqXG4gKiBAbWV0aG9kIGRpc2FibGVcbiAqIEBwYXJhbSB7IGpRdWVyeSBlbGVtZW50IHwgdW5kZWZpbmVkICB9IHRhcmdldCBlZGl0YWJsZSByb290IGVsZW1lbnQocylcbiAqICAgIElmIG5vIHBhcmFtIGlzIHNwZWNpZmllZCBhbGwgZWRpdGFibGVzIGFyZSBkaXNhYmxlZC5cbiAqIEBjaGFpbmFibGVcbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigkZWxlbSkge1xuICB2YXIgYm9keSA9IHRoaXMud2luLmRvY3VtZW50LmJvZHk7XG4gICRlbGVtID0gJGVsZW0gfHwgJCgnLicgKyBjb25maWcuZWRpdGFibGVDbGFzcywgYm9keSk7XG4gICRlbGVtXG4gICAgLnJlbW92ZUF0dHIoJ2NvbnRlbnRlZGl0YWJsZScpXG4gICAgLnJlbW92ZUF0dHIoJ3NwZWxsY2hlY2snKVxuICAgIC5yZW1vdmVDbGFzcyhjb25maWcuZWRpdGFibGVDbGFzcylcbiAgICAuYWRkQ2xhc3MoY29uZmlnLmVkaXRhYmxlRGlzYWJsZWRDbGFzcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblxuLyoqXG4gKiBBZGRzIHRoZSBFZGl0YWJsZS5KUyBBUEkgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50cy5cbiAqXG4gKiBAbWV0aG9kIGVuYWJsZVxuICogQHBhcmFtIHsgalF1ZXJ5IGVsZW1lbnQgfCB1bmRlZmluZWQgfSB0YXJnZXQgZWRpdGFibGUgcm9vdCBlbGVtZW50KHMpXG4gKiAgICBJZiBubyBwYXJhbSBpcyBzcGVjaWZpZWQgYWxsIGVkaXRhYmxlcyBtYXJrZWQgYXMgZGlzYWJsZWQgYXJlIGVuYWJsZWQuXG4gKiBAY2hhaW5hYmxlXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigkZWxlbSwgbm9ybWFsaXplKSB7XG4gIHZhciBib2R5ID0gdGhpcy53aW4uZG9jdW1lbnQuYm9keTtcbiAgJGVsZW0gPSAkZWxlbSB8fCAkKCcuJyArIGNvbmZpZy5lZGl0YWJsZURpc2FibGVkQ2xhc3MsIGJvZHkpO1xuICAkZWxlbVxuICAgIC5hdHRyKCdjb250ZW50ZWRpdGFibGUnLCB0cnVlKVxuICAgIC5hdHRyKCdzcGVsbGNoZWNrJywgdGhpcy5jb25maWcuYnJvd3NlclNwZWxsY2hlY2spXG4gICAgLnJlbW92ZUNsYXNzKGNvbmZpZy5lZGl0YWJsZURpc2FibGVkQ2xhc3MpXG4gICAgLmFkZENsYXNzKGNvbmZpZy5lZGl0YWJsZUNsYXNzKTtcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgJGVsZW0uZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgIGNvbnRlbnQudGlkeUh0bWwoZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRlbXBvcmFyaWx5IGRpc2FibGUgYW4gZWRpdGFibGUuXG4gKiBDYW4gYmUgdXNlZCB0byBwcmV2ZW50IHRleHQgc2VsY3Rpb24gd2hpbGUgZHJhZ2dpbmcgYW4gZWxlbWVudFxuICogZm9yIGV4YW1wbGUuXG4gKlxuICogQG1ldGhvZCBzdXNwZW5kXG4gKiBAcGFyYW0galF1ZXJ5IG9iamVjdFxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuc3VzcGVuZCA9IGZ1bmN0aW9uKCRlbGVtKSB7XG4gIHZhciBib2R5ID0gdGhpcy53aW4uZG9jdW1lbnQuYm9keTtcbiAgJGVsZW0gPSAkZWxlbSB8fCAkKCcuJyArIGNvbmZpZy5lZGl0YWJsZUNsYXNzLCBib2R5KTtcbiAgJGVsZW0ucmVtb3ZlQXR0cignY29udGVudGVkaXRhYmxlJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXZlcnNlIHRoZSBlZmZlY3RzIG9mIHN1c3BlbmQoKVxuICpcbiAqIEBtZXRob2QgY29udGludWVcbiAqIEBwYXJhbSBqUXVlcnkgb2JqZWN0XG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5jb250aW51ZSA9IGZ1bmN0aW9uKCRlbGVtKSB7XG4gIHZhciBib2R5ID0gdGhpcy53aW4uZG9jdW1lbnQuYm9keTtcbiAgJGVsZW0gPSAkZWxlbSB8fCAkKCcuJyArIGNvbmZpZy5lZGl0YWJsZUNsYXNzLCBib2R5KTtcbiAgJGVsZW0uYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGN1cnNvciBpbnNpZGUgb2YgYW4gZWRpdGFibGUgYmxvY2suXG4gKlxuICogQG1ldGhvZCBjcmVhdGVDdXJzb3JcbiAqIEBwYXJhbSBwb3NpdGlvbiAnYmVnaW5uaW5nJywgJ2VuZCcsICdiZWZvcmUnLCAnYWZ0ZXInXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5jcmVhdGVDdXJzb3IgPSBmdW5jdGlvbihlbGVtZW50LCBwb3NpdGlvbikge1xuICB2YXIgY3Vyc29yO1xuICB2YXIgJGhvc3QgPSAkKGVsZW1lbnQpLmNsb3Nlc3QodGhpcy5lZGl0YWJsZVNlbGVjdG9yKTtcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiB8fCAnYmVnaW5uaW5nJztcblxuICBpZiAoJGhvc3QubGVuZ3RoKSB7XG4gICAgdmFyIHJhbmdlID0gcmFuZ3kuY3JlYXRlUmFuZ2UoKTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JlZ2lubmluZycgfHwgcG9zaXRpb24gPT09ICdlbmQnKSB7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICByYW5nZS5jb2xsYXBzZShwb3NpdGlvbiA9PT0gJ2JlZ2lubmluZycgPyB0cnVlIDogZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudCAhPT0gJGhvc3RbMF0pIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JlZm9yZScpIHtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRCZWZvcmUoZWxlbWVudCk7XG4gICAgICAgIHJhbmdlLnNldEVuZEJlZm9yZShlbGVtZW50KTtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdhZnRlcicpIHtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihlbGVtZW50KTtcbiAgICAgICAgcmFuZ2Uuc2V0RW5kQWZ0ZXIoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yKCdFZGl0YWJsZUpTOiBjYW5ub3QgY3JlYXRlIGN1cnNvciBvdXRzaWRlIG9mIGFuIGVkaXRhYmxlIGJsb2NrLicpO1xuICAgIH1cblxuICAgIGN1cnNvciA9IG5ldyBDdXJzb3IoJGhvc3RbMF0sIHJhbmdlKTtcbiAgfVxuXG4gIHJldHVybiBjdXJzb3I7XG59O1xuXG5FZGl0YWJsZS5wcm90b3R5cGUuY3JlYXRlQ3Vyc29yQXRCZWdpbm5pbmcgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHJldHVybiB0aGlzLmNyZWF0ZUN1cnNvcihlbGVtZW50LCAnYmVnaW5uaW5nJyk7XG59O1xuXG5FZGl0YWJsZS5wcm90b3R5cGUuY3JlYXRlQ3Vyc29yQXRFbmQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHJldHVybiB0aGlzLmNyZWF0ZUN1cnNvcihlbGVtZW50LCAnZW5kJyk7XG59O1xuXG5FZGl0YWJsZS5wcm90b3R5cGUuY3JlYXRlQ3Vyc29yQmVmb3JlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2JlZm9yZScpO1xufTtcblxuRWRpdGFibGUucHJvdG90eXBlLmNyZWF0ZUN1cnNvckFmdGVyID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gdGhpcy5jcmVhdGVDdXJzb3IoZWxlbWVudCwgJ2FmdGVyJyk7XG59O1xuXG4vKipcbiAqIEV4dHJhY3QgdGhlIGNvbnRlbnQgZnJvbSBhbiBlZGl0YWJsZSBob3N0IG9yIGRvY3VtZW50IGZyYWdtZW50LlxuICogVGhpcyBtZXRob2Qgd2lsbCByZW1vdmUgYWxsIGludGVybmFsIGVsZW1lbnRzIGFuZCB1aS1lbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge0RPTSBub2RlIG9yIERvY3VtZW50IEZyYWdtZW50fSBUaGUgaW5uZXJIVE1MIG9mIHRoaXMgZWxlbWVudCBvciBmcmFnbWVudCB3aWxsIGJlIGV4dHJhY3RlZC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBjbGVhbmVkIGlubmVySFRNTC5cbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHJldHVybiBjb250ZW50LmV4dHJhY3RDb250ZW50KGVsZW1lbnQpO1xufTtcblxuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nIHwgRG9jdW1lbnRGcmFnbWVudH0gY29udGVudCB0byBhcHBlbmQuXG4gKiBAcmV0dXJucyB7Q3Vyc29yfSBBIG5ldyBDdXJzb3Igb2JqZWN0IGp1c3QgYmVmb3JlIHRoZSBpbnNlcnRlZCBjb250ZW50LlxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihlbGVtZW50LCBjb250ZW50VG9BcHBlbmQpIHtcbiAgZWxlbWVudCA9IGNvbnRlbnQuYWRvcHRFbGVtZW50KGVsZW1lbnQsIHRoaXMud2luLmRvY3VtZW50KTtcblxuICBpZiAodHlwZW9mIGNvbnRlbnRUb0FwcGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyB0b2RvOiBjcmVhdGUgY29udGVudCBpbiB0aGUgcmlnaHQgd2luZG93XG4gICAgY29udGVudFRvQXBwZW5kID0gY29udGVudC5jcmVhdGVGcmFnbWVudEZyb21TdHJpbmcoY29udGVudFRvQXBwZW5kKTtcbiAgfVxuXG4gIHZhciBjdXJzb3IgPSB0aGlzLmNyZWF0ZUN1cnNvcihlbGVtZW50LCAnZW5kJyk7XG4gIGN1cnNvci5pbnNlcnRBZnRlcihjb250ZW50VG9BcHBlbmQpO1xuICByZXR1cm4gY3Vyc29yO1xufTtcblxuXG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmcgfCBEb2N1bWVudEZyYWdtZW50fSBjb250ZW50IHRvIHByZXBlbmRcbiAqIEByZXR1cm5zIHtDdXJzb3J9IEEgbmV3IEN1cnNvciBvYmplY3QganVzdCBhZnRlciB0aGUgaW5zZXJ0ZWQgY29udGVudC5cbiAqL1xuRWRpdGFibGUucHJvdG90eXBlLnByZXBlbmRUbyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNvbnRlbnRUb1ByZXBlbmQpIHtcbiAgZWxlbWVudCA9IGNvbnRlbnQuYWRvcHRFbGVtZW50KGVsZW1lbnQsIHRoaXMud2luLmRvY3VtZW50KTtcblxuICBpZiAodHlwZW9mIGNvbnRlbnRUb1ByZXBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gdG9kbzogY3JlYXRlIGNvbnRlbnQgaW4gdGhlIHJpZ2h0IHdpbmRvd1xuICAgIGNvbnRlbnRUb1ByZXBlbmQgPSBjb250ZW50LmNyZWF0ZUZyYWdtZW50RnJvbVN0cmluZyhjb250ZW50VG9QcmVwZW5kKTtcbiAgfVxuXG4gIHZhciBjdXJzb3IgPSB0aGlzLmNyZWF0ZUN1cnNvcihlbGVtZW50LCAnYmVnaW5uaW5nJyk7XG4gIGN1cnNvci5pbnNlcnRCZWZvcmUoY29udGVudFRvUHJlcGVuZCk7XG4gIHJldHVybiBjdXJzb3I7XG59O1xuXG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAqIE9ubHkgcmV0dXJucyBzb21ldGhpbmcgaWYgdGhlIHNlbGVjdGlvbiBpcyB3aXRoaW4gYW4gZWRpdGFibGUgZWxlbWVudC5cbiAqIElmIHlvdSBwYXNzIGFuIGVkaXRhYmxlIGhvc3QgYXMgcGFyYW0gaXQgb25seSByZXR1cm5zIHNvbWV0aGluZyBpZiB0aGUgc2VsZWN0aW9uIGlzIGluc2lkZSB0aGlzXG4gKiB2ZXJ5IGVkaXRhYmxlIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtET01Ob2RlfSBPcHRpb25hbC4gQW4gZWRpdGFibGUgaG9zdCB3aGVyZSB0aGUgc2VsZWN0aW9uIG5lZWRzIHRvIGJlIGNvbnRhaW5lZC5cbiAqIEByZXR1cm5zIEEgQ3Vyc29yIG9yIFNlbGVjdGlvbiBvYmplY3Qgb3IgdW5kZWZpbmVkLlxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUuZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gIHZhciBzZWxlY3Rpb24gPSB0aGlzLmRpc3BhdGNoZXIuc2VsZWN0aW9uV2F0Y2hlci5nZXRGcmVzaFNlbGVjdGlvbigpO1xuICBpZiAoZWRpdGFibGVIb3N0ICYmIHNlbGVjdGlvbikge1xuICAgIHZhciByYW5nZSA9IHNlbGVjdGlvbi5yYW5nZTtcbiAgICAvLyBDaGVjayBpZiB0aGUgc2VsZWN0aW9uIGlzIGluc2lkZSB0aGUgZWRpdGFibGVIb3N0XG4gICAgLy8gVGhlIHRyeS4uLmNhdGNoIGlzIHJlcXVpcmVkIGlmIHRoZSBlZGl0YWJsZUhvc3Qgd2FzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgIHRyeSB7XG4gICAgICBpZiAocmFuZ2UuY29tcGFyZU5vZGUoZWRpdGFibGVIb3N0KSAhPT0gcmFuZ2UuTk9ERV9CRUZPUkVfQU5EX0FGVEVSKSB7XG4gICAgICAgIHNlbGVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZWxlY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZWxlY3Rpb247XG59O1xuXG5cbi8qKlxuICogRW5hYmxlIHNwZWxsY2hlY2tpbmdcbiAqXG4gKiBAY2hhaW5hYmxlXG4gKi9cbkVkaXRhYmxlLnByb3RvdHlwZS5zZXR1cFNwZWxsY2hlY2sgPSBmdW5jdGlvbihzcGVsbGNoZWNrQ29uZmlnKSB7XG4gIHRoaXMuc3BlbGxjaGVjayA9IG5ldyBTcGVsbGNoZWNrKHRoaXMsIHNwZWxsY2hlY2tDb25maWcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIFN1YnNjcmliZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgY3VzdG9tIGV2ZW50IGZpcmVkIGJ5IHRoZSBBUEkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgaW4gcmVzcG9uc2UgdG8gdGhlXG4gKiAgICAgZXZlbnQuXG4gKlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICAvLyBUT0RPIHRocm93IGVycm9yIGlmIGV2ZW50IGlzIG5vdCBvbmUgb2YgRVZFTlRTXG4gIC8vIFRPRE8gdGhyb3cgZXJyb3IgaWYgaGFuZGxlciBpcyBub3QgYSBmdW5jdGlvblxuICB0aGlzLmRpc3BhdGNoZXIub24oZXZlbnQsIGhhbmRsZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgYSBjYWxsYmFjayBmdW5jdGlvbiBmcm9tIGEgY3VzdG9tIGV2ZW50IGZpcmVkIGJ5IHRoZSBBUEkuXG4gKiBPcHBvc2l0ZSBvZiB7eyNjcm9zc0xpbmsgXCJFZGl0YWJsZS9vblwifX17ey9jcm9zc0xpbmt9fS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBUaGUgY2FsbGJhY2sgdG8gcmVtb3ZlIGZyb20gdGhlXG4gKiAgICAgZXZlbnQgb3IgdGhlIHNwZWNpYWwgdmFsdWUgZmFsc2UgdG8gcmVtb3ZlIGFsbCBjYWxsYmFja3MuXG4gKlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICB0aGlzLmRpc3BhdGNoZXIub2ZmLmFwcGx5KHRoaXMuZGlzcGF0Y2hlciwgYXJncyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBhbGwgY2FsbGJhY2tzIGFuZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQGNoYWluYWJsZVxuICovXG5FZGl0YWJsZS5wcm90b3R5cGUudW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzcGF0Y2hlci51bmxvYWQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gc3Vic2NyaWJlIHRvIGFuIGV2ZW50LlxuICpcbiAqIEBtZXRob2QgY3JlYXRlRXZlbnRTdWJzY3JpYmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gRXZlbnQgbmFtZVxuICovXG52YXIgY3JlYXRlRXZlbnRTdWJzY3JpYmVyID0gZnVuY3Rpb24obmFtZSkge1xuICBFZGl0YWJsZS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMub24obmFtZSwgaGFuZGxlcik7XG4gIH07XG59O1xuXG4vKipcbiAqIFNldCB1cCBjYWxsYmFjayBmdW5jdGlvbnMgZm9yIHNldmVyYWwgZXZlbnRzLlxuICovXG52YXIgZXZlbnRzID0gWydmb2N1cycsICdibHVyJywgJ2Zsb3cnLCAnc2VsZWN0aW9uJywgJ2N1cnNvcicsICduZXdsaW5lJyxcbiAgICAgICAgICAgICAgJ2luc2VydCcsICdzcGxpdCcsICdtZXJnZScsICdlbXB0eScsICdjaGFuZ2UnLCAnc3dpdGNoJywgJ21vdmUnLFxuICAgICAgICAgICAgICAnY2xpcGJvYXJkJywgJ3Bhc3RlJ107XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgKytpKSB7XG4gIHZhciBldmVudE5hbWUgPSBldmVudHNbaV07XG4gIGNyZWF0ZUV2ZW50U3Vic2NyaWJlcihldmVudE5hbWUpO1xufVxuIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcicpO1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL3V0aWwvbG9nJyk7XG52YXIgYmxvY2sgPSByZXF1aXJlKCcuL2Jsb2NrJyk7XG5cbi8qKlxuICogVGhlIEJlaGF2aW9yIG1vZHVsZSBkZWZpbmVzIHRoZSBiZWhhdmlvciB0cmlnZ2VyZWQgaW4gcmVzcG9uc2UgdG8gdGhlIEVkaXRhYmxlLkpTXG4gKiBldmVudHMgKHNlZSB7eyNjcm9zc0xpbmsgXCJFZGl0YWJsZVwifX17ey9jcm9zc0xpbmt9fSkuXG4gKiBUaGUgYmVoYXZpb3IgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IGEgdXNlciB3aXRoIEVkaXRhYmxlLmluaXQoKSBvciBvblxuICogRWRpdGFibGUuYWRkKCkgcGVyIGVsZW1lbnQuXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKiBAc3VibW9kdWxlIGJlaGF2aW9yXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVkaXRhYmxlKSB7XG4gIHZhciBkb2N1bWVudCA9IGVkaXRhYmxlLndpbi5kb2N1bWVudDtcbiAgdmFyIHNlbGVjdGlvbldhdGNoZXIgPSBlZGl0YWJsZS5kaXNwYXRjaGVyLnNlbGVjdGlvbldhdGNoZXI7XG5cbiAgLyoqXG4gICAgKiBGYWN0b3J5IGZvciB0aGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgICAqIFByb3ZpZGVzIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhlIEVkaXRhYmxlLkpTIEFQSS5cbiAgICAqXG4gICAgKiBAc3RhdGljXG4gICAgKi9cbiAgcmV0dXJuIHtcbiAgICBmb2N1czogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgLy8gQWRkIGEgPGJyPiBlbGVtZW50IGlmIHRoZSBlZGl0YWJsZSBpcyBlbXB0eSB0byBmb3JjZSBpdCB0byBoYXZlIGhlaWdodFxuICAgICAgLy8gRS5nLiBGaXJlZm94IGRvZXMgbm90IHJlbmRlciBlbXB0eSBibG9jayBlbGVtZW50cyBhbmQgbW9zdCBicm93c2VycyBkb1xuICAgICAgLy8gbm90IHJlbmRlciAgZW1wdHkgaW5saW5lIGVsZW1lbnRzLlxuICAgICAgaWYgKHBhcnNlci5pc1ZvaWQoZWxlbWVudCkpIHtcbiAgICAgICAgdmFyIGJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKTtcbiAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdkYXRhLWVkaXRhYmxlJywgJ3JlbW92ZScpO1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGJyKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYmx1cjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgY29udGVudC5jbGVhbkludGVybmFscyhlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgc2VsZWN0aW9uOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgbG9nKCdEZWZhdWx0IHNlbGVjdGlvbiBiZWhhdmlvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdEZWZhdWx0IHNlbGVjdGlvbiBlbXB0eSBiZWhhdmlvcicpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjdXJzb3I6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgaWYgKGN1cnNvcikge1xuICAgICAgICBsb2coJ0RlZmF1bHQgY3Vyc29yIGJlaGF2aW9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2coJ0RlZmF1bHQgY3Vyc29yIGVtcHR5IGJlaGF2aW9yJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5ld2xpbmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgdmFyIGF0RW5kID0gY3Vyc29yLmlzQXRFbmQoKTtcbiAgICAgIHZhciBiciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG4gICAgICBjdXJzb3IuaW5zZXJ0QmVmb3JlKGJyKTtcblxuICAgICAgaWYgKGF0RW5kKSB7XG4gICAgICAgIGxvZygnYXQgdGhlIGVuZCcpO1xuXG4gICAgICAgIHZhciBub1dpZHRoU3BhY2UgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnXFx1MjAwQicpO1xuICAgICAgICBjdXJzb3IuaW5zZXJ0QWZ0ZXIobm9XaWR0aFNwYWNlKTtcblxuICAgICAgICAvLyB2YXIgdHJhaWxpbmdCciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG4gICAgICAgIC8vIHRyYWlsaW5nQnIuc2V0QXR0cmlidXRlKCd0eXBlJywgJy1lZGl0YWJsZWpzJyk7XG4gICAgICAgIC8vIGN1cnNvci5pbnNlcnRBZnRlcih0cmFpbGluZ0JyKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdub3QgYXQgdGhlIGVuZCcpO1xuICAgICAgfVxuXG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICBpbnNlcnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgdmFyIG5ld0VsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZShmYWxzZSk7XG4gICAgICBpZiAobmV3RWxlbWVudC5pZCkgbmV3RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2lkJyk7XG5cbiAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWZ0ZXInOlxuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIGVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICBuZXdFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzcGxpdDogZnVuY3Rpb24oZWxlbWVudCwgYmVmb3JlLCBhZnRlciwgY3Vyc29yKSB7XG4gICAgICB2YXIgbmV3Tm9kZSA9IGVsZW1lbnQuY2xvbmVOb2RlKCk7XG4gICAgICBuZXdOb2RlLmFwcGVuZENoaWxkKGJlZm9yZSk7XG5cbiAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIGVsZW1lbnQpO1xuXG4gICAgICB3aGlsZSAoZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoYWZ0ZXIpO1xuXG4gICAgICBjb250ZW50LnRpZHlIdG1sKG5ld05vZGUpO1xuICAgICAgY29udGVudC50aWR5SHRtbChlbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBtZXJnZXIsIGZyYWdtZW50LCBjaHVua3MsIGksIG5ld0NoaWxkLCByYW5nZTtcblxuICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2JlZm9yZSc6XG4gICAgICAgIGNvbnRhaW5lciA9IGJsb2NrLnByZXZpb3VzKGVsZW1lbnQpO1xuICAgICAgICBtZXJnZXIgPSBlbGVtZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FmdGVyJzpcbiAgICAgICAgY29udGFpbmVyID0gZWxlbWVudDtcbiAgICAgICAgbWVyZ2VyID0gYmxvY2submV4dChlbGVtZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghKGNvbnRhaW5lciAmJiBtZXJnZXIpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGlmIChjb250YWluZXIuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnNvciA9IGVkaXRhYmxlLmFwcGVuZFRvKGNvbnRhaW5lciwgbWVyZ2VyLmlubmVySFRNTCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJzb3IgPSBlZGl0YWJsZS5wcmVwZW5kVG8oY29udGFpbmVyLCBtZXJnZXIuaW5uZXJIVE1MKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIG1lcmdlZCBub2RlXG4gICAgICBtZXJnZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZXJnZXIpO1xuXG4gICAgICBjdXJzb3Iuc2F2ZSgpO1xuICAgICAgY29udGVudC50aWR5SHRtbChjb250YWluZXIpO1xuICAgICAgY3Vyc29yLnJlc3RvcmUoKTtcbiAgICAgIGN1cnNvci5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIGVtcHR5OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBsb2coJ0RlZmF1bHQgZW1wdHkgYmVoYXZpb3InKTtcbiAgICB9LFxuXG4gICAgJ3N3aXRjaCc6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICB2YXIgbmV4dCwgcHJldmlvdXM7XG5cbiAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgICBwcmV2aW91cyA9IGJsb2NrLnByZXZpb3VzKGVsZW1lbnQpO1xuICAgICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgICBjdXJzb3IubW92ZUF0VGV4dEVuZChwcmV2aW91cyk7XG4gICAgICAgICAgY3Vyc29yLnNldFZpc2libGVTZWxlY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FmdGVyJzpcbiAgICAgICAgbmV4dCA9IGJsb2NrLm5leHQoZWxlbWVudCk7XG4gICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgY3Vyc29yLm1vdmVBdEJlZ2lubmluZyhuZXh0KTtcbiAgICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbikge1xuICAgICAgbG9nKCdEZWZhdWx0IG1vdmUgYmVoYXZpb3InKTtcbiAgICB9LFxuXG4gICAgcGFzdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGJsb2NrcywgY3Vyc29yKSB7XG4gICAgICB2YXIgZnJhZ21lbnQ7XG5cbiAgICAgIHZhciBmaXJzdEJsb2NrID0gYmxvY2tzWzBdO1xuICAgICAgY3Vyc29yLmluc2VydEJlZm9yZShmaXJzdEJsb2NrKTtcblxuICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPD0gMSkge1xuICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUoZmFsc2UpO1xuICAgICAgICAgIGlmIChuZXdFbGVtZW50LmlkKSBuZXdFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgICBmcmFnbWVudCA9IGNvbnRlbnQuY3JlYXRlRnJhZ21lbnRGcm9tU3RyaW5nKGJsb2Nrc1tpXSk7XG4gICAgICAgICAgJChuZXdFbGVtZW50KS5hcHBlbmQoZnJhZ21lbnQpO1xuICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgY3VycmVudEVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvY3VzIGxhc3QgZWxlbWVudFxuICAgICAgICBjdXJzb3IgPSBlZGl0YWJsZS5jcmVhdGVDdXJzb3JBdEVuZChjdXJyZW50RWxlbWVudCk7XG4gICAgICAgIGN1cnNvci5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNsaXBib2FyZDogZnVuY3Rpb24oZWxlbWVudCwgYWN0aW9uLCBjdXJzb3IpIHtcbiAgICAgIGxvZygnRGVmYXVsdCBjbGlwYm9hcmQgYmVoYXZpb3InKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIGNyZWF0ZURlZmF1bHRCZWhhdmlvciA9IHJlcXVpcmUoJy4vY3JlYXRlLWRlZmF1bHQtYmVoYXZpb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWRpdGFibGUpIHtcbiAgdmFyIGJlaGF2aW9yID0gY3JlYXRlRGVmYXVsdEJlaGF2aW9yKGVkaXRhYmxlKTtcblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBmb2N1cyBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhbiBlbGVtZW50IGdhaW5zIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBmb2N1c1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGJlaGF2aW9yLmZvY3VzKGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmx1ciBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhbiBlbGVtZW50IGxvb3NlcyBmb2N1cy5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgYmx1clxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgYmx1cjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgYmVoYXZpb3IuYmx1cihlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIGZsb3cgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgc3RhcnRzIHR5cGluZyBvciBwYXVzZSB0eXBpbmcuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IGZsb3dcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gVGhlIGZsb3cgYWN0aW9uOiBcInN0YXJ0XCIgb3IgXCJwYXVzZVwiLlxuICAgICAqL1xuICAgIGZsb3c6IGZ1bmN0aW9uKGVsZW1lbnQsIGFjdGlvbikge1xuICAgICAgYmVoYXZpb3IuZmxvdyhlbGVtZW50LCBhY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0aW9uIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgc29tZVxuICAgICAqIGNvbnRlbnQuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IHNlbGVjdGlvblxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTZWxlY3Rpb259IHNlbGVjdGlvbiBUaGUgYWN0dWFsIFNlbGVjdGlvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2VsZWN0aW9uOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgIGJlaGF2aW9yLnNlbGVjdGlvbihlbGVtZW50LCBzZWxlY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3Vyc29yIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciBjdXJzb3IgcG9zaXRpb24gaGFzIGNoYW5nZWQuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IGN1cnNvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtDdXJzb3J9IGN1cnNvciBUaGUgYWN0dWFsIEN1cnNvciBvYmplY3QuXG4gICAgICovXG4gICAgY3Vyc29yOiBmdW5jdGlvbihlbGVtZW50LCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLmN1cnNvcihlbGVtZW50LCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmV3bGluZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiBhIG5ld2xpbmUgc2hvdWxkIGJlIGluc2VydGVkLiBUaGlzXG4gICAgICogaGFwcGVucyB3aGVuIFNISUZUK0VOVEVSIGtleSBpcyBwcmVzc2VkLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIGFkZCBhIDxiciAvPlxuICAgICAqXG4gICAgICogQGV2ZW50IG5ld2xpbmVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7Q3Vyc29yfSBjdXJzb3IgVGhlIGFjdHVhbCBjdXJzb3Igb2JqZWN0LlxuICAgICAqL1xuICAgIG5ld2xpbmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGN1cnNvcikge1xuICAgICAgYmVoYXZpb3IubmV3bGluZShlbGVtZW50LCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3BsaXQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gYSBibG9jayBzaG91bGQgYmUgc3BsaXR0ZWQgaW50byB0d29cbiAgICAgKiBibG9ja3MuIFRoaXMgaGFwcGVucyB3aGVuIEVOVEVSIGlzIHByZXNzZWQgd2l0aGluIGEgbm9uLWVtcHR5IGJsb2NrLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBzcGxpdFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJlZm9yZSBUaGUgSFRNTCBzdHJpbmcgYmVmb3JlIHRoZSBzcGxpdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWZ0ZXIgVGhlIEhUTUwgc3RyaW5nIGFmdGVyIHRoZSBzcGxpdC5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBzcGxpdDogZnVuY3Rpb24oZWxlbWVudCwgYmVmb3JlLCBhZnRlciwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5zcGxpdChlbGVtZW50LCBiZWZvcmUsIGFmdGVyLCBjdXJzb3IpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBpbnNlcnQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gYSBuZXcgYmxvY2sgc2hvdWxkIGJlIGluc2VydGVkLiBUaGlzXG4gICAgICogaGFwcGVucyB3aGVuIEVOVEVSIGtleSBpcyBwcmVzc2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBibG9jayAoc2hvdWxkXG4gICAgICogaW5zZXJ0IGJlZm9yZSkgb3IgYXQgdGhlIGVuZCBvZiBhIGJsb2NrIChzaG91bGQgaW5zZXJ0IGFmdGVyKS5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0cmlnZ2VyaW5nIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIFRoZSBpbnNlcnQgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBpbnNlcnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5pbnNlcnQoZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRoZSBtZXJnZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0d28gbmVlZHMgdG8gYmUgbWVyZ2VkLiBUaGlzIGhhcHBlbnNcbiAgICAgKiB3aGVuIEJBQ0tTUEFDRSBpcyBwcmVzc2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBibG9jayAoc2hvdWxkIG1lcmdlIHdpdGhcbiAgICAgKiB0aGUgcHJlY2VlZGluZyBibG9jaykgb3IgREVMIGlzIHByZXNzZWQgYXQgdGhlIGVuZCBvZiBhIGJsb2NrIChzaG91bGRcbiAgICAgKiBtZXJnZSB3aXRoIHRoZSBmb2xsb3dpbmcgYmxvY2spLlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvLi4uIFRPRE9cbiAgICAgKlxuICAgICAqIEBldmVudCBtZXJnZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdHJpZ2dlcmluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiBUaGUgbWVyZ2UgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBtZXJnZTogZnVuY3Rpb24oZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLm1lcmdlKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIGVtcHR5IGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIGEgYmxvY2sgaXMgZW1wdGllZC5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgZW1wdHlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIGVtcHR5OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBiZWhhdmlvci5lbXB0eShlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIHN3aXRjaCBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBzd2l0Y2hlcyB0byBhbm90aGVyIGJsb2NrLlxuICAgICAqIFRoaXMgaGFwcGVucyB3aGVuIGFuIEFSUk9XIGtleSBpcyBwcmVzc2VkIG5lYXIgdGhlIGJvdW5kYXJpZXMgb2YgYSBibG9jay5cbiAgICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0by4uLiBUT0RPXG4gICAgICpcbiAgICAgKiBAZXZlbnQgc3dpdGNoXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0cmlnZ2VyaW5nIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIFRoZSBzd2l0Y2ggZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKiBAcGFyYW0ge0N1cnNvcn0gY3Vyc29yIFRoZSBhY3R1YWwgY3Vyc29yIG9iamVjdC4qXG4gICAgICovXG4gICAgJ3N3aXRjaCc6IGZ1bmN0aW9uKGVsZW1lbnQsIGRpcmVjdGlvbiwgY3Vyc29yKSB7XG4gICAgICBiZWhhdmlvci5zd2l0Y2goZWxlbWVudCwgZGlyZWN0aW9uLCBjdXJzb3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbW92ZSBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyBhIHNlbGVjdGlvbiBpbiBhIGJsb2NrLlxuICAgICAqIFRoaXMgaGFwcGVucyB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZSAob3IgYWxsKSBjb250ZW50IGluIGEgYmxvY2sgYW5kXG4gICAgICogYW4gQVJST1cga2V5IGlzIHByZXNzZWQgKHVwOiBkcmFnIGJlZm9yZSwgZG93bjogZHJhZyBhZnRlcikuXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8uLi4gVE9ET1xuICAgICAqXG4gICAgICogQGV2ZW50IG1vdmVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U2VsZWN0aW9ufSBzZWxlY3Rpb24gVGhlIGFjdHVhbCBTZWxlY3Rpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb24gVGhlIG1vdmUgZGlyZWN0aW9uOiBcImJlZm9yZVwiIG9yIFwiYWZ0ZXJcIi5cbiAgICAgKi9cbiAgICBtb3ZlOiBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbikge1xuICAgICAgYmVoYXZpb3IubW92ZShlbGVtZW50LCBzZWxlY3Rpb24sIGRpcmVjdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjbGlwYm9hcmQgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgY29waWVzIG9yIGN1dHNcbiAgICAgKiBhIHNlbGVjdGlvbiB3aXRoaW4gYSBibG9jay5cbiAgICAgKlxuICAgICAqIEBldmVudCBjbGlwYm9hcmRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gVGhlIGNsaXBib2FyZCBhY3Rpb246IFwiY29weVwiIG9yIFwiY3V0XCIuXG4gICAgICogQHBhcmFtIHtTZWxlY3Rpb259IHNlbGVjdGlvbiBBIHNlbGVjdGlvbiBvYmplY3QgYXJvdW5kIHRoZSBjb3BpZWQgY29udGVudC5cbiAgICAgKi9cbiAgICBjbGlwYm9hcmQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFjdGlvbiwgc2VsZWN0aW9uKSB7XG4gICAgICBiZWhhdmlvci5jbGlwYm9hcmQoZWxlbWVudCwgYWN0aW9uLCBzZWxlY3Rpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgcGFzdGUgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgcGFzdGVzIHRleHRcbiAgICAgKlxuICAgICAqIEBldmVudCBwYXN0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFRoZSBlbGVtZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7QXJyYXkgb2YgU3RyaW5nfSBUaGUgcGFzdGVkIGJsb2Nrc1xuICAgICAqIEBwYXJhbSB7Q3Vyc29yfSBUaGUgY3Vyc29yIG9iamVjdC5cbiAgICAgKi9cbiAgICBwYXN0ZTogZnVuY3Rpb24oZWxlbWVudCwgYmxvY2tzLCBjdXJzb3IpIHtcbiAgICAgIGJlaGF2aW9yLnBhc3RlKGVsZW1lbnQsIGJsb2NrcywgY3Vyc29yKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIHJhbmd5ID0gcmVxdWlyZSgncmFuZ3knKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgY29udGVudCA9IHJlcXVpcmUoJy4vY29udGVudCcpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi91dGlsL3N0cmluZycpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcbnZhciBlcnJvciA9IHJlcXVpcmUoJy4vdXRpbC9lcnJvcicpO1xudmFyIHJhbmdlU2F2ZVJlc3RvcmUgPSByZXF1aXJlKCcuL3JhbmdlLXNhdmUtcmVzdG9yZScpO1xuXG4vKipcbiAqIFRoZSBDdXJzb3IgbW9kdWxlIHByb3ZpZGVzIGEgY3Jvc3MtYnJvd3NlciBhYnN0cmFjdGlvbiBsYXllciBmb3IgY3Vyc29yLlxuICpcbiAqIEBtb2R1bGUgY29yZVxuICogQHN1Ym1vZHVsZSBjdXJzb3JcbiAqL1xuXG52YXIgQ3Vyc29yO1xubW9kdWxlLmV4cG9ydHMgPSBDdXJzb3IgPSAoZnVuY3Rpb24oKSB7XG5cbiAgLyoqXG4gICAqIENsYXNzIGZvciB0aGUgQ3Vyc29yIG1vZHVsZS5cbiAgICpcbiAgICogQGNsYXNzIEN1cnNvclxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIHZhciBDdXJzb3IgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QsIHJhbmd5UmFuZ2UpIHtcbiAgICB0aGlzLnNldEhvc3QoZWRpdGFibGVIb3N0KTtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ3lSYW5nZTtcbiAgICB0aGlzLmlzQ3Vyc29yID0gdHJ1ZTtcbiAgfTtcblxuICBDdXJzb3IucHJvdG90eXBlID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0F0RW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5pc0VuZE9mSG9zdChcbiAgICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRPZmZzZXQpO1xuICAgICAgfSxcblxuICAgICAgaXNBdFRleHRFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcGFyc2VyLmlzVGV4dEVuZE9mSG9zdChcbiAgICAgICAgICB0aGlzLmhvc3QsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5lbmRPZmZzZXQpO1xuICAgICAgfSxcblxuICAgICAgaXNBdEJlZ2lubmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIuaXNCZWdpbm5pbmdPZkhvc3QoXG4gICAgICAgICAgdGhpcy5ob3N0LFxuICAgICAgICAgIHRoaXMucmFuZ2Uuc3RhcnRDb250YWluZXIsXG4gICAgICAgICAgdGhpcy5yYW5nZS5zdGFydE9mZnNldCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEluc2VydCBjb250ZW50IGJlZm9yZSB0aGUgY3Vyc29yXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmcsIERPTSBub2RlIG9yIGRvY3VtZW50IGZyYWdtZW50fVxuICAgICAgICovXG4gICAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCBzdHJpbmcuaXNTdHJpbmcoZWxlbWVudCkgKSB7XG4gICAgICAgICAgZWxlbWVudCA9IGNvbnRlbnQuY3JlYXRlRnJhZ21lbnRGcm9tU3RyaW5nKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZXIuaXNEb2N1bWVudEZyYWdtZW50V2l0aG91dENoaWxkcmVuKGVsZW1lbnQpKSByZXR1cm47XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLmFkb3B0RWxlbWVudChlbGVtZW50KTtcblxuICAgICAgICB2YXIgcHJlY2VlZGluZ0VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZG9jdW1lbnRGcmFnbWVudE5vZGUpIHtcbiAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgcHJlY2VlZGluZ0VsZW1lbnQgPSBlbGVtZW50LmNoaWxkTm9kZXNbbGFzdEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmFuZ2UuaW5zZXJ0Tm9kZShlbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5zZXRTdGFydEFmdGVyKHByZWNlZWRpbmdFbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5zZXRFbmRBZnRlcihwcmVjZWVkaW5nRWxlbWVudCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEluc2VydCBjb250ZW50IGFmdGVyIHRoZSBjdXJzb3JcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZywgRE9NIG5vZGUgb3IgZG9jdW1lbnQgZnJhZ21lbnR9XG4gICAgICAgKi9cbiAgICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICggc3RyaW5nLmlzU3RyaW5nKGVsZW1lbnQpICkge1xuICAgICAgICAgIGVsZW1lbnQgPSBjb250ZW50LmNyZWF0ZUZyYWdtZW50RnJvbVN0cmluZyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VyLmlzRG9jdW1lbnRGcmFnbWVudFdpdGhvdXRDaGlsZHJlbihlbGVtZW50KSkgcmV0dXJuO1xuICAgICAgICBlbGVtZW50ID0gdGhpcy5hZG9wdEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2UuaW5zZXJ0Tm9kZShlbGVtZW50KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQWxpYXMgZm9yICNzZXRWaXNpYmxlU2VsZWN0aW9uKClcbiAgICAgICAqL1xuICAgICAgc2V0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgICB9LFxuXG4gICAgICBzZXRWaXNpYmxlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gV2l0aG91dCBzZXR0aW5nIGZvY3VzKCkgRmlyZWZveCBpcyBub3QgaGFwcHkgKHNlZW1zIHNldHRpbmcgYSBzZWxlY3Rpb24gaXMgbm90IGVub3VnaC5cbiAgICAgICAgLy8gUHJvYmFibHkgYmVjYXVzZSBGaXJlZm94IGNhbiBoYW5kbGUgbXVsdGlwbGUgc2VsZWN0aW9ucykuXG4gICAgICAgIGlmICh0aGlzLndpbi5kb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLmhvc3QpIHtcbiAgICAgICAgICAkKHRoaXMuaG9zdCkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICByYW5neS5nZXRTZWxlY3Rpb24odGhpcy53aW4pLnNldFNpbmdsZVJhbmdlKHRoaXMucmFuZ2UpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUYWtlIHRoZSBmb2xsb3dpbmcgZXhhbXBsZTpcbiAgICAgICAqIChUaGUgY2hhcmFjdGVyICd8JyByZXByZXNlbnRzIHRoZSBjdXJzb3IgcG9zaXRpb24pXG4gICAgICAgKlxuICAgICAgICogPGRpdiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+Zm98bzwvZGl2PlxuICAgICAgICogYmVmb3JlKCkgd2lsbCByZXR1cm4gYSBkb2N1bWVudCBmcmFtZW50IGNvbnRhaW5pbmcgYSB0ZXh0IG5vZGUgJ2ZvJy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnQgRnJhZ21lbnR9IGNvbnRlbnQgYmVmb3JlIHRoZSBjdXJzb3Igb3Igc2VsZWN0aW9uLlxuICAgICAgICovXG4gICAgICBiZWZvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZnJhZ21lbnQgPSBudWxsO1xuICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRCZWZvcmUodGhpcy5ob3N0KTtcbiAgICAgICAgZnJhZ21lbnQgPSBjb250ZW50LmNsb25lUmFuZ2VDb250ZW50cyhyYW5nZSk7XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU2FtZSBhcyBiZWZvcmUoKSBidXQgcmV0dXJucyBhIHN0cmluZy5cbiAgICAgICAqL1xuICAgICAgYmVmb3JlSHRtbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50LmdldElubmVySHRtbE9mRnJhZ21lbnQodGhpcy5iZWZvcmUoKSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFRha2UgdGhlIGZvbGxvd2luZyBleGFtcGxlOlxuICAgICAgICogKFRoZSBjaGFyYWN0ZXIgJ3wnIHJlcHJlc2VudHMgdGhlIGN1cnNvciBwb3NpdGlvbilcbiAgICAgICAqXG4gICAgICAgKiA8ZGl2IGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj5mb3xvPC9kaXY+XG4gICAgICAgKiBhZnRlcigpIHdpbGwgcmV0dXJuIGEgZG9jdW1lbnQgZnJhbWVudCBjb250YWluaW5nIGEgdGV4dCBub2RlICdvJy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnQgRnJhZ21lbnR9IGNvbnRlbnQgYWZ0ZXIgdGhlIGN1cnNvciBvciBzZWxlY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIGFmdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgdmFyIHJhbmdlID0gdGhpcy5yYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKHRoaXMuaG9zdCk7XG4gICAgICAgIGZyYWdtZW50ID0gY29udGVudC5jbG9uZVJhbmdlQ29udGVudHMocmFuZ2UpO1xuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFNhbWUgYXMgYWZ0ZXIoKSBidXQgcmV0dXJucyBhIHN0cmluZy5cbiAgICAgICAqL1xuICAgICAgYWZ0ZXJIdG1sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQuZ2V0SW5uZXJIdG1sT2ZGcmFnbWVudCh0aGlzLmFmdGVyKCkpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIEJvdW5kaW5nQ2xpZW50UmVjdCBvZiB0aGUgY3Vyc29yLlxuICAgICAgICogVGhlIHJldHVybmVkIHZhbHVlcyBhcmUgdHJhbnNmb3JtZWQgdG8gYmUgYWJzb2x1dGVcbiAgICAgICAjIChyZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQpLlxuICAgICAgICovXG4gICAgICBnZXRDb29yZGluYXRlczogZnVuY3Rpb24ocG9zaXRpb25pbmcpIHtcbiAgICAgICAgcG9zaXRpb25pbmcgPSBwb3NpdGlvbmluZyB8fCAnYWJzb2x1dGUnO1xuXG4gICAgICAgIHZhciBjb29yZHMgPSB0aGlzLnJhbmdlLm5hdGl2ZVJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAocG9zaXRpb25pbmcgPT09ICdmaXhlZCcpIHJldHVybiBjb29yZHM7XG5cbiAgICAgICAgLy8gY29kZSBmcm9tIG1kbjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL3dpbmRvdy5zY3JvbGxYXG4gICAgICAgIHZhciB3aW4gPSB0aGlzLndpbjtcbiAgICAgICAgdmFyIHggPSAod2luLnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWQpID8gd2luLnBhZ2VYT2Zmc2V0IDogKHdpbi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgd2luLmRvY3VtZW50LmJvZHkucGFyZW50Tm9kZSB8fCB3aW4uZG9jdW1lbnQuYm9keSkuc2Nyb2xsTGVmdDtcbiAgICAgICAgdmFyIHkgPSAod2luLnBhZ2VZT2Zmc2V0ICE9PSB1bmRlZmluZWQpID8gd2luLnBhZ2VZT2Zmc2V0IDogKHdpbi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgd2luLmRvY3VtZW50LmJvZHkucGFyZW50Tm9kZSB8fCB3aW4uZG9jdW1lbnQuYm9keSkuc2Nyb2xsVG9wO1xuXG4gICAgICAgIC8vIHRyYW5zbGF0ZSBpbnRvIGFic29sdXRlIHBvc2l0aW9uc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRvcDogY29vcmRzLnRvcCArIHksXG4gICAgICAgICAgYm90dG9tOiBjb29yZHMuYm90dG9tICsgeSxcbiAgICAgICAgICBsZWZ0OiBjb29yZHMubGVmdCArIHgsXG4gICAgICAgICAgcmlnaHQ6IGNvb3Jkcy5yaWdodCArIHgsXG4gICAgICAgICAgaGVpZ2h0OiBjb29yZHMuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBjb29yZHMud2lkdGhcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIG1vdmVCZWZvcmU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldFN0YXJ0QmVmb3JlKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldEVuZEJlZm9yZShlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICBtb3ZlQWZ0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNldFN0YXJ0QWZ0ZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2Uuc2V0RW5kQWZ0ZXIoZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0aW9uKSByZXR1cm4gbmV3IEN1cnNvcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgaG9zdC5cbiAgICAgICAqL1xuICAgICAgbW92ZUF0QmVnaW5uaW5nOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHRoaXMuaG9zdDtcbiAgICAgICAgdGhpcy51cGRhdGVIb3N0KGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgdGhpcy5yYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIE1vdmUgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBob3N0LlxuICAgICAgICovXG4gICAgICBtb3ZlQXRFbmQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFlbGVtZW50KSBlbGVtZW50ID0gdGhpcy5ob3N0O1xuICAgICAgICB0aGlzLnVwZGF0ZUhvc3QoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIE1vdmUgdGhlIGN1cnNvciBhZnRlciB0aGUgbGFzdCB2aXNpYmxlIGNoYXJhY3RlciBvZiB0aGUgaG9zdC5cbiAgICAgICAqL1xuICAgICAgbW92ZUF0VGV4dEVuZDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlQXRFbmQocGFyc2VyLmxhdGVzdENoaWxkKGVsZW1lbnQpKTtcbiAgICAgIH0sXG5cbiAgICAgIHNldEhvc3Q6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuanF1ZXJ5KSBlbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgdGhpcy5ob3N0ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy53aW4gPSAoZWxlbWVudCA9PT0gdW5kZWZpbmVkIHx8IGVsZW1lbnQgPT09IG51bGwpID8gd2luZG93IDogZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlSG9zdDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgaG9zdCA9IHBhcnNlci5nZXRIb3N0KGVsZW1lbnQpO1xuICAgICAgICBpZiAoIWhvc3QpIHtcbiAgICAgICAgICBlcnJvcignQ2FuIG5vdCBzZXQgY3Vyc29yIG91dHNpZGUgb2YgYW4gZWRpdGFibGUgYmxvY2snKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhvc3QoaG9zdCk7XG4gICAgICB9LFxuXG4gICAgICByZXRhaW5WaXNpYmxlU2VsZWN0aW9uOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgdGhpcy5yZXN0b3JlKCk7XG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZVNlbGVjdGlvbigpO1xuICAgICAgfSxcblxuICAgICAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2F2ZWRSYW5nZUluZm8gPSByYW5nZVNhdmVSZXN0b3JlLnNhdmUodGhpcy5yYW5nZSk7XG4gICAgICAgIHRoaXMuc2F2ZWRSYW5nZUluZm8uaG9zdCA9IHRoaXMuaG9zdDtcbiAgICAgIH0sXG5cbiAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zYXZlZFJhbmdlSW5mbykge1xuICAgICAgICAgIHRoaXMuaG9zdCA9IHRoaXMuc2F2ZWRSYW5nZUluZm8uaG9zdDtcbiAgICAgICAgICB0aGlzLnJhbmdlID0gcmFuZ2VTYXZlUmVzdG9yZS5yZXN0b3JlKHRoaXMuaG9zdCwgdGhpcy5zYXZlZFJhbmdlSW5mbyk7XG4gICAgICAgICAgdGhpcy5zYXZlZFJhbmdlSW5mbyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlcnJvcignQ291bGQgbm90IHJlc3RvcmUgc2VsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGVxdWFsczogZnVuY3Rpb24oY3Vyc29yKSB7XG4gICAgICAgIGlmICghY3Vyc29yKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFjdXJzb3IuaG9zdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWN1cnNvci5ob3N0LmlzRXF1YWxOb2RlKHRoaXMuaG9zdCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAoIWN1cnNvci5yYW5nZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWN1cnNvci5yYW5nZS5lcXVhbHModGhpcy5yYW5nZSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IHdpdGggdGhlIGNvcnJlY3Qgb3duZXJXaW5kb3dcbiAgICAgIC8vIChzZWU6IGh0dHA6Ly93d3cudzMub3JnL0RPTS9mYXEuaHRtbCNvd25lcmRvYylcbiAgICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBNYWtlIHN1cmUgYSBub2RlIGhhcyB0aGUgY29ycmVjdCBvd25lcldpbmRvd1xuICAgICAgLy8gKHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0RvY3VtZW50L2ltcG9ydE5vZGUpXG4gICAgICBhZG9wdEVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQuYWRvcHRFbGVtZW50KG5vZGUsIHRoaXMud2luLmRvY3VtZW50KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEN1cnJlbnRseSB3ZSBjYWxsIHRyaWdnZXJDaGFuZ2UgbWFudWFsbHkgYWZ0ZXIgZm9ybWF0IGNoYW5nZXMuXG4gICAgICAvLyBUaGlzIGlzIHRvIHByZXZlbnQgZXhjZXNzaXZlIHRyaWdnZXJpbmcgb2YgdGhlIGNoYW5nZSBldmVudCBkdXJpbmdcbiAgICAgIC8vIG1lcmdlIG9yIHNwbGl0IG9wZXJhdGlvbnMgb3Igb3RoZXIgbWFuaXB1bGF0aW9ucyBieSBzY3JpcHRzLlxuICAgICAgdHJpZ2dlckNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5ob3N0KS50cmlnZ2VyKCdmb3JtYXRFZGl0YWJsZScpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG5cbiAgcmV0dXJuIEN1cnNvcjtcbn0pKCk7XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIGJyb3dzZXJGZWF0dXJlcyA9IHJlcXVpcmUoJy4vZmVhdHVyZS1kZXRlY3Rpb24nKTtcbnZhciBjbGlwYm9hcmQgPSByZXF1aXJlKCcuL2NsaXBib2FyZCcpO1xudmFyIGV2ZW50YWJsZSA9IHJlcXVpcmUoJy4vZXZlbnRhYmxlJyk7XG52YXIgU2VsZWN0aW9uV2F0Y2hlciA9IHJlcXVpcmUoJy4vc2VsZWN0aW9uLXdhdGNoZXInKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIEtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpO1xuXG4vKipcbiAqIFRoZSBEaXNwYXRjaGVyIG1vZHVsZSBpcyByZXNwb25zaWJsZSBmb3IgZGVhbGluZyB3aXRoIGV2ZW50cyBhbmQgdGhlaXIgaGFuZGxlcnMuXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKiBAc3VibW9kdWxlIGRpc3BhdGNoZXJcbiAqL1xuXG52YXIgRGlzcGF0Y2hlciA9IGZ1bmN0aW9uKGVkaXRhYmxlKSB7XG4gIHZhciB3aW4gPSBlZGl0YWJsZS53aW47XG4gIGV2ZW50YWJsZSh0aGlzLCBlZGl0YWJsZSk7XG4gIHRoaXMuc3VwcG9ydHNJbnB1dEV2ZW50ID0gZmFsc2U7XG4gIHRoaXMuJGRvY3VtZW50ID0gJCh3aW4uZG9jdW1lbnQpO1xuICB0aGlzLmNvbmZpZyA9IGVkaXRhYmxlLmNvbmZpZztcbiAgdGhpcy5lZGl0YWJsZSA9IGVkaXRhYmxlO1xuICB0aGlzLmVkaXRhYmxlU2VsZWN0b3IgPSBlZGl0YWJsZS5lZGl0YWJsZVNlbGVjdG9yO1xuICB0aGlzLnNlbGVjdGlvbldhdGNoZXIgPSBuZXcgU2VsZWN0aW9uV2F0Y2hlcih0aGlzLCB3aW4pO1xuICB0aGlzLmtleWJvYXJkID0gbmV3IEtleWJvYXJkKHRoaXMuc2VsZWN0aW9uV2F0Y2hlcik7XG4gIHRoaXMuc2V0dXAoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlzcGF0Y2hlcjtcblxuLy8gVGhpcyB3aWxsIGJlIHNldCB0byB0cnVlIG9uY2Ugd2UgZGV0ZWN0IHRoZSBpbnB1dCBldmVudCBpcyB3b3JraW5nLlxuLy8gSW5wdXQgZXZlbnQgZGVzY3JpcHRpb24gb24gTUROOlxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvUmVmZXJlbmNlL0V2ZW50cy9pbnB1dFxudmFyIGlzSW5wdXRFdmVudFN1cHBvcnRlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFNldHMgdXAgYWxsIGV2ZW50cyB0aGF0IEVkaXRhYmxlLkpTIGlzIGNhdGNoaW5nLlxuICpcbiAqIEBtZXRob2Qgc2V0dXBcbiAqL1xuRGlzcGF0Y2hlci5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgLy8gc2V0dXAgYWxsIGV2ZW50cyBub3RpZmljYXRpb25zXG4gIHRoaXMuc2V0dXBFbGVtZW50RXZlbnRzKCk7XG4gIHRoaXMuc2V0dXBLZXlib2FyZEV2ZW50cygpO1xuXG4gIGlmIChicm93c2VyRmVhdHVyZXMuc2VsZWN0aW9uY2hhbmdlKSB7XG4gICAgdGhpcy5zZXR1cFNlbGVjdGlvbkNoYW5nZUV2ZW50cygpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc2V0dXBTZWxlY3Rpb25DaGFuZ2VGYWxsYmFjaygpO1xuICB9XG59O1xuXG5EaXNwYXRjaGVyLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vZmYoKTtcbiAgdGhpcy4kZG9jdW1lbnQub2ZmKCcuZWRpdGFibGUnKTtcbn07XG5cbi8qKlxuICogU2V0cyB1cCBldmVudHMgdGhhdCBhcmUgdHJpZ2dlcmVkIG9uIG1vZGlmeWluZyBhbiBlbGVtZW50LlxuICpcbiAqIEBtZXRob2Qgc2V0dXBFbGVtZW50RXZlbnRzXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSAkZG9jdW1lbnQ6IFRoZSBkb2N1bWVudCBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm90aWZpZXI6IFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiB0aGUgZXZlbnQgaXMgY2F1Z2h0LlxuICovXG5EaXNwYXRjaGVyLnByb3RvdHlwZS5zZXR1cEVsZW1lbnRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy4kZG9jdW1lbnQub24oJ2ZvY3VzLmVkaXRhYmxlJywgX3RoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoY29uZmlnLnBhc3RpbmdBdHRyaWJ1dGUpKSByZXR1cm47XG4gICAgX3RoaXMubm90aWZ5KCdmb2N1cycsIHRoaXMpO1xuICB9KS5vbignYmx1ci5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGNvbmZpZy5wYXN0aW5nQXR0cmlidXRlKSkgcmV0dXJuO1xuICAgIF90aGlzLm5vdGlmeSgnYmx1cicsIHRoaXMpO1xuICB9KS5vbignY29weS5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hTZWxlY3Rpb24oKTtcbiAgICBpZiAoc2VsZWN0aW9uLmlzU2VsZWN0aW9uKSB7XG4gICAgICBfdGhpcy5ub3RpZnkoJ2NsaXBib2FyZCcsIHRoaXMsICdjb3B5Jywgc2VsZWN0aW9uKTtcbiAgICB9XG4gIH0pLm9uKCdjdXQuZWRpdGFibGUnLCBfdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSBfdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmdldEZyZXNoU2VsZWN0aW9uKCk7XG4gICAgaWYgKHNlbGVjdGlvbi5pc1NlbGVjdGlvbikge1xuICAgICAgX3RoaXMubm90aWZ5KCdjbGlwYm9hcmQnLCB0aGlzLCAnY3V0Jywgc2VsZWN0aW9uKTtcbiAgICAgIF90aGlzLnRyaWdnZXJDaGFuZ2VFdmVudCh0aGlzKTtcbiAgICB9XG4gIH0pLm9uKCdwYXN0ZS5lZGl0YWJsZScsIF90aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciBhZnRlclBhc3RlID0gZnVuY3Rpb24gKGJsb2NrcywgY3Vyc29yKSB7XG4gICAgICBpZiAoYmxvY2tzLmxlbmd0aCkge1xuICAgICAgICBfdGhpcy5ub3RpZnkoJ3Bhc3RlJywgZWxlbWVudCwgYmxvY2tzLCBjdXJzb3IpO1xuXG4gICAgICAgIC8vIFRoZSBpbnB1dCBldmVudCBkb2VzIG5vdCBmaXJlIHdoZW4gd2UgcHJvY2VzcyB0aGUgY29udGVudCBtYW51YWxseVxuICAgICAgICAvLyBhbmQgaW5zZXJ0IGl0IHZpYSBzY3JpcHRcbiAgICAgICAgX3RoaXMubm90aWZ5KCdjaGFuZ2UnLCBlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnNvci5zZXRWaXNpYmxlU2VsZWN0aW9uKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjdXJzb3IgPSBfdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmdldEZyZXNoU2VsZWN0aW9uKCk7XG4gICAgY2xpcGJvYXJkLnBhc3RlKHRoaXMsIGN1cnNvciwgYWZ0ZXJQYXN0ZSk7XG5cblxuICB9KS5vbignaW5wdXQuZWRpdGFibGUnLCBfdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChpc0lucHV0RXZlbnRTdXBwb3J0ZWQpIHtcbiAgICAgIF90aGlzLm5vdGlmeSgnY2hhbmdlJywgdGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE1vc3QgbGlrZWx5IHRoZSBldmVudCB3YXMgYWxyZWFkeSBoYW5kbGVkIG1hbnVhbGx5IGJ5XG4gICAgICAvLyB0cmlnZ2VyQ2hhbmdlRXZlbnQgc28gdGhlIGZpcnN0IHRpbWUgd2UganVzdCBzd2l0Y2ggdGhlXG4gICAgICAvLyBpc0lucHV0RXZlbnRTdXBwb3J0ZWQgZmxhZyB3aXRob3V0IG5vdGlmaXlpbmcgdGhlIGNoYW5nZSBldmVudC5cbiAgICAgIGlzSW5wdXRFdmVudFN1cHBvcnRlZCA9IHRydWU7XG4gICAgfVxuICB9KS5vbignZm9ybWF0RWRpdGFibGUuZWRpdGFibGUnLCBfdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLm5vdGlmeSgnY2hhbmdlJywgdGhpcyk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIGEgY2hhbmdlIGV2ZW50XG4gKlxuICogVGhpcyBzaG91bGQgYmUgZG9uZSBpbiB0aGVzZSBjYXNlczpcbiAqIC0gdHlwaW5nIGEgbGV0dGVyXG4gKiAtIGRlbGV0ZSAoYmFja3NwYWNlIGFuZCBkZWxldGUga2V5cylcbiAqIC0gY3V0XG4gKiAtIHBhc3RlXG4gKiAtIGNvcHkgYW5kIHBhc3RlIChub3QgZWFzaWx5IHBvc3NpYmxlIG1hbnVhbGx5IGFzIGZhciBhcyBJIGtub3cpXG4gKlxuICogUHJlZmVycmFibHkgdGhpcyBpcyBkb25lIHVzaW5nIHRoZSBpbnB1dCBldmVudC4gQnV0IHRoZSBpbnB1dCBldmVudCBpcyBub3RcbiAqIHN1cHBvcnRlZCBvbiBhbGwgYnJvd3NlcnMgZm9yIGNvbnRlbnRlZGl0YWJsZSBlbGVtZW50cy5cbiAqIFRvIG1ha2UgdGhpbmdzIHdvcnNlIGl0IGlzIG5vdCBkZXRlY3RhYmxlIGVpdGhlci4gU28gaW5zdGVhZCBvZiBkZXRlY3RpbmdcbiAqIHdlIHNldCAnaXNJbnB1dEV2ZW50U3VwcG9ydGVkJyB3aGVuIHRoZSBpbnB1dCBldmVudCBmaXJlcyB0aGUgZmlyc3QgdGltZS5cbiAqL1xuRGlzcGF0Y2hlci5wcm90b3R5cGUudHJpZ2dlckNoYW5nZUV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0KXtcbiAgaWYgKGlzSW5wdXRFdmVudFN1cHBvcnRlZCkgcmV0dXJuO1xuICB0aGlzLm5vdGlmeSgnY2hhbmdlJywgdGFyZ2V0KTtcbn07XG5cbkRpc3BhdGNoZXIucHJvdG90eXBlLmRpc3BhdGNoU3dpdGNoRXZlbnQgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgZGlyZWN0aW9uKSB7XG4gIHZhciBjdXJzb3I7XG4gIGlmIChldmVudC5hbHRLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LnNoaWZ0S2V5KVxuICAgIHJldHVybjtcblxuICBjdXJzb3IgPSB0aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0U2VsZWN0aW9uKCk7XG4gIGlmICghY3Vyc29yIHx8IGN1cnNvci5pc1NlbGVjdGlvbikgcmV0dXJuO1xuICAvLyBEZXRlY3QgaWYgdGhlIGJyb3dzZXIgbW92ZWQgdGhlIGN1cnNvciBpbiB0aGUgbmV4dCB0aWNrLlxuICAvLyBJZiB0aGUgY3Vyc29yIHN0YXlzIGF0IGl0cyBwb3NpdGlvbiwgZmlyZSB0aGUgc3dpdGNoIGV2ZW50LlxuICB2YXIgZGlzcGF0Y2hlciA9IHRoaXM7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld0N1cnNvciA9IGRpc3BhdGNoZXIuc2VsZWN0aW9uV2F0Y2hlci5mb3JjZUN1cnNvcigpO1xuICAgIGlmIChuZXdDdXJzb3IuZXF1YWxzKGN1cnNvcikpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGRpc3BhdGNoZXIubm90aWZ5KCdzd2l0Y2gnLCBlbGVtZW50LCBkaXJlY3Rpb24sIG5ld0N1cnNvcik7XG4gICAgfVxuICB9LCAxKTtcbn07XG5cbi8qKlxuICogU2V0cyB1cCBldmVudHMgdGhhdCBhcmUgdHJpZ2dlcmVkIG9uIGtleWJvYXJkIGV2ZW50cy5cbiAqIEtleWJvYXJkIGRlZmluaXRpb25zIGFyZSBpbiB7eyNjcm9zc0xpbmsgXCJLZXlib2FyZFwifX17ey9jcm9zc0xpbmt9fS5cbiAqXG4gKiBAbWV0aG9kIHNldHVwS2V5Ym9hcmRFdmVudHNcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9ICRkb2N1bWVudDogVGhlIGRvY3VtZW50IGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub3RpZmllcjogVGhlIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIHRoZSBldmVudCBpcyBjYXVnaHQuXG4gKi9cbkRpc3BhdGNoZXIucHJvdG90eXBlLnNldHVwS2V5Ym9hcmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLiRkb2N1bWVudC5vbigna2V5ZG93bi5lZGl0YWJsZScsIHRoaXMuZWRpdGFibGVTZWxlY3RvciwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgbm90aWZ5Q2hhcmFjdGVyRXZlbnQgPSAhaXNJbnB1dEV2ZW50U3VwcG9ydGVkO1xuICAgIF90aGlzLmtleWJvYXJkLmRpc3BhdGNoS2V5RXZlbnQoZXZlbnQsIHRoaXMsIG5vdGlmeUNoYXJhY3RlckV2ZW50KTtcbiAgfSk7XG5cbiAgdGhpcy5rZXlib2FyZC5vbignbGVmdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMuZGlzcGF0Y2hTd2l0Y2hFdmVudChldmVudCwgdGhpcywgJ2JlZm9yZScpO1xuICB9KS5vbigndXAnLCBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLmRpc3BhdGNoU3dpdGNoRXZlbnQoZXZlbnQsIHRoaXMsICdiZWZvcmUnKTtcbiAgfSkub24oJ3JpZ2h0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5kaXNwYXRjaFN3aXRjaEV2ZW50KGV2ZW50LCB0aGlzLCAnYWZ0ZXInKTtcbiAgfSkub24oJ2Rvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLmRpc3BhdGNoU3dpdGNoRXZlbnQoZXZlbnQsIHRoaXMsICdhZnRlcicpO1xuICB9KS5vbigndGFiJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgfSkub24oJ3NoaWZ0VGFiJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgfSkub24oJ2VzYycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIH0pLm9uKCdiYWNrc3BhY2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciByYW5nZSA9IF90aGlzLnNlbGVjdGlvbldhdGNoZXIuZ2V0RnJlc2hSYW5nZSgpO1xuICAgIGlmIChyYW5nZS5pc0N1cnNvcikge1xuICAgICAgdmFyIGN1cnNvciA9IHJhbmdlLmdldEN1cnNvcigpO1xuICAgICAgaWYgKCBjdXJzb3IuaXNBdEJlZ2lubmluZygpICkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMubm90aWZ5KCdtZXJnZScsIHRoaXMsICdiZWZvcmUnLCBjdXJzb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMudHJpZ2dlckNoYW5nZUV2ZW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfdGhpcy50cmlnZ2VyQ2hhbmdlRXZlbnQodGhpcyk7XG4gICAgfVxuICB9KS5vbignZGVsZXRlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgcmFuZ2UgPSBfdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmdldEZyZXNoUmFuZ2UoKTtcbiAgICBpZiAocmFuZ2UuaXNDdXJzb3IpIHtcbiAgICAgIHZhciBjdXJzb3IgPSByYW5nZS5nZXRDdXJzb3IoKTtcbiAgICAgIGlmIChjdXJzb3IuaXNBdFRleHRFbmQoKSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMubm90aWZ5KCdtZXJnZScsIHRoaXMsICdhZnRlcicsIGN1cnNvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy50cmlnZ2VyQ2hhbmdlRXZlbnQodGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLnRyaWdnZXJDaGFuZ2VFdmVudCh0aGlzKTtcbiAgICB9XG4gIH0pLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB2YXIgcmFuZ2UgPSBfdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmdldEZyZXNoUmFuZ2UoKTtcbiAgICB2YXIgY3Vyc29yID0gcmFuZ2UuZm9yY2VDdXJzb3IoKTtcblxuICAgIGlmIChjdXJzb3IuaXNBdFRleHRFbmQoKSkge1xuICAgICAgX3RoaXMubm90aWZ5KCdpbnNlcnQnLCB0aGlzLCAnYWZ0ZXInLCBjdXJzb3IpO1xuICAgIH0gZWxzZSBpZiAoY3Vyc29yLmlzQXRCZWdpbm5pbmcoKSkge1xuICAgICAgX3RoaXMubm90aWZ5KCdpbnNlcnQnLCB0aGlzLCAnYmVmb3JlJywgY3Vyc29yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX3RoaXMubm90aWZ5KCdzcGxpdCcsIHRoaXMsIGN1cnNvci5iZWZvcmUoKSwgY3Vyc29yLmFmdGVyKCksIGN1cnNvcik7XG4gICAgfVxuXG4gIH0pLm9uKCdzaGlmdEVudGVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHZhciBjdXJzb3IgPSBfdGhpcy5zZWxlY3Rpb25XYXRjaGVyLmZvcmNlQ3Vyc29yKCk7XG4gICAgX3RoaXMubm90aWZ5KCduZXdsaW5lJywgdGhpcywgY3Vyc29yKTtcbiAgfSkub24oJ2NoYXJhY3RlcicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMubm90aWZ5KCdjaGFuZ2UnLCB0aGlzKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNldHMgdXAgZXZlbnRzIHRoYXQgYXJlIHRyaWdnZXJlZCBvbiBhIHNlbGVjdGlvbiBjaGFuZ2UuXG4gKlxuICogQG1ldGhvZCBzZXR1cFNlbGVjdGlvbkNoYW5nZUV2ZW50c1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gJGRvY3VtZW50OiBUaGUgZG9jdW1lbnQgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vdGlmaWVyOiBUaGUgY2FsbGJhY2sgdG8gYmUgdHJpZ2dlcmVkIHdoZW4gdGhlIGV2ZW50IGlzIGNhdWdodC5cbiAqL1xuRGlzcGF0Y2hlci5wcm90b3R5cGUuc2V0dXBTZWxlY3Rpb25DaGFuZ2VFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGVjdGlvbkRpcnR5ID0gZmFsc2U7XG4gIHZhciBzdXBwcmVzc1NlbGVjdGlvbkNoYW5nZXMgPSBmYWxzZTtcbiAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xuICB2YXIgc2VsZWN0aW9uV2F0Y2hlciA9IHRoaXMuc2VsZWN0aW9uV2F0Y2hlcjtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICAvLyBmaXJlcyBvbiBtb3VzZW1vdmUgKHRoYXRzIHByb2JhYmx5IGEgYml0IHRvbyBtdWNoKVxuICAvLyBjYXRjaGVzIGNoYW5nZXMgbGlrZSAnc2VsZWN0IGFsbCcgZnJvbSBjb250ZXh0IG1lbnVcbiAgJGRvY3VtZW50Lm9uKCdzZWxlY3Rpb25jaGFuZ2UuZWRpdGFibGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChzdXBwcmVzc1NlbGVjdGlvbkNoYW5nZXMpIHtcbiAgICAgIHNlbGVjdGlvbkRpcnR5ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0aW9uV2F0Y2hlci5zZWxlY3Rpb25DaGFuZ2VkKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBsaXN0ZW4gZm9yIHNlbGVjdGlvbiBjaGFuZ2VzIGJ5IG1vdXNlIHNvIHdlIGNhblxuICAvLyBzdXBwcmVzcyB0aGUgc2VsZWN0aW9uY2hhbmdlIGV2ZW50IGFuZCBvbmx5IGZpcmUgdGhlXG4gIC8vIGNoYW5nZSBldmVudCBvbiBtb3VzZXVwXG4gICRkb2N1bWVudC5vbignbW91c2Vkb3duLmVkaXRhYmxlJywgdGhpcy5lZGl0YWJsZVNlbGVjdG9yLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChfdGhpcy5jb25maWcubW91c2VNb3ZlU2VsZWN0aW9uQ2hhbmdlcyA9PT0gZmFsc2UpIHtcbiAgICAgIHN1cHByZXNzU2VsZWN0aW9uQ2hhbmdlcyA9IHRydWU7XG5cbiAgICAgIC8vIFdpdGhvdXQgdGhpcyB0aW1lb3V0IHRoZSBwcmV2aW91cyBzZWxlY3Rpb24gaXMgYWN0aXZlXG4gICAgICAvLyB1bnRpbCB0aGUgbW91c2V1cCBldmVudCAobm8uIG5vdCBnb29kKS5cbiAgICAgIHNldFRpbWVvdXQoJC5wcm94eShzZWxlY3Rpb25XYXRjaGVyLCAnc2VsZWN0aW9uQ2hhbmdlZCcpLCAwKTtcbiAgICB9XG5cbiAgICAkZG9jdW1lbnQub24oJ21vdXNldXAuZWRpdGFibGVTZWxlY3Rpb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgJGRvY3VtZW50Lm9mZignLmVkaXRhYmxlU2VsZWN0aW9uJyk7XG4gICAgICBzdXBwcmVzc1NlbGVjdGlvbkNoYW5nZXMgPSBmYWxzZTtcblxuICAgICAgaWYgKHNlbGVjdGlvbkRpcnR5KSB7XG4gICAgICAgIHNlbGVjdGlvbkRpcnR5ID0gZmFsc2U7XG4gICAgICAgIHNlbGVjdGlvbldhdGNoZXIuc2VsZWN0aW9uQ2hhbmdlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG5cblxuLyoqXG4gKiBGYWxsYmFjayBzb2x1dGlvbiB0byBzdXBwb3J0IHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnRzIG9uIGJyb3dzZXJzIHRoYXQgZG9uJ3RcbiAqIHN1cHBvcnQgc2VsZWN0aW9uQ2hhbmdlLlxuICpcbiAqIEBtZXRob2Qgc2V0dXBTZWxlY3Rpb25DaGFuZ2VGYWxsYmFja1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gJGRvY3VtZW50OiBUaGUgZG9jdW1lbnQgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vdGlmaWVyOiBUaGUgY2FsbGJhY2sgdG8gYmUgdHJpZ2dlcmVkIHdoZW4gdGhlIGV2ZW50IGlzIGNhdWdodC5cbiAqL1xuRGlzcGF0Y2hlci5wcm90b3R5cGUuc2V0dXBTZWxlY3Rpb25DaGFuZ2VGYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XG4gIHZhciBzZWxlY3Rpb25XYXRjaGVyID0gdGhpcy5zZWxlY3Rpb25XYXRjaGVyO1xuXG4gIC8vIGxpc3RlbiBmb3Igc2VsZWN0aW9uIGNoYW5nZXMgYnkgbW91c2VcbiAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwLmVkaXRhYmxlU2VsZWN0aW9uJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIC8vIEluIE9wZXJhIHdoZW4gY2xpY2tpbmcgb3V0c2lkZSBvZiBhIGJsb2NrXG4gICAgLy8gaXQgZG9lcyBub3QgdXBkYXRlIHRoZSBzZWxlY3Rpb24gYXMgaXQgc2hvdWxkXG4gICAgLy8gd2l0aG91dCB0aGUgdGltZW91dFxuICAgIHNldFRpbWVvdXQoJC5wcm94eShzZWxlY3Rpb25XYXRjaGVyLCAnc2VsZWN0aW9uQ2hhbmdlZCcpLCAwKTtcbiAgfSk7XG5cbiAgLy8gbGlzdGVuIGZvciBzZWxlY3Rpb24gY2hhbmdlcyBieSBrZXlzXG4gICRkb2N1bWVudC5vbigna2V5dXAuZWRpdGFibGUnLCB0aGlzLmVkaXRhYmxlU2VsZWN0b3IsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAvLyB3aGVuIHByZXNzaW5nIENvbW1hbmQgKyBTaGlmdCArIExlZnQgZm9yIGV4YW1wbGUgdGhlIGtleXVwIGlzIG9ubHkgdHJpZ2dlcmVkXG4gICAgLy8gYWZ0ZXIgYXQgbGVhc3QgdHdvIGtleXMgYXJlIHJlbGVhc2VkLiBTdHJhbmdlLiBUaGUgY3VscHJpdCBzZWVtcyB0byBiZSB0aGVcbiAgICAvLyBDb21tYW5kIGtleS4gRG8gd2UgbmVlZCBhIHdvcmthcm91bmQ/XG4gICAgc2VsZWN0aW9uV2F0Y2hlci5zZWxlY3Rpb25DaGFuZ2VkKCk7XG4gIH0pO1xufTtcbiIsIlxuLy8gRXZlbnRhYmxlIE1peGluLlxuLy9cbi8vIFNpbXBsZSBtaXhpbiB0byBhZGQgZXZlbnQgZW1pdHRlciBtZXRob2RzIHRvIGFuIG9iamVjdCAoUHVibGlzaC9TdWJzY3JpYmUpLlxuLy9cbi8vIEFkZCBvbiwgb2ZmIGFuZCBub3RpZnkgbWV0aG9kcyB0byBhbiBvYmplY3Q6XG4vLyBldmVudGFibGUob2JqKTtcbi8vXG4vLyBwdWJsaXNoIGFuIGV2ZW50OlxuLy8gb2JqLm5vdGlmeShjb250ZXh0LCAnYWN0aW9uJywgcGFyYW0xLCBwYXJhbTIpO1xuLy9cbi8vIE9wdGlvbmFsbHkgcGFzcyBhIGNvbnRleHQgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gZXZlcnkgZXZlbnQ6XG4vLyBldmVudGFibGUob2JqLCBjb250ZXh0KTtcbi8vXG4vLyBXaXRoIHRoaXMgcHVibGlzaGluZyBjYW4gb21pdCB0aGUgY29udGV4dCBhcmd1bWVudDpcbi8vIG9iai5ub3RpZnkoJ2FjdGlvbicsIHBhcmFtMSwgcGFyYW0yKTtcbi8vXG4vLyBTdWJzY3JpYmUgdG8gYSAnY2hhbm5lbCdcbi8vIG9iai5vbignYWN0aW9uJywgZnVudGlvbihwYXJhbTEsIHBhcmFtMil7IC4uLiB9KTtcbi8vXG4vLyBVbnN1YnNjcmliZSBhbiBpbmRpdmlkdWFsIGxpc3RlbmVyOlxuLy8gb2JqLm9mZignYWN0aW9uJywgbWV0aG9kKTtcbi8vXG4vLyBVbnN1YnNjcmliZSBhbGwgbGlzdGVuZXJzIG9mIGEgY2hhbm5lbDpcbi8vIG9iai5vZmYoJ2FjdGlvbicpO1xuLy9cbi8vIFVuc3Vic2NyaWJlIGFsbCBsaXN0ZW5lcnMgb2YgYWxsIGNoYW5uZWxzOlxuLy8gb2JqLm9mZigpO1xudmFyIGdldEV2ZW50YWJsZU1vZHVsZSA9IGZ1bmN0aW9uKG5vdGlmeUNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVycyA9IHt9O1xuXG4gIHZhciBhZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGlmIChsaXN0ZW5lcnNbZXZlbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGxpc3RlbmVyc1tldmVudF0gPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJzW2V2ZW50XS5wdXNoKGxpc3RlbmVyKTtcbiAgfTtcblxuICB2YXIgcmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgICB2YXIgZXZlbnRMaXN0ZW5lcnMgPSBsaXN0ZW5lcnNbZXZlbnRdO1xuICAgIGlmIChldmVudExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChldmVudExpc3RlbmVyc1tpXSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUHVibGljIE1ldGhvZHNcbiAgcmV0dXJuIHtcbiAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBhZGRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHZhciBldmVudE9iaiA9IGV2ZW50O1xuICAgICAgICBmb3IgKHZhciBldmVudFR5cGUgaW4gZXZlbnRPYmopIHtcbiAgICAgICAgICBhZGRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50T2JqW2V2ZW50VHlwZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgb2ZmOiBmdW5jdGlvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgbGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdGVuZXJzID0ge307XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5vdGlmeTogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGlmIChub3RpZnlDb250ZXh0KSB7XG4gICAgICAgIGV2ZW50ID0gY29udGV4dDtcbiAgICAgICAgY29udGV4dCA9IG5vdGlmeUNvbnRleHQ7XG4gICAgICAgIGFyZ3MgPSBhcmdzLnNwbGljZSgxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLnNwbGljZSgyKTtcbiAgICAgIH1cbiAgICAgIHZhciBldmVudExpc3RlbmVycyA9IGxpc3RlbmVyc1tldmVudF07XG4gICAgICBpZiAoZXZlbnRMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAvLyBUcmF2ZXJzZSBiYWNrd2FyZHMgYW5kIGV4ZWN1dGUgdGhlIG5ld2VzdCBsaXN0ZW5lcnMgZmlyc3QuXG4gICAgICAvLyBTdG9wIGlmIGEgbGlzdGVuZXIgcmV0dXJucyBmYWxzZS5cbiAgICAgIGZvciAodmFyIGkgPSBldmVudExpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAvLyBkZWJ1Z2dlclxuICAgICAgICBpZiAoZXZlbnRMaXN0ZW5lcnNbaV0uYXBwbHkoY29udGV4dCwgYXJncykgPT09IGZhbHNlKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIG5vdGlmeUNvbnRleHQpIHtcbiAgdmFyIG1vZHVsZSA9IGdldEV2ZW50YWJsZU1vZHVsZShub3RpZnlDb250ZXh0KTtcbiAgZm9yICh2YXIgcHJvcCBpbiBtb2R1bGUpIHtcbiAgICBvYmpbcHJvcF0gPSBtb2R1bGVbcHJvcF07XG4gIH1cbn07XG4iLCJ2YXIgYnJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgLyoqXG4gICAqIENoZWNrIGZvciBjb250ZW50ZWRpdGFibGUgc3VwcG9ydFxuICAgKlxuICAgKiAoZnJvbSBNb2Rlcm5penIpXG4gICAqIHRoaXMgaXMga25vd24gdG8gZmFsc2UgcG9zaXRpdmUgaW4gc29tZSBtb2JpbGUgYnJvd3NlcnNcbiAgICogaGVyZSBpcyBhIHdoaXRlbGlzdCBvZiB2ZXJpZmllZCB3b3JraW5nIGJyb3dzZXJzOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vTmllbHNMZWVuaGVlci9odG1sNXRlc3QvYmxvYi81NDlmNmVhYzg2NmFhODYxZDk2NDlhMDcwN2ZmMmMwMTU3ODk1NzA2L3NjcmlwdHMvZW5naW5lLmpzI0wyMDgzXG4gICAqL1xuICB2YXIgY29udGVudGVkaXRhYmxlID0gdHlwZW9mIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jb250ZW50RWRpdGFibGUgIT09ICd1bmRlZmluZWQnO1xuXG4gIC8qKlxuICAgKiBDaGVjayBzZWxlY3Rpb25jaGFuZ2UgZXZlbnQgKGN1cnJlbnRseSBzdXBwb3J0ZWQgaW4gSUUsIENocm9tZSBhbmQgU2FmYXJpKVxuICAgKlxuICAgKiBUbyBoYW5kbGUgc2VsZWN0aW9uY2hhbmdlIGluIGZpcmVmb3ggc2VlIENLRWRpdG9yIHNlbGVjdGlvbiBvYmplY3RcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2NrZWRpdG9yL2NrZWRpdG9yLWRldi9ibG9iL21hc3Rlci9jb3JlL3NlbGVjdGlvbi5qcyNMMzg4XG4gICAqL1xuICB2YXIgc2VsZWN0aW9uY2hhbmdlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gbm90IGV4YWN0bHkgZmVhdHVyZSBkZXRlY3Rpb24uLi4gaXMgaXQ/XG4gICAgcmV0dXJuICEoYnJvd3Nlci5nZWNrbyB8fCBicm93c2VyLm9wZXJhKTtcbiAgfSkoKTtcblxuXG4gIC8vIENocm9tZSBjb250ZW50ZWRpdGFibGUgYnVnIHdoZW4gaW5zZXJ0aW5nIGEgY2hhcmFjdGVyIHdpdGggYSBzZWxlY3Rpb24gdGhhdDpcbiAgLy8gIC0gc3RhcnRzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbnRlbnRlZGl0YWJsZVxuICAvLyAgLSBjb250YWlucyBhIHN0eWxlZCBzcGFuXG4gIC8vICAtIGFuZCBzb21lIHVuc3R5bGVkIHRleHRcbiAgLy9cbiAgLy8gRXhhbXBsZTpcbiAgLy8gPHA+fDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0XCI+YTwvc3Bhbj5ifDwvcD5cbiAgLy9cbiAgLy8gRm9yIG1vcmUgZGV0YWlsczpcbiAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTMzNTk1NVxuICAvL1xuICAvLyBJdCBzZWVtcyBpdCBpcyBhIHdlYmtpdCBidWcgYXMgSSBjb3VsZCByZXByb2R1Y2Ugb24gU2FmYXJpIChMUCkuXG4gIHZhciBjb250ZW50ZWRpdGFibGVTcGFuQnVnID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhIWJyb3dzZXIud2Via2l0O1xuICB9KSgpO1xuXG5cbiAgcmV0dXJuIHtcbiAgICBjb250ZW50ZWRpdGFibGU6IGNvbnRlbnRlZGl0YWJsZSxcbiAgICBzZWxlY3Rpb25jaGFuZ2U6IHNlbGVjdGlvbmNoYW5nZSxcbiAgICBjb250ZW50ZWRpdGFibGVTcGFuQnVnOiBjb250ZW50ZWRpdGFibGVTcGFuQnVnXG4gIH07XG5cbn0pKCk7XG4iLCJ2YXIgcmFuZ3kgPSByZXF1aXJlKCdyYW5neScpO1xudmFyIE5vZGVJdGVyYXRvciA9IHJlcXVpcmUoJy4vbm9kZS1pdGVyYXRvcicpO1xudmFyIG5vZGVUeXBlID0gcmVxdWlyZSgnLi9ub2RlLXR5cGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgcmV0dXJuIHtcbiAgICBleHRyYWN0VGV4dDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHRleHQgPSAnJztcbiAgICAgIHRoaXMuZ2V0VGV4dChlbGVtZW50LCBmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHRleHQgKz0gcGFydDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfSxcblxuICAgIC8vIEV4dHJhY3QgdGhlIHRleHQgb2YgYW4gZWxlbWVudC5cbiAgICAvLyBUaGlzIGhhcyB0d28gbm90YWJsZSBiZWhhdmlvdXJzOlxuICAgIC8vIC0gSXQgdXNlcyBhIE5vZGVJdGVyYXRvciB3aGljaCB3aWxsIHNraXAgZWxlbWVudHNcbiAgICAvLyAgIHdpdGggZGF0YS1lZGl0YWJsZT1cInJlbW92ZVwiXG4gICAgLy8gLSBJdCByZXR1cm5zIGEgc3BhY2UgZm9yIDxicj4gZWxlbWVudHNcbiAgICAvLyAgIChUaGUgb25seSBibG9jayBsZXZlbCBlbGVtZW50IGFsbG93ZWQgaW5zaWRlIG9mIGVkaXRhYmxlcylcbiAgICBnZXRUZXh0OiBmdW5jdGlvbihlbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gbmV3IE5vZGVJdGVyYXRvcihlbGVtZW50KTtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgd2hpbGUgKCAobmV4dCA9IGl0ZXJhdG9yLmdldE5leHQoKSkgKSB7XG4gICAgICAgIGlmIChuZXh0Lm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSAmJiBuZXh0LmRhdGEgIT09ICcnKSB7XG4gICAgICAgICAgY2FsbGJhY2sobmV4dC5kYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0Lm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSAmJiBuZXh0Lm5vZGVOYW1lID09PSAnQlInKSB7XG4gICAgICAgICAgY2FsbGJhY2soJyAnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWdobGlnaHQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHJlZ2V4LCBzdGVuY2lsRWxlbWVudCkge1xuICAgICAgdmFyIG1hdGNoZXMgPSB0aGlzLmZpbmQoZWxlbWVudCwgcmVnZXgpO1xuICAgICAgdGhpcy5oaWdobGlnaHRNYXRjaGVzKGVsZW1lbnQsIG1hdGNoZXMsIHN0ZW5jaWxFbGVtZW50KTtcbiAgICB9LFxuXG4gICAgZmluZDogZnVuY3Rpb24oZWxlbWVudCwgcmVnZXgpIHtcbiAgICAgIHZhciB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dChlbGVtZW50KTtcbiAgICAgIHZhciBtYXRjaDtcbiAgICAgIHZhciBtYXRjaGVzID0gW107XG4gICAgICB2YXIgbWF0Y2hJbmRleCA9IDA7XG4gICAgICB3aGlsZSAoIChtYXRjaCA9IHJlZ2V4LmV4ZWModGV4dCkpICkge1xuICAgICAgICBtYXRjaGVzLnB1c2godGhpcy5wcmVwYXJlTWF0Y2gobWF0Y2gsIG1hdGNoSW5kZXgpKTtcbiAgICAgICAgbWF0Y2hJbmRleCArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgfSxcblxuICAgIGhpZ2hsaWdodE1hdGNoZXM6IGZ1bmN0aW9uKGVsZW1lbnQsIG1hdGNoZXMsIHN0ZW5jaWxFbGVtZW50KSB7XG4gICAgICBpZiAoIW1hdGNoZXMgfHwgbWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV4dCwgdGV4dE5vZGUsIGxlbmd0aCwgb2Zmc2V0LCBpc0ZpcnN0UG9ydGlvbiwgaXNMYXN0UG9ydGlvbiwgd29yZElkO1xuICAgICAgdmFyIGN1cnJlbnRNYXRjaEluZGV4ID0gMDtcbiAgICAgIHZhciBjdXJyZW50TWF0Y2ggPSBtYXRjaGVzW2N1cnJlbnRNYXRjaEluZGV4XTtcbiAgICAgIHZhciB0b3RhbE9mZnNldCA9IDA7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBuZXcgTm9kZUl0ZXJhdG9yKGVsZW1lbnQpO1xuICAgICAgdmFyIHBvcnRpb25zID0gW107XG4gICAgICB3aGlsZSAoIChuZXh0ID0gaXRlcmF0b3IuZ2V0TmV4dCgpKSApIHtcblxuICAgICAgICAvLyBBY2NvdW50IGZvciA8YnI+IGVsZW1lbnRzXG4gICAgICAgIGlmIChuZXh0Lm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSAmJiBuZXh0LmRhdGEgIT09ICcnKSB7XG4gICAgICAgICAgdGV4dE5vZGUgPSBuZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKG5leHQubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlICYmIG5leHQubm9kZU5hbWUgPT09ICdCUicpIHtcbiAgICAgICAgICB0b3RhbE9mZnNldCA9IHRvdGFsT2Zmc2V0ICsgMTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBub2RlVGV4dCA9IHRleHROb2RlLmRhdGE7XG4gICAgICAgIHZhciBub2RlRW5kT2Zmc2V0ID0gdG90YWxPZmZzZXQgKyBub2RlVGV4dC5sZW5ndGg7XG4gICAgICAgIGlmIChjdXJyZW50TWF0Y2guc3RhcnRJbmRleCA8IG5vZGVFbmRPZmZzZXQgJiYgdG90YWxPZmZzZXQgPCBjdXJyZW50TWF0Y2guZW5kSW5kZXgpIHtcblxuICAgICAgICAgIC8vIGdldCBwb3J0aW9uIHBvc2l0aW9uIChmaXN0LCBsYXN0IG9yIGluIHRoZSBtaWRkbGUpXG4gICAgICAgICAgaXNGaXJzdFBvcnRpb24gPSBpc0xhc3RQb3J0aW9uID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHRvdGFsT2Zmc2V0IDw9IGN1cnJlbnRNYXRjaC5zdGFydEluZGV4KSB7XG4gICAgICAgICAgICBpc0ZpcnN0UG9ydGlvbiA9IHRydWU7XG4gICAgICAgICAgICB3b3JkSWQgPSBjdXJyZW50TWF0Y2guc3RhcnRJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5vZGVFbmRPZmZzZXQgPj0gY3VycmVudE1hdGNoLmVuZEluZGV4KSB7XG4gICAgICAgICAgICBpc0xhc3RQb3J0aW9uID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0IGFuZCBsZW5ndGhcbiAgICAgICAgICBpZiAoaXNGaXJzdFBvcnRpb24pIHtcbiAgICAgICAgICAgIG9mZnNldCA9IGN1cnJlbnRNYXRjaC5zdGFydEluZGV4IC0gdG90YWxPZmZzZXQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzTGFzdFBvcnRpb24pIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IChjdXJyZW50TWF0Y2guZW5kSW5kZXggLSB0b3RhbE9mZnNldCkgLSBvZmZzZXQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IG5vZGVUZXh0Lmxlbmd0aCAtIG9mZnNldDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjcmVhdGUgcG9ydGlvbiBvYmplY3RcbiAgICAgICAgICB2YXIgcG9ydGlvbiA9IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRleHROb2RlLFxuICAgICAgICAgICAgdGV4dDogbm9kZVRleHQuc3Vic3RyaW5nKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSxcbiAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgICAgICBpc0xhc3RQb3J0aW9uOiBpc0xhc3RQb3J0aW9uLFxuICAgICAgICAgICAgd29yZElkOiB3b3JkSWRcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcG9ydGlvbnMucHVzaChwb3J0aW9uKTtcblxuICAgICAgICAgIGlmIChpc0xhc3RQb3J0aW9uKSB7XG4gICAgICAgICAgICB2YXIgbGFzdE5vZGUgPSB0aGlzLndyYXBXb3JkKHBvcnRpb25zLCBzdGVuY2lsRWxlbWVudCk7XG4gICAgICAgICAgICBpdGVyYXRvci5yZXBsYWNlQ3VycmVudChsYXN0Tm9kZSk7XG5cbiAgICAgICAgICAgIC8vIHJlY2FsY3VsYXRlIG5vZGVFbmRPZmZzZXQgaWYgd2UgaGF2ZSB0byByZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgICAgICAgICBub2RlRW5kT2Zmc2V0ID0gdG90YWxPZmZzZXQgKyBwb3J0aW9uLmxlbmd0aCArIHBvcnRpb24ub2Zmc2V0O1xuXG4gICAgICAgICAgICBwb3J0aW9ucyA9IFtdO1xuICAgICAgICAgICAgY3VycmVudE1hdGNoSW5kZXggKz0gMTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50TWF0Y2hJbmRleCA8IG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRNYXRjaCA9IG1hdGNoZXNbY3VycmVudE1hdGNoSW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRvdGFsT2Zmc2V0ID0gbm9kZUVuZE9mZnNldDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0UmFuZ2U6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciByYW5nZSA9IHJhbmd5LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSxcblxuICAgIC8vIEByZXR1cm4gdGhlIGxhc3Qgd3JhcHBlZCBlbGVtZW50XG4gICAgd3JhcFdvcmQ6IGZ1bmN0aW9uKHBvcnRpb25zLCBzdGVuY2lsRWxlbWVudCkge1xuICAgICAgdmFyIGVsZW1lbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvcnRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwb3J0aW9uID0gcG9ydGlvbnNbaV07XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLndyYXBQb3J0aW9uKHBvcnRpb24sIHN0ZW5jaWxFbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfSxcblxuICAgIHdyYXBQb3J0aW9uOiBmdW5jdGlvbihwb3J0aW9uLCBzdGVuY2lsRWxlbWVudCkge1xuICAgICAgdmFyIHJhbmdlID0gcmFuZ3kuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIHJhbmdlLnNldFN0YXJ0KHBvcnRpb24uZWxlbWVudCwgcG9ydGlvbi5vZmZzZXQpO1xuICAgICAgcmFuZ2Uuc2V0RW5kKHBvcnRpb24uZWxlbWVudCwgcG9ydGlvbi5vZmZzZXQgKyBwb3J0aW9uLmxlbmd0aCk7XG4gICAgICB2YXIgbm9kZSA9IHN0ZW5jaWxFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLXdvcmQtaWQnLCBwb3J0aW9uLndvcmRJZCk7XG4gICAgICByYW5nZS5zdXJyb3VuZENvbnRlbnRzKG5vZGUpO1xuXG4gICAgICAvLyBGaXggYSB3ZWlyZCBiZWhhdmlvdXIgd2hlcmUgYW4gZW1wdHkgdGV4dCBub2RlIGlzIGluc2VydGVkIGFmdGVyIHRoZSByYW5nZVxuICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgdmFyIG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICBpZiAobmV4dC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUgJiYgbmV4dC5kYXRhID09PSAnJykge1xuICAgICAgICAgIG5leHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuXG4gICAgcHJlcGFyZU1hdGNoOiBmdW5jdGlvbiAobWF0Y2gsIG1hdGNoSW5kZXgpIHtcbiAgICAgIC8vIFF1aWNrZml4IGZvciB0aGUgc3BlbGxjaGVjayByZWdleCB3aGVyZSB3ZSBuZWVkIHRvIG1hdGNoIHRoZSBzZWNvbmQgc3ViZ3JvdXAuXG4gICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJlcGFyZU1hdGNoRm9yU2Vjb25kU3ViZ3JvdXAobWF0Y2gsIG1hdGNoSW5kZXgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydEluZGV4OiBtYXRjaC5pbmRleCxcbiAgICAgICAgZW5kSW5kZXg6IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoLFxuICAgICAgICBtYXRjaEluZGV4OiBtYXRjaEluZGV4LFxuICAgICAgICBzZWFyY2g6IG1hdGNoWzBdXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBwcmVwYXJlTWF0Y2hGb3JTZWNvbmRTdWJncm91cDogZnVuY3Rpb24gKG1hdGNoLCBtYXRjaEluZGV4KSB7XG4gICAgICB2YXIgaW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICAgIGluZGV4ICs9IG1hdGNoWzFdLmxlbmd0aDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0SW5kZXg6IGluZGV4LFxuICAgICAgICBlbmRJbmRleDogaW5kZXggKyBtYXRjaFsyXS5sZW5ndGgsXG4gICAgICAgIG1hdGNoSW5kZXg6IG1hdGNoSW5kZXgsXG4gICAgICAgIHNlYXJjaDogbWF0Y2hbMF1cbiAgICAgIH07XG4gICAgfVxuXG4gIH07XG59KSgpO1xuIiwidmFyIGJyb3dzZXJGZWF0dXJlcyA9IHJlcXVpcmUoJy4vZmVhdHVyZS1kZXRlY3Rpb24nKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG52YXIgZXZlbnRhYmxlID0gcmVxdWlyZSgnLi9ldmVudGFibGUnKTtcblxuLyoqXG4gKiBUaGUgS2V5Ym9hcmQgbW9kdWxlIGRlZmluZXMgYW4gZXZlbnQgQVBJIGZvciBrZXkgZXZlbnRzLlxuICovXG52YXIgS2V5Ym9hcmQgPSBmdW5jdGlvbihzZWxlY3Rpb25XYXRjaGVyKSB7XG4gIGV2ZW50YWJsZSh0aGlzKTtcbiAgdGhpcy5zZWxlY3Rpb25XYXRjaGVyID0gc2VsZWN0aW9uV2F0Y2hlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS5kaXNwYXRjaEtleUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIHRhcmdldCwgbm90aWZ5Q2hhcmFjdGVyRXZlbnQpIHtcbiAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cbiAgY2FzZSB0aGlzLmtleS5sZWZ0OlxuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ2xlZnQnLCBldmVudCk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleS5yaWdodDpcbiAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdyaWdodCcsIGV2ZW50KTtcbiAgICBicmVhaztcblxuICBjYXNlIHRoaXMua2V5LnVwOlxuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ3VwJywgZXZlbnQpO1xuICAgIGJyZWFrO1xuXG4gIGNhc2UgdGhpcy5rZXkuZG93bjpcbiAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdkb3duJywgZXZlbnQpO1xuICAgIGJyZWFrO1xuXG4gIGNhc2UgdGhpcy5rZXkudGFiOlxuICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnc2hpZnRUYWInLCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ3RhYicsIGV2ZW50KTtcbiAgICB9XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleS5lc2M6XG4gICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnZXNjJywgZXZlbnQpO1xuICAgIGJyZWFrO1xuXG4gIGNhc2UgdGhpcy5rZXkuYmFja3NwYWNlOlxuICAgIHRoaXMucHJldmVudENvbnRlbnRlZGl0YWJsZUJ1Zyh0YXJnZXQsIGV2ZW50KTtcbiAgICB0aGlzLm5vdGlmeSh0YXJnZXQsICdiYWNrc3BhY2UnLCBldmVudCk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB0aGlzLmtleVsnZGVsZXRlJ106XG4gICAgdGhpcy5wcmV2ZW50Q29udGVudGVkaXRhYmxlQnVnKHRhcmdldCwgZXZlbnQpO1xuICAgIHRoaXMubm90aWZ5KHRhcmdldCwgJ2RlbGV0ZScsIGV2ZW50KTtcbiAgICBicmVhaztcblxuICBjYXNlIHRoaXMua2V5LmVudGVyOlxuICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnc2hpZnRFbnRlcicsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnZW50ZXInLCBldmVudCk7XG4gICAgfVxuICAgIGJyZWFrO1xuICBjYXNlIHRoaXMua2V5LmN0cmw6XG4gIGNhc2UgdGhpcy5rZXkuc2hpZnQ6XG4gIGNhc2UgdGhpcy5rZXkuYWx0OlxuICAgIGJyZWFrO1xuICAvLyBNZXRha2V5XG4gIGNhc2UgMjI0OiAvLyBGaXJlZm94OiAyMjRcbiAgY2FzZSAxNzogLy8gT3BlcmE6IDE3XG4gIGNhc2UgOTE6IC8vIENocm9tZS9TYWZhcmk6IDkxIChMZWZ0KVxuICBjYXNlIDkzOiAvLyBDaHJvbWUvU2FmYXJpOiA5MyAoUmlnaHQpXG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgdGhpcy5wcmV2ZW50Q29udGVudGVkaXRhYmxlQnVnKHRhcmdldCwgZXZlbnQpO1xuICAgIGlmIChub3RpZnlDaGFyYWN0ZXJFdmVudCkge1xuICAgICAgdGhpcy5ub3RpZnkodGFyZ2V0LCAnY2hhcmFjdGVyJywgZXZlbnQpO1xuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnByZXZlbnRDb250ZW50ZWRpdGFibGVCdWcgPSBmdW5jdGlvbih0YXJnZXQsIGV2ZW50KSB7XG4gIGlmIChicm93c2VyRmVhdHVyZXMuY29udGVudGVkaXRhYmxlU3BhbkJ1Zykge1xuICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpIHJldHVybjtcblxuICAgIHZhciByYW5nZSA9IHRoaXMuc2VsZWN0aW9uV2F0Y2hlci5nZXRGcmVzaFJhbmdlKCk7XG4gICAgaWYgKHJhbmdlLmlzU2VsZWN0aW9uKSB7XG4gICAgICB2YXIgbm9kZVRvQ2hlY2ssIHJhbmd5UmFuZ2UgPSByYW5nZS5yYW5nZTtcblxuICAgICAgLy8gV2Via2l0cyBjb250ZW50ZWRpdGFibGUgaW5zZXJ0cyBzcGFucyB3aGVuIHRoZXJlIGlzIGFcbiAgICAgIC8vIHN0eWxlZCBub2RlIHRoYXQgc3RhcnRzIGp1c3Qgb3V0c2lkZSBvZiB0aGUgc2VsZWN0aW9uIGFuZFxuICAgICAgLy8gaXMgY29udGFpbmVkIGluIHRoZSBzZWxlY3Rpb24gYW5kIGZvbGxvd2VkIGJ5IG90aGVyIHRleHROb2Rlcy5cbiAgICAgIC8vIFNvIGZpcnN0IHdlIGNoZWNrIGlmIHdlIGhhdmUgYSBub2RlIGp1c3QgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGVcbiAgICAgIC8vIHNlbGVjdGlvbi4gQW5kIGlmIHNvIHdlIGRlbGV0ZSBpdCBiZWZvcmUgQ2hyb21lIGNhbiBkbyBpdHMgbWFnaWMuXG4gICAgICBpZiAocmFuZ3lSYW5nZS5zdGFydE9mZnNldCA9PT0gMCkge1xuICAgICAgICBpZiAocmFuZ3lSYW5nZS5zdGFydENvbnRhaW5lci5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUpIHtcbiAgICAgICAgICBub2RlVG9DaGVjayA9IHJhbmd5UmFuZ2Uuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcbiAgICAgICAgfSBlbHNlIGlmIChyYW5neVJhbmdlLnN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlID09PSBub2RlVHlwZS5lbGVtZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGVUb0NoZWNrID0gcmFuZ3lSYW5nZS5zdGFydENvbnRhaW5lcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZVRvQ2hlY2sgJiYgbm9kZVRvQ2hlY2sgIT09IHRhcmdldCAmJiByYW5neVJhbmdlLmNvbnRhaW5zTm9kZShub2RlVG9DaGVjaywgdHJ1ZSkpIHtcbiAgICAgICAgbm9kZVRvQ2hlY2sucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUua2V5ID0ge1xuICBsZWZ0OiAzNyxcbiAgdXA6IDM4LFxuICByaWdodDogMzksXG4gIGRvd246IDQwLFxuICB0YWI6IDksXG4gIGVzYzogMjcsXG4gIGJhY2tzcGFjZTogOCxcbiAgJ2RlbGV0ZSc6IDQ2LFxuICBlbnRlcjogMTMsXG4gIHNoaWZ0OiAxNixcbiAgY3RybDogMTcsXG4gIGFsdDogMThcbn07XG5cbktleWJvYXJkLmtleSA9IEtleWJvYXJkLnByb3RvdHlwZS5rZXk7XG4iLCJ2YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpO1xuXG4vLyBBIERPTSBub2RlIGl0ZXJhdG9yLlxuLy9cbi8vIEhhcyB0aGUgYWJpbGl0eSB0byByZXBsYWNlIG5vZGVzIG9uIHRoZSBmbHkgYW5kIGNvbnRpbnVlXG4vLyB0aGUgaXRlcmF0aW9uLlxudmFyIE5vZGVJdGVyYXRvcjtcbm1vZHVsZS5leHBvcnRzID0gTm9kZUl0ZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBOb2RlSXRlcmF0b3IgPSBmdW5jdGlvbihyb290KSB7XG4gICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLm5leHQgPSB0aGlzLnJvb3Q7XG4gIH07XG5cbiAgTm9kZUl0ZXJhdG9yLnByb3RvdHlwZS5nZXROZXh0VGV4dE5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dDtcbiAgICB3aGlsZSAoIChuZXh0ID0gdGhpcy5nZXROZXh0KCkpICkge1xuICAgICAgaWYgKG5leHQubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlICYmIG5leHQuZGF0YSAhPT0gJycpIHtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIE5vZGVJdGVyYXRvci5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGlsZCwgbjtcbiAgICBuID0gdGhpcy5jdXJyZW50ID0gdGhpcy5uZXh0O1xuICAgIGNoaWxkID0gdGhpcy5uZXh0ID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLmN1cnJlbnQpIHtcbiAgICAgIGNoaWxkID0gbi5maXJzdENoaWxkO1xuXG4gICAgICAvLyBTa2lwIHRoZSBjaGlsZHJlbiBvZiBlbGVtZW50cyB3aXRoIHRoZSBhdHRyaWJ1dGUgZGF0YS1lZGl0YWJsZT1cInJlbW92ZVwiXG4gICAgICAvLyBUaGlzIHByZXZlbnRzIHRleHQgbm9kZXMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIGNvbnRlbnQgdG8gYmUgaW5jbHVkZWQuXG4gICAgICBpZiAoY2hpbGQgJiYgbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWRpdGFibGUnKSAhPT0gJ3JlbW92ZScpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gY2hpbGQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAoKG4gIT09IHRoaXMucm9vdCkgJiYgISh0aGlzLm5leHQgPSBuLm5leHRTaWJsaW5nKSkge1xuICAgICAgICAgIG4gPSBuLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudDtcbiAgfTtcblxuICBOb2RlSXRlcmF0b3IucHJvdG90eXBlLnJlcGxhY2VDdXJyZW50ID0gZnVuY3Rpb24ocmVwbGFjZW1lbnQpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSByZXBsYWNlbWVudDtcbiAgICB0aGlzLm5leHQgPSB1bmRlZmluZWQ7XG4gICAgdmFyIG4gPSB0aGlzLmN1cnJlbnQ7XG4gICAgd2hpbGUgKChuICE9PSB0aGlzLnJvb3QpICYmICEodGhpcy5uZXh0ID0gbi5uZXh0U2libGluZykpIHtcbiAgICAgIG4gPSBuLnBhcmVudE5vZGU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBOb2RlSXRlcmF0b3I7XG59KSgpO1xuIiwiLy8gRE9NIG5vZGUgdHlwZXNcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlLm5vZGVUeXBlXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZWxlbWVudE5vZGU6IDEsXG4gIGF0dHJpYnV0ZU5vZGU6IDIsXG4gIHRleHROb2RlOiAzLFxuICBjZGF0YVNlY3Rpb25Ob2RlOiA0LFxuICBlbnRpdHlSZWZlcmVuY2VOb2RlOiA1LFxuICBlbnRpdHlOb2RlOiA2LFxuICBwcm9jZXNzaW5nSW5zdHJ1Y3Rpb25Ob2RlOiA3LFxuICBjb21tZW50Tm9kZTogOCxcbiAgZG9jdW1lbnROb2RlOiA5LFxuICBkb2N1bWVudFR5cGVOb2RlOiAxMCxcbiAgZG9jdW1lbnRGcmFnbWVudE5vZGU6IDExLFxuICBub3RhdGlvbk5vZGU6IDEyXG59O1xuIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuL3V0aWwvc3RyaW5nJyk7XG52YXIgbm9kZVR5cGUgPSByZXF1aXJlKCcuL25vZGUtdHlwZScpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG5cbi8qKlxuICogVGhlIHBhcnNlciBtb2R1bGUgcHJvdmlkZXMgaGVscGVyIG1ldGhvZHMgdG8gcGFyc2UgaHRtbC1jaHVua3NcbiAqIG1hbmlwdWxhdGlvbnMgYW5kIGhlbHBlcnMgZm9yIGNvbW1vbiB0YXNrcy5cbiAqXG4gKiBAbW9kdWxlIGNvcmVcbiAqIEBzdWJtb2R1bGUgcGFyc2VyXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIC8qKlxuICAgKiBTaW5nbGV0b24gdGhhdCBwcm92aWRlcyBET00gbG9va3VwIGhlbHBlcnMuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHJldHVybiB7XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGVkaXRhYmxlSlMgaG9zdCBibG9jayBvZiBhIG5vZGUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEhvc3RcbiAgICAgKiBAcGFyYW0ge0RPTSBOb2RlfVxuICAgICAqIEByZXR1cm4ge0RPTSBOb2RlfVxuICAgICAqL1xuICAgIGdldEhvc3Q6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciBlZGl0YWJsZVNlbGVjdG9yID0gJy4nICsgY29uZmlnLmVkaXRhYmxlQ2xhc3M7XG4gICAgICB2YXIgaG9zdE5vZGUgPSAkKG5vZGUpLmNsb3Nlc3QoZWRpdGFibGVTZWxlY3Rvcik7XG4gICAgICByZXR1cm4gaG9zdE5vZGUubGVuZ3RoID8gaG9zdE5vZGVbMF0gOiB1bmRlZmluZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaW5kZXggb2YgYSBub2RlLlxuICAgICAqIFNvIHRoYXQgcGFyZW50LmNoaWxkTm9kZXNbIGdldEluZGV4KG5vZGUpIF0gd291bGQgcmV0dXJuIHRoZSBub2RlIGFnYWluXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldE5vZGVJbmRleFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgZ2V0Tm9kZUluZGV4OiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgd2hpbGUgKChub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmcpICE9PSBudWxsKSB7XG4gICAgICAgIGluZGV4ICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG5vZGUgY29udGFpbnMgdGV4dCBvciBlbGVtZW50IG5vZGVzXG4gICAgICogd2hpdGVzcGFjZSBjb3VudHMgdG9vIVxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc1ZvaWRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIGlzVm9pZDogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGNoaWxkLCBpLCBsZW47XG4gICAgICB2YXIgY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcblxuICAgICAgZm9yIChpID0gMCwgbGVuID0gY2hpbGROb2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjaGlsZCA9IGNoaWxkTm9kZXNbaV07XG5cbiAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSAmJiAhdGhpcy5pc1ZvaWRUZXh0Tm9kZShjaGlsZCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hpbGQubm9kZVR5cGUgPT09IG5vZGVUeXBlLmVsZW1lbnROb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgbm9kZSBpcyBhIHRleHQgbm9kZSBhbmQgY29tcGxldGVseSBlbXB0eSB3aXRob3V0IGFueSB3aGl0ZXNwYWNlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGlzVm9pZFRleHROb2RlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBpc1ZvaWRUZXh0Tm9kZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlICYmICFub2RlLm5vZGVWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgbm9kZSBpcyBhIHRleHQgbm9kZSBhbmQgY29udGFpbnMgbm90aGluZyBidXQgd2hpdGVzcGFjZVxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc1doaXRlc3BhY2VPbmx5XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBpc1doaXRlc3BhY2VPbmx5OiBmdW5jdGlvbihub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUgJiYgdGhpcy5sYXN0T2Zmc2V0V2l0aENvbnRlbnQobm9kZSkgPT09IDA7XG4gICAgfSxcblxuICAgIGlzTGluZWJyZWFrOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZWxlbWVudE5vZGUgJiYgbm9kZS50YWdOYW1lID09PSAnQlInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsYXN0IG9mZnNldCB3aGVyZSB0aGUgY3Vyc29yIGNhbiBiZSBwb3NpdGlvbmVkIHRvXG4gICAgICogYmUgYXQgdGhlIHZpc2libGUgZW5kIG9mIGl0cyBjb250YWluZXIuXG4gICAgICogQ3VycmVudGx5IHdvcmtzIG9ubHkgZm9yIGVtcHR5IHRleHQgbm9kZXMgKG5vdCBlbXB0eSB0YWdzKVxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc1doaXRlc3BhY2VPbmx5XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBsYXN0T2Zmc2V0V2l0aENvbnRlbnQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLnRyaW1SaWdodChub2RlLm5vZGVWYWx1ZSkubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBjaGlsZE5vZGVzID0gbm9kZS5jaGlsZE5vZGVzO1xuXG4gICAgICAgIGZvciAoaSA9IGNoaWxkTm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBub2RlID0gY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgICBpZiAodGhpcy5pc1doaXRlc3BhY2VPbmx5KG5vZGUpIHx8IHRoaXMuaXNMaW5lYnJlYWsobm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGUgb2Zmc2V0IHN0YXJ0cyBhdCAwIGJlZm9yZSB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICAgICAgLy8gYW5kIGVuZHMgd2l0aCB0aGUgbGVuZ3RoIGFmdGVyIHRoZSBsYXN0IGVsZW1lbnQuXG4gICAgICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc0JlZ2lubmluZ09mSG9zdDogZnVuY3Rpb24oaG9zdCwgY29udGFpbmVyLCBvZmZzZXQpIHtcbiAgICAgIGlmIChjb250YWluZXIgPT09IGhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTdGFydE9mZnNldChjb250YWluZXIsIG9mZnNldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzU3RhcnRPZmZzZXQoY29udGFpbmVyLCBvZmZzZXQpKSB7XG4gICAgICAgIHZhciBwYXJlbnRDb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgc2ltdWxhdGVzIGEgcmFuZ2Ugb2Zmc2V0XG4gICAgICAgIC8vIHJpZ2h0IGJlZm9yZSB0aGUgZWxlbWVudC5cbiAgICAgICAgdmFyIG9mZnNldEluUGFyZW50ID0gdGhpcy5nZXROb2RlSW5kZXgoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCZWdpbm5pbmdPZkhvc3QoaG9zdCwgcGFyZW50Q29udGFpbmVyLCBvZmZzZXRJblBhcmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzRW5kT2ZIb3N0OiBmdW5jdGlvbihob3N0LCBjb250YWluZXIsIG9mZnNldCkge1xuICAgICAgaWYgKGNvbnRhaW5lciA9PT0gaG9zdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VuZE9mZnNldChjb250YWluZXIsIG9mZnNldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzRW5kT2Zmc2V0KGNvbnRhaW5lciwgb2Zmc2V0KSkge1xuICAgICAgICB2YXIgcGFyZW50Q29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IHBsdXMgb25lIHNpbXVsYXRlcyBhIHJhbmdlIG9mZnNldFxuICAgICAgICAvLyByaWdodCBhZnRlciB0aGUgZWxlbWVudC5cbiAgICAgICAgdmFyIG9mZnNldEluUGFyZW50ID0gdGhpcy5nZXROb2RlSW5kZXgoY29udGFpbmVyKSArIDE7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRW5kT2ZIb3N0KGhvc3QsIHBhcmVudENvbnRhaW5lciwgb2Zmc2V0SW5QYXJlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc1N0YXJ0T2Zmc2V0OiBmdW5jdGlvbihjb250YWluZXIsIG9mZnNldCkge1xuICAgICAgaWYgKGNvbnRhaW5lci5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA9PT0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjb250YWluZXIuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gY29udGFpbmVyLmNoaWxkTm9kZXNbb2Zmc2V0XSA9PT0gY29udGFpbmVyLmZpcnN0Q2hpbGQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzRW5kT2Zmc2V0OiBmdW5jdGlvbihjb250YWluZXIsIG9mZnNldCkge1xuICAgICAgaWYgKGNvbnRhaW5lci5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA9PT0gY29udGFpbmVyLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjb250YWluZXIuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2UgaWYgKG9mZnNldCA+IDApXG4gICAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5jaGlsZE5vZGVzW29mZnNldCAtIDFdID09PSBjb250YWluZXIubGFzdENoaWxkO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc1RleHRFbmRPZkhvc3Q6IGZ1bmN0aW9uKGhvc3QsIGNvbnRhaW5lciwgb2Zmc2V0KSB7XG4gICAgICBpZiAoY29udGFpbmVyID09PSBob3N0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzVGV4dEVuZE9mZnNldChjb250YWluZXIsIG9mZnNldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzVGV4dEVuZE9mZnNldChjb250YWluZXIsIG9mZnNldCkpIHtcbiAgICAgICAgdmFyIHBhcmVudENvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBwbHVzIG9uZSBzaW11bGF0ZXMgYSByYW5nZSBvZmZzZXRcbiAgICAgICAgLy8gcmlnaHQgYWZ0ZXIgdGhlIGVsZW1lbnQuXG4gICAgICAgIHZhciBvZmZzZXRJblBhcmVudCA9IHRoaXMuZ2V0Tm9kZUluZGV4KGNvbnRhaW5lcikgKyAxO1xuICAgICAgICByZXR1cm4gdGhpcy5pc1RleHRFbmRPZkhvc3QoaG9zdCwgcGFyZW50Q29udGFpbmVyLCBvZmZzZXRJblBhcmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzVGV4dEVuZE9mZnNldDogZnVuY3Rpb24oY29udGFpbmVyLCBvZmZzZXQpIHtcbiAgICAgIGlmIChjb250YWluZXIubm9kZVR5cGUgPT09IG5vZGVUeXBlLnRleHROb2RlKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gc3RyaW5nLnRyaW1SaWdodChjb250YWluZXIubm9kZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG9mZnNldCA+PSB0ZXh0Lmxlbmd0aDtcbiAgICAgIH0gZWxzZSBpZiAoY29udGFpbmVyLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxhc3RPZmZzZXQgPSB0aGlzLmxhc3RPZmZzZXRXaXRoQ29udGVudChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gb2Zmc2V0ID49IGxhc3RPZmZzZXQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzU2FtZU5vZGU6IGZ1bmN0aW9uKHRhcmdldCwgc291cmNlKSB7XG4gICAgICB2YXIgaSwgbGVuLCBhdHRyO1xuXG4gICAgICBpZiAodGFyZ2V0Lm5vZGVUeXBlICE9PSBzb3VyY2Uubm9kZVR5cGUpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSAhPT0gc291cmNlLm5vZGVOYW1lKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHRhcmdldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKcKge1xuICAgICAgICBhdHRyID0gdGFyZ2V0LmF0dHJpYnV0ZXNbaV07XG4gICAgICAgIGlmIChzb3VyY2UuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSkgIT09IGF0dHIudmFsdWUpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBkZWVwZXN0IGxhc3QgY2hpbGQgb2YgYSBub2RlLlxuICAgICAqXG4gICAgICogQG1ldGhvZCAgbGF0ZXN0Q2hpbGRcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIFRoZSBjb250YWluZXIgdG8gaXRlcmF0ZSBvbi5cbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gICAgICAgICAgIFRIZSBkZWVwZXN0IGxhc3QgY2hpbGQgaW4gdGhlIGNvbnRhaW5lci5cbiAgICAgKi9cbiAgICBsYXRlc3RDaGlsZDogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICBpZiAoY29udGFpbmVyLmxhc3RDaGlsZClcbiAgICAgICAgcmV0dXJuIHRoaXMubGF0ZXN0Q2hpbGQoY29udGFpbmVyLmxhc3RDaGlsZCk7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIGRvY3VtZW50RnJhZ21lbnQgaGFzIG5vIGNoaWxkcmVuLlxuICAgICAqIEZyYWdtZW50cyB3aXRob3V0IGNoaWxkcmVuIGNhbiBjYXVzZSBlcnJvcnMgaWYgaW5zZXJ0ZWQgaW50byByYW5nZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kICBpc0RvY3VtZW50RnJhZ21lbnRXaXRob3V0Q2hpbGRyZW5cbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gRE9NIG5vZGUuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0RvY3VtZW50RnJhZ21lbnRXaXRob3V0Q2hpbGRyZW46IGZ1bmN0aW9uKGZyYWdtZW50KSB7XG4gICAgICBpZiAoZnJhZ21lbnQgJiZcbiAgICAgICAgICBmcmFnbWVudC5ub2RlVHlwZSA9PT0gbm9kZVR5cGUuZG9jdW1lbnRGcmFnbWVudE5vZGUgJiZcbiAgICAgICAgICBmcmFnbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIGFuIGVsZW1lbnQgYmVoYXZlcyBsaWtlIGFuIGlubGluZSBlbGVtZW50LlxuICAgICAqL1xuICAgIGlzSW5saW5lRWxlbWVudDogZnVuY3Rpb24od2luZG93LCBlbGVtZW50KSB7XG4gICAgICB2YXIgc3R5bGVzID0gZWxlbWVudC5jdXJyZW50U3R5bGUgfHwgd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgJycpO1xuICAgICAgdmFyIGRpc3BsYXkgPSBzdHlsZXMuZGlzcGxheTtcbiAgICAgIHN3aXRjaCAoZGlzcGxheSkge1xuICAgICAgY2FzZSAnaW5saW5lJzpcbiAgICAgIGNhc2UgJ2lubGluZS1ibG9jayc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pKCk7XG4iLCJ2YXIgQ3Vyc29yID0gcmVxdWlyZSgnLi9jdXJzb3InKTtcbnZhciBTZWxlY3Rpb24gPSByZXF1aXJlKCcuL3NlbGVjdGlvbicpO1xuXG4vKiogUmFuZ2VDb250YWluZXJcbiAqXG4gKiBwcmltYXJpbHkgdXNlZCB0byBjb21wYXJlIHJhbmdlc1xuICogaXRzIGRlc2lnbmVkIHRvIHdvcmsgd2l0aCB1bmRlZmluZWQgcmFuZ2VzIGFzIHdlbGxcbiAqIHNvIHdlIGNhbiBlYXNpbHkgY29tcGFyZSB0aGVtIHdpdGhvdXQgY2hlY2tpbmcgZm9yIHVuZGVmaW5lZFxuICogYWxsIHRoZSB0aW1lXG4gKi9cbnZhciBSYW5nZUNvbnRhaW5lcjtcbm1vZHVsZS5leHBvcnRzID0gUmFuZ2VDb250YWluZXIgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QsIHJhbmd5UmFuZ2UpIHtcbiAgdGhpcy5ob3N0ID0gZWRpdGFibGVIb3N0ICYmIGVkaXRhYmxlSG9zdC5qcXVlcnkgP1xuICAgIGVkaXRhYmxlSG9zdFswXSA6XG4gICAgZWRpdGFibGVIb3N0O1xuICB0aGlzLnJhbmdlID0gcmFuZ3lSYW5nZTtcbiAgdGhpcy5pc0FueXRoaW5nU2VsZWN0ZWQgPSAocmFuZ3lSYW5nZSAhPT0gdW5kZWZpbmVkKTtcbiAgdGhpcy5pc0N1cnNvciA9ICh0aGlzLmlzQW55dGhpbmdTZWxlY3RlZCAmJiByYW5neVJhbmdlLmNvbGxhcHNlZCk7XG4gIHRoaXMuaXNTZWxlY3Rpb24gPSAodGhpcy5pc0FueXRoaW5nU2VsZWN0ZWQgJiYgIXRoaXMuaXNDdXJzb3IpO1xufTtcblxuUmFuZ2VDb250YWluZXIucHJvdG90eXBlLmdldEN1cnNvciA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5pc0N1cnNvcikge1xuICAgIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gIH1cbn07XG5cblJhbmdlQ29udGFpbmVyLnByb3RvdHlwZS5nZXRTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLmhvc3QsIHRoaXMucmFuZ2UpO1xuICB9XG59O1xuXG5SYW5nZUNvbnRhaW5lci5wcm90b3R5cGUuZm9yY2VDdXJzb3IgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuaXNTZWxlY3Rpb24pIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICByZXR1cm4gc2VsZWN0aW9uLmRlbGV0ZUNvbnRlbnQoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDdXJzb3IoKTtcbiAgfVxufTtcblxuUmFuZ2VDb250YWluZXIucHJvdG90eXBlLmlzRGlmZmVyZW50RnJvbSA9IGZ1bmN0aW9uKG90aGVyUmFuZ2VDb250YWluZXIpIHtcbiAgb3RoZXJSYW5nZUNvbnRhaW5lciA9IG90aGVyUmFuZ2VDb250YWluZXIgfHwgbmV3IFJhbmdlQ29udGFpbmVyKCk7XG4gIHZhciBzZWxmID0gdGhpcy5yYW5nZTtcbiAgdmFyIG90aGVyID0gb3RoZXJSYW5nZUNvbnRhaW5lci5yYW5nZTtcbiAgaWYgKHNlbGYgJiYgb3RoZXIpIHtcbiAgICByZXR1cm4gIXNlbGYuZXF1YWxzKG90aGVyKTtcbiAgfSBlbHNlIGlmICghc2VsZiAmJiAhb3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbiIsInZhciByYW5neSA9IHJlcXVpcmUoJ3Jhbmd5Jyk7XG52YXIgZXJyb3IgPSByZXF1aXJlKCcuL3V0aWwvZXJyb3InKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG5cbi8qKlxuICogSW5zcGlyZWQgYnkgdGhlIFNlbGVjdGlvbiBzYXZlIGFuZCByZXN0b3JlIG1vZHVsZSBmb3IgUmFuZ3kgYnkgVGltIERvd25cbiAqIFNhdmVzIGFuZCByZXN0b3JlcyByYW5nZXMgdXNpbmcgaW52aXNpYmxlIG1hcmtlciBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGJvdW5kYXJ5TWFya2VySWQgPSAwO1xuXG4gIC8vIChVK0ZFRkYpIHplcm8gd2lkdGggbm8tYnJlYWsgc3BhY2VcbiAgdmFyIG1hcmtlclRleHRDaGFyID0gJ1xcdWZlZmYnO1xuXG4gIHZhciBnZXRNYXJrZXIgPSBmdW5jdGlvbihob3N0LCBpZCkge1xuICAgIHJldHVybiBob3N0LnF1ZXJ5U2VsZWN0b3IoJyMnKyBpZCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcblxuICAgIGluc2VydFJhbmdlQm91bmRhcnlNYXJrZXI6IGZ1bmN0aW9uKHJhbmdlLCBhdFN0YXJ0KSB7XG4gICAgICB2YXIgbWFya2VySWQgPSAnZWRpdGFibGUtcmFuZ2UtYm91bmRhcnktJyArIChib3VuZGFyeU1hcmtlcklkICs9IDEpO1xuICAgICAgdmFyIG1hcmtlckVsO1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuXG4gICAgICAvLyBJZiBvd25lckRvY3VtZW50IGlzIG51bGwgdGhlIGNvbW1vbkFuY2VzdG9yQ29udGFpbmVyIGlzIHdpbmRvdy5kb2N1bWVudFxuICAgICAgaWYgKGNvbnRhaW5lci5vd25lckRvY3VtZW50ID09PSBudWxsIHx8IGNvbnRhaW5lci5vd25lckRvY3VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZXJyb3IoJ0Nhbm5vdCBzYXZlIHJhbmdlOiByYW5nZSBpcyBlbXRweScpO1xuICAgICAgfVxuICAgICAgdmFyIGRvYyA9IGNvbnRhaW5lci5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LmRvY3VtZW50O1xuXG4gICAgICAvLyBDbG9uZSB0aGUgUmFuZ2UgYW5kIGNvbGxhcHNlIHRvIHRoZSBhcHByb3ByaWF0ZSBib3VuZGFyeSBwb2ludFxuICAgICAgdmFyIGJvdW5kYXJ5UmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICBib3VuZGFyeVJhbmdlLmNvbGxhcHNlKGF0U3RhcnQpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIG1hcmtlciBlbGVtZW50IGNvbnRhaW5pbmcgYSBzaW5nbGUgaW52aXNpYmxlIGNoYXJhY3RlciB1c2luZyBET00gbWV0aG9kcyBhbmQgaW5zZXJ0IGl0XG4gICAgICBtYXJrZXJFbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICBtYXJrZXJFbC5pZCA9IG1hcmtlcklkO1xuICAgICAgbWFya2VyRWwuc2V0QXR0cmlidXRlKCdkYXRhLWVkaXRhYmxlJywgJ3JlbW92ZScpO1xuICAgICAgbWFya2VyRWwuc3R5bGUubGluZUhlaWdodCA9ICcwJztcbiAgICAgIG1hcmtlckVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBtYXJrZXJFbC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUobWFya2VyVGV4dENoYXIpKTtcblxuICAgICAgYm91bmRhcnlSYW5nZS5pbnNlcnROb2RlKG1hcmtlckVsKTtcbiAgICAgIHJldHVybiBtYXJrZXJFbDtcbiAgICB9LFxuXG4gICAgc2V0UmFuZ2VCb3VuZGFyeTogZnVuY3Rpb24oaG9zdCwgcmFuZ2UsIG1hcmtlcklkLCBhdFN0YXJ0KSB7XG4gICAgICB2YXIgbWFya2VyRWwgPSBnZXRNYXJrZXIoaG9zdCwgbWFya2VySWQpO1xuICAgICAgaWYgKG1hcmtlckVsKSB7XG4gICAgICAgIHJhbmdlW2F0U3RhcnQgPyAnc2V0U3RhcnRCZWZvcmUnIDogJ3NldEVuZEJlZm9yZSddKG1hcmtlckVsKTtcbiAgICAgICAgbWFya2VyRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtYXJrZXJFbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnTWFya2VyIGVsZW1lbnQgaGFzIGJlZW4gcmVtb3ZlZC4gQ2Fubm90IHJlc3RvcmUgc2VsZWN0aW9uLicpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzYXZlOiBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgdmFyIHJhbmdlSW5mbywgc3RhcnRFbCwgZW5kRWw7XG5cbiAgICAgIC8vIGluc2VydCBtYXJrZXJzXG4gICAgICBpZiAocmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICAgIGVuZEVsID0gdGhpcy5pbnNlcnRSYW5nZUJvdW5kYXJ5TWFya2VyKHJhbmdlLCBmYWxzZSk7XG4gICAgICAgIHJhbmdlSW5mbyA9IHtcbiAgICAgICAgICBtYXJrZXJJZDogZW5kRWwuaWQsXG4gICAgICAgICAgY29sbGFwc2VkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmRFbCA9IHRoaXMuaW5zZXJ0UmFuZ2VCb3VuZGFyeU1hcmtlcihyYW5nZSwgZmFsc2UpO1xuICAgICAgICBzdGFydEVsID0gdGhpcy5pbnNlcnRSYW5nZUJvdW5kYXJ5TWFya2VyKHJhbmdlLCB0cnVlKTtcblxuICAgICAgICByYW5nZUluZm8gPSB7XG4gICAgICAgICAgc3RhcnRNYXJrZXJJZDogc3RhcnRFbC5pZCxcbiAgICAgICAgICBlbmRNYXJrZXJJZDogZW5kRWwuaWQsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBBZGp1c3QgZWFjaCByYW5nZSdzIGJvdW5kYXJpZXMgdG8gbGllIGJldHdlZW4gaXRzIG1hcmtlcnNcbiAgICAgIGlmIChyYW5nZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgcmFuZ2UuY29sbGFwc2VCZWZvcmUoZW5kRWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmFuZ2Uuc2V0RW5kQmVmb3JlKGVuZEVsKTtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihzdGFydEVsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJhbmdlSW5mbztcbiAgICB9LFxuXG4gICAgcmVzdG9yZTogZnVuY3Rpb24oaG9zdCwgcmFuZ2VJbmZvKSB7XG4gICAgICBpZiAocmFuZ2VJbmZvLnJlc3RvcmVkKSByZXR1cm47XG5cbiAgICAgIHZhciByYW5nZSA9IHJhbmd5LmNyZWF0ZVJhbmdlKCk7XG4gICAgICBpZiAocmFuZ2VJbmZvLmNvbGxhcHNlZCkge1xuICAgICAgICB2YXIgbWFya2VyRWwgPSBnZXRNYXJrZXIoaG9zdCwgcmFuZ2VJbmZvLm1hcmtlcklkKTtcbiAgICAgICAgaWYgKG1hcmtlckVsKSB7XG4gICAgICAgICAgbWFya2VyRWwuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgICAgICAgIHZhciBwcmV2aW91c05vZGUgPSBtYXJrZXJFbC5wcmV2aW91c1NpYmxpbmc7XG5cbiAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciByYW5neSBpc3N1ZSAxN1xuICAgICAgICAgIGlmIChwcmV2aW91c05vZGUgJiYgcHJldmlvdXNOb2RlLm5vZGVUeXBlID09PSBub2RlVHlwZS50ZXh0Tm9kZSkge1xuICAgICAgICAgICAgbWFya2VyRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtYXJrZXJFbCk7XG4gICAgICAgICAgICByYW5nZS5jb2xsYXBzZVRvUG9pbnQocHJldmlvdXNOb2RlLCBwcmV2aW91c05vZGUubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2VCZWZvcmUobWFya2VyRWwpO1xuICAgICAgICAgICAgbWFya2VyRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtYXJrZXJFbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdNYXJrZXIgZWxlbWVudCBoYXMgYmVlbiByZW1vdmVkLiBDYW5ub3QgcmVzdG9yZSBzZWxlY3Rpb24uJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0UmFuZ2VCb3VuZGFyeShob3N0LCByYW5nZSwgcmFuZ2VJbmZvLnN0YXJ0TWFya2VySWQsIHRydWUpO1xuICAgICAgICB0aGlzLnNldFJhbmdlQm91bmRhcnkoaG9zdCwgcmFuZ2UsIHJhbmdlSW5mby5lbmRNYXJrZXJJZCwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICByYW5nZS5ub3JtYWxpemVCb3VuZGFyaWVzKCk7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfVxuICB9O1xufSkoKTtcbiIsInZhciByYW5neSA9IHJlcXVpcmUoJ3Jhbmd5Jyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBSYW5nZUNvbnRhaW5lciA9IHJlcXVpcmUoJy4vcmFuZ2UtY29udGFpbmVyJyk7XG52YXIgQ3Vyc29yID0gcmVxdWlyZSgnLi9jdXJzb3InKTtcbnZhciBTZWxlY3Rpb24gPSByZXF1aXJlKCcuL3NlbGVjdGlvbicpO1xuXG4vKipcbiAqIFRoZSBTZWxlY3Rpb25XYXRjaGVyIG1vZHVsZSB3YXRjaGVzIGZvciBzZWxlY3Rpb24gY2hhbmdlcyBpbnNpZGVcbiAqIG9mIGVkaXRhYmxlIGJsb2Nrcy5cbiAqXG4gKiBAbW9kdWxlIGNvcmVcbiAqIEBzdWJtb2R1bGUgc2VsZWN0aW9uV2F0Y2hlclxuICovXG5cbnZhciBTZWxlY3Rpb25XYXRjaGVyO1xubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25XYXRjaGVyID0gZnVuY3Rpb24oZGlzcGF0Y2hlciwgd2luKSB7XG4gIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gIHRoaXMud2luID0gd2luIHx8IHdpbmRvdztcbiAgdGhpcy5yYW5neVNlbGVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gdW5kZWZpbmVkO1xuICB0aGlzLmN1cnJlbnRSYW5nZSA9IHVuZGVmaW5lZDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm4gYSBSYW5nZUNvbnRhaW5lciBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgd2l0aGluIGFuIGVkaXRhYmxlXG4gKiBvdGhlcndpc2UgcmV0dXJuIGFuIGVtcHR5IFJhbmdlQ29udGFpbmVyXG4gKi9cblNlbGVjdGlvbldhdGNoZXIucHJvdG90eXBlLmdldFJhbmdlQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmFuZ3lTZWxlY3Rpb24gPSByYW5neS5nZXRTZWxlY3Rpb24odGhpcy53aW4pO1xuXG4gIC8vIHJhbmdlQ291bnQgaXMgMCBvciAxIGluIGFsbCBicm93c2VycyBleGNlcHQgZmlyZWZveFxuICAvLyBmaXJlZm94IGNhbiB3b3JrIHdpdGggbXVsdGlwbGUgcmFuZ2VzXG4gIC8vIChvbiBhIG1hYyBob2xkIGRvd24gdGhlIGNvbW1hbmQga2V5IHRvIHNlbGVjdCBtdWx0aXBsZSByYW5nZXMpXG4gIGlmICh0aGlzLnJhbmd5U2VsZWN0aW9uLnJhbmdlQ291bnQpIHtcbiAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmd5U2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG4gICAgdmFyIGhvc3ROb2RlID0gcGFyc2VyLmdldEhvc3QocmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuICAgIGlmIChob3N0Tm9kZSkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZUNvbnRhaW5lcihob3N0Tm9kZSwgcmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiBhbiBlbXB0eSByYW5nZSBjb250YWluZXJcbiAgcmV0dXJuIG5ldyBSYW5nZUNvbnRhaW5lcigpO1xufTtcblxuXG4vKipcbiAqIEdldHMgYSBmcmVzaCBSYW5nZUNvbnRhaW5lciB3aXRoIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBvciBjdXJzb3IuXG4gKlxuICogQHJldHVybiBSYW5nZUNvbnRhaW5lciBpbnN0YW5jZVxuICovXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5nZXRGcmVzaFJhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmdldFJhbmdlQ29udGFpbmVyKCk7XG59O1xuXG5cbi8qKlxuICogR2V0cyBhIGZyZXNoIFJhbmdlQ29udGFpbmVyIHdpdGggdGhlIGN1cnJlbnQgc2VsZWN0aW9uIG9yIGN1cnNvci5cbiAqXG4gKiBAcmV0dXJuIEVpdGhlciBhIEN1cnNvciBvciBTZWxlY3Rpb24gaW5zdGFuY2Ugb3IgdW5kZWZpbmVkIGlmXG4gKiB0aGVyZSBpcyBuZWl0aGVyIGEgc2VsZWN0aW9uIG9yIGN1cnNvci5cbiAqL1xuU2VsZWN0aW9uV2F0Y2hlci5wcm90b3R5cGUuZ2V0RnJlc2hTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJhbmdlID0gdGhpcy5nZXRSYW5nZUNvbnRhaW5lcigpO1xuXG4gIHJldHVybiByYW5nZS5pc0N1cnNvciA/XG4gICAgcmFuZ2UuZ2V0Q3Vyc29yKHRoaXMud2luKSA6XG4gICAgcmFuZ2UuZ2V0U2VsZWN0aW9uKHRoaXMud2luKTtcbn07XG5cblxuLyoqXG4gKiBHZXQgdGhlIHNlbGVjdGlvbiBzZXQgYnkgdGhlIGxhc3Qgc2VsZWN0aW9uQ2hhbmdlZCBldmVudC5cbiAqIFNvbWV0aW1lcyB0aGUgZXZlbnQgZG9lcyBub3QgZmlyZSBmYXN0IGVub3VnaCBhbmQgdGhlIHNlbGVjaXRvblxuICogeW91IGdldCBpcyBub3QgdGhlIG9uZSB0aGUgdXNlciBzZWVzLlxuICogSW4gdGhvc2UgY2FzZXMgdXNlICNnZXRGcmVzaFNlbGVjdGlvbigpXG4gKlxuICogQHJldHVybiBFaXRoZXIgYSBDdXJzb3Igb3IgU2VsZWN0aW9uIGluc3RhbmNlIG9yIHVuZGVmaW5lZCBpZlxuICogdGhlcmUgaXMgbmVpdGhlciBhIHNlbGVjdGlvbiBvciBjdXJzb3IuXG4gKi9cblNlbGVjdGlvbldhdGNoZXIucHJvdG90eXBlLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50U2VsZWN0aW9uO1xufTtcblxuXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5mb3JjZUN1cnNvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmFuZ2UgPSB0aGlzLmdldFJhbmdlQ29udGFpbmVyKCk7XG4gIHJldHVybiByYW5nZS5mb3JjZUN1cnNvcigpO1xufTtcblxuXG5TZWxlY3Rpb25XYXRjaGVyLnByb3RvdHlwZS5zZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuZXdSYW5nZSA9IHRoaXMuZ2V0UmFuZ2VDb250YWluZXIoKTtcbiAgaWYgKG5ld1JhbmdlLmlzRGlmZmVyZW50RnJvbSh0aGlzLmN1cnJlbnRSYW5nZSkpIHtcbiAgICB2YXIgbGFzdFNlbGVjdGlvbiA9IHRoaXMuY3VycmVudFNlbGVjdGlvbjtcbiAgICB0aGlzLmN1cnJlbnRSYW5nZSA9IG5ld1JhbmdlO1xuXG4gICAgLy8gZW1wdHkgc2VsZWN0aW9uIG9yIGN1cnNvclxuICAgIGlmIChsYXN0U2VsZWN0aW9uKSB7XG4gICAgICBpZiAobGFzdFNlbGVjdGlvbi5pc0N1cnNvciAmJiAhdGhpcy5jdXJyZW50UmFuZ2UuaXNDdXJzb3IpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnY3Vyc29yJywgbGFzdFNlbGVjdGlvbi5ob3N0KTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNlbGVjdGlvbi5pc1NlbGVjdGlvbiAmJiAhdGhpcy5jdXJyZW50UmFuZ2UuaXNTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnc2VsZWN0aW9uJywgbGFzdFNlbGVjdGlvbi5ob3N0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzZXQgbmV3IHNlbGVjdGlvbiBvciBjdXJzb3IgYW5kIGZpcmUgZXZlbnRcbiAgICBpZiAodGhpcy5jdXJyZW50UmFuZ2UuaXNDdXJzb3IpIHtcbiAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IG5ldyBDdXJzb3IodGhpcy5jdXJyZW50UmFuZ2UuaG9zdCwgdGhpcy5jdXJyZW50UmFuZ2UucmFuZ2UpO1xuICAgICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeSgnY3Vyc29yJywgdGhpcy5jdXJyZW50U2VsZWN0aW9uLmhvc3QsIHRoaXMuY3VycmVudFNlbGVjdGlvbik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRSYW5nZS5pc1NlbGVjdGlvbikge1xuICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gbmV3IFNlbGVjdGlvbih0aGlzLmN1cnJlbnRSYW5nZS5ob3N0LCB0aGlzLmN1cnJlbnRSYW5nZS5yYW5nZSk7XG4gICAgICB0aGlzLmRpc3BhdGNoZXIubm90aWZ5KCdzZWxlY3Rpb24nLCB0aGlzLmN1cnJlbnRTZWxlY3Rpb24uaG9zdCwgdGhpcy5jdXJyZW50U2VsZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufTtcbiIsInZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgQ3Vyc29yID0gcmVxdWlyZSgnLi9jdXJzb3InKTtcbnZhciBjb250ZW50ID0gcmVxdWlyZSgnLi9jb250ZW50Jyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG4vKipcbiAqIFRoZSBTZWxlY3Rpb24gbW9kdWxlIHByb3ZpZGVzIGEgY3Jvc3MtYnJvd3NlciBhYnN0cmFjdGlvbiBsYXllciBmb3IgcmFuZ2VcbiAqIGFuZCBzZWxlY3Rpb24uXG4gKlxuICogQG1vZHVsZSBjb3JlXG4gKiBAc3VibW9kdWxlIHNlbGVjdGlvblxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIC8qKlxuICAgKiBDbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBzZWxlY3Rpb24gYW5kIHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgdG8gYWNjZXNzIG9yXG4gICAqIG1vZGlmeSB0aGUgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAY2xhc3MgU2VsZWN0aW9uXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgdmFyIFNlbGVjdGlvbiA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCwgcmFuZ3lSYW5nZSkge1xuICAgIHRoaXMuc2V0SG9zdChlZGl0YWJsZUhvc3QpO1xuICAgIHRoaXMucmFuZ2UgPSByYW5neVJhbmdlO1xuICAgIHRoaXMuaXNTZWxlY3Rpb24gPSB0cnVlO1xuICB9O1xuXG4gIC8vIGFkZCBDdXJzb3IgcHJvdG90cHllIHRvIFNlbGVjdGlvbiBwcm90b3R5cGUgY2hhaW5cbiAgdmFyIEJhc2UgPSBmdW5jdGlvbigpIHt9O1xuICBCYXNlLnByb3RvdHlwZSA9IEN1cnNvci5wcm90b3R5cGU7XG4gIFNlbGVjdGlvbi5wcm90b3R5cGUgPSAkLmV4dGVuZChuZXcgQmFzZSgpLCB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0ZXh0IGluc2lkZSB0aGUgc2VsZWN0aW9uLlxuICAgICAqXG4gICAgICogQG1ldGhvZCB0ZXh0XG4gICAgICovXG4gICAgdGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5yYW5nZS50b1N0cmluZygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGh0bWwgaW5zaWRlIHRoZSBzZWxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGh0bWxcbiAgICAgKi9cbiAgICBodG1sOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnJhbmdlLnRvSHRtbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBtZXRob2QgaXNBbGxTZWxlY3RlZFxuICAgICAqL1xuICAgIGlzQWxsU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBhcnNlci5pc0JlZ2lubmluZ09mSG9zdChcbiAgICAgICAgdGhpcy5ob3N0LFxuICAgICAgICB0aGlzLnJhbmdlLnN0YXJ0Q29udGFpbmVyLFxuICAgICAgICB0aGlzLnJhbmdlLnN0YXJ0T2Zmc2V0KSAmJlxuICAgICAgcGFyc2VyLmlzVGV4dEVuZE9mSG9zdChcbiAgICAgICAgdGhpcy5ob3N0LFxuICAgICAgICB0aGlzLnJhbmdlLmVuZENvbnRhaW5lcixcbiAgICAgICAgdGhpcy5yYW5nZS5lbmRPZmZzZXQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIENsaWVudFJlY3RzIG9mIHRoaXMgc2VsZWN0aW9uLlxuICAgICAqIFVzZSB0aGlzIGlmIHlvdSB3YW50IG1vcmUgcHJlY2lzaW9uIHRoYW4gZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGNhbiBnaXZlLlxuICAgICAqL1xuICAgIGdldFJlY3RzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb29yZHMgPSB0aGlzLnJhbmdlLm5hdGl2ZVJhbmdlLmdldENsaWVudFJlY3RzKCk7XG5cbiAgICAgIC8vIHRvZG86IHRyYW5zbGF0ZSBpbnRvIGFic29sdXRlIHBvc2l0aW9uc1xuICAgICAgLy8ganVzdCBsaWtlIEN1cnNvciNnZXRDb29yZGluYXRlcygpXG4gICAgICByZXR1cm4gY29vcmRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBtZXRob2QgbGlua1xuICAgICAqL1xuICAgIGxpbms6IGZ1bmN0aW9uKGhyZWYsIGF0dHJzKSB7XG4gICAgICB2YXIgJGxpbmsgPSAkKHRoaXMuY3JlYXRlRWxlbWVudCgnYScpKTtcbiAgICAgIGlmIChocmVmKSAkbGluay5hdHRyKCdocmVmJywgaHJlZik7XG4gICAgICBmb3IgKHZhciBuYW1lIGluIGF0dHJzKSB7XG4gICAgICAgICRsaW5rLmF0dHIobmFtZSwgYXR0cnNbbmFtZV0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmZvcmNlV3JhcCgkbGlua1swXSk7XG4gICAgfSxcblxuICAgIHVubGluazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlbW92ZUZvcm1hdHRpbmcoJ2EnKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlTGluazogZnVuY3Rpb24oaHJlZiwgYXR0cnMpIHtcbiAgICAgIHZhciBsaW5rcyA9IHRoaXMuZ2V0VGFnc0J5TmFtZSgnYScpO1xuICAgICAgaWYgKGxpbmtzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgIHZhciBmaXJzdExpbmsgPSBsaW5rc1swXTtcbiAgICAgICAgaWYgKHRoaXMuaXNFeGFjdFNlbGVjdGlvbihmaXJzdExpbmssICd2aXNpYmxlJykpIHtcbiAgICAgICAgICB0aGlzLnVubGluaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZXhwYW5kVG8oZmlyc3RMaW5rKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW5rKGhyZWYsIGF0dHJzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdG9nZ2xlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICBlbGVtID0gdGhpcy5hZG9wdEVsZW1lbnQoZWxlbSk7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC50b2dnbGVUYWcodGhpcy5ob3N0LCB0aGlzLnJhbmdlLCBlbGVtKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG1ldGhvZCBtYWtlQm9sZFxuICAgICAqL1xuICAgIG1ha2VCb2xkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2xkID0gdGhpcy5jcmVhdGVFbGVtZW50KGNvbmZpZy5ib2xkVGFnKTtcbiAgICAgIHRoaXMuZm9yY2VXcmFwKGJvbGQpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVCb2xkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2xkID0gdGhpcy5jcmVhdGVFbGVtZW50KGNvbmZpZy5ib2xkVGFnKTtcbiAgICAgIHRoaXMudG9nZ2xlKGJvbGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2l2ZUVtcGhhc2lzXG4gICAgICovXG4gICAgZ2l2ZUVtcGhhc2lzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbSA9IHRoaXMuY3JlYXRlRWxlbWVudChjb25maWcuaXRhbGljVGFnKTtcbiAgICAgIHRoaXMuZm9yY2VXcmFwKGVtKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlRW1waGFzaXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVtID0gdGhpcy5jcmVhdGVFbGVtZW50KGNvbmZpZy5pdGFsaWNUYWcpO1xuICAgICAgdGhpcy50b2dnbGUoZW0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdXJyb3VuZCB0aGUgc2VsZWN0aW9uIHdpdGggY2hhcmFjdGVycyBsaWtlIHF1b3Rlcy5cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgc3Vycm91bmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gRS5nLiAnwqsnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IEUuZy4gJ8K7J1xuICAgICAqL1xuICAgIHN1cnJvdW5kOiBmdW5jdGlvbihzdGFydENoYXJhY3RlciwgZW5kQ2hhcmFjdGVyKSB7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC5zdXJyb3VuZCh0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlU3Vycm91bmQ6IGZ1bmN0aW9uKHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpIHtcbiAgICAgIHRoaXMucmFuZ2UgPSBjb250ZW50LmRlbGV0ZUNoYXJhY3Rlcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIHN0YXJ0Q2hhcmFjdGVyKTtcbiAgICAgIHRoaXMucmFuZ2UgPSBjb250ZW50LmRlbGV0ZUNoYXJhY3Rlcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIGVuZENoYXJhY3Rlcik7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVTdXJyb3VuZDogZnVuY3Rpb24oc3RhcnRDaGFyYWN0ZXIsIGVuZENoYXJhY3Rlcikge1xuICAgICAgaWYgKHRoaXMuY29udGFpbnNTdHJpbmcoc3RhcnRDaGFyYWN0ZXIpICYmXG4gICAgICAgIHRoaXMuY29udGFpbnNTdHJpbmcoZW5kQ2hhcmFjdGVyKSkge1xuICAgICAgICB0aGlzLnJlbW92ZVN1cnJvdW5kKHN0YXJ0Q2hhcmFjdGVyLCBlbmRDaGFyYWN0ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdXJyb3VuZChzdGFydENoYXJhY3RlciwgZW5kQ2hhcmFjdGVyKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVGb3JtYXR0aW5nXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWUuIEUuZy4gJ2EnIHRvIHJlbW92ZSBhbGwgbGlua3MuXG4gICAgICovXG4gICAgcmVtb3ZlRm9ybWF0dGluZzogZnVuY3Rpb24odGFnTmFtZSkge1xuICAgICAgdGhpcy5yYW5nZSA9IGNvbnRlbnQucmVtb3ZlRm9ybWF0dGluZyh0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIHRhZ05hbWUpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIHRoZSBjb250ZW50cyBpbnNpZGUgdGhlIHJhbmdlLiBBZnRlciB0aGF0IHRoZSBzZWxlY3Rpb24gd2lsbCBiZSBhXG4gICAgICogY3Vyc29yLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBkZWxldGVDb250ZW50XG4gICAgICogQHJldHVybiBDdXJzb3IgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBkZWxldGVDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmFuZ2UuZGVsZXRlQ29udGVudHMoKTtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGV4cGFuZFRvXG4gICAgICogQHBhcmFtIHtET00gTm9kZX1cbiAgICAgKi9cbiAgICBleHBhbmRUbzogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgdGhpcy5yYW5nZSA9IGNvbnRlbnQuZXhwYW5kVG8odGhpcy5ob3N0LCB0aGlzLnJhbmdlLCBlbGVtKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqICBDb2xsYXBzZSB0aGUgc2VsZWN0aW9uIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlbGVjdGlvblxuICAgICAqXG4gICAgICogIEByZXR1cm4gQ3Vyc29yIGluc3RhbmNlXG4gICAgICovXG4gICAgY29sbGFwc2VBdEJlZ2lubmluZzogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgdGhpcy5yYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKCk7XG4gICAgICByZXR1cm4gbmV3IEN1cnNvcih0aGlzLmhvc3QsIHRoaXMucmFuZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiAgQ29sbGFwc2UgdGhlIHNlbGVjdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBzZWxlY3Rpb25cbiAgICAgKlxuICAgICAqICBAcmV0dXJuIEN1cnNvciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNvbGxhcHNlQXRFbmQ6IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHRoaXMucmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdyYXAgdGhlIHNlbGVjdGlvbiB3aXRoIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiBhbnkgb3RoZXIgdGFnIHdpdGhcbiAgICAgKiB0aGUgc2FtZSB0YWdOYW1lIGlzIGFmZmVjdGluZyB0aGUgc2VsZWN0aW9uIHRoaXMgdGFnIHdpbGwgYmVcbiAgICAgKiByZW1vdmUgZmlyc3QuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGZvcmNlV3JhcFxuICAgICAqL1xuICAgIGZvcmNlV3JhcDogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgZWxlbSA9IHRoaXMuYWRvcHRFbGVtZW50KGVsZW0pO1xuICAgICAgdGhpcy5yYW5nZSA9IGNvbnRlbnQuZm9yY2VXcmFwKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgZWxlbSk7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhZ3MgdGhhdCBhZmZlY3QgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLiBPcHRpb25hbGx5IHBhc3MgYVxuICAgICAqIG1ldGhvZCB0byBmaWx0ZXIgdGhlIHJldHVybmVkIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRUYWdzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbiBmaWx0ZXIobm9kZSl9IFtPcHRpb25hbF0gTWV0aG9kIHRvIGZpbHRlciB0aGUgcmV0dXJuZWRcbiAgICAgKiAgIERPTSBOb2Rlcy5cbiAgICAgKiBAcmV0dXJuIHtBcnJheSBvZiBET00gTm9kZXN9XG4gICAgICovXG4gICAgZ2V0VGFnczogZnVuY3Rpb24oZmlsdGVyRnVuYykge1xuICAgICAgcmV0dXJuIGNvbnRlbnQuZ2V0VGFncyh0aGlzLmhvc3QsIHRoaXMucmFuZ2UsIGZpbHRlckZ1bmMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhZ3Mgb2YgdGhlIHNwZWNpZmllZCB0eXBlIHRoYXQgYWZmZWN0IHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnc0J5TmFtZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWdOYW1lLiBFLmcuICdhJyB0byBnZXQgYWxsIGxpbmtzLlxuICAgICAqIEByZXR1cm4ge0FycmF5IG9mIERPTSBOb2Rlc31cbiAgICAgKi9cbiAgICBnZXRUYWdzQnlOYW1lOiBmdW5jdGlvbih0YWdOYW1lKSB7XG4gICAgICByZXR1cm4gY29udGVudC5nZXRUYWdzQnlOYW1lKHRoaXMuaG9zdCwgdGhpcy5yYW5nZSwgdGFnTmFtZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBzZWxlY3Rpb24gaXMgdGhlIHNhbWUgYXMgdGhlIGVsZW1lbnRzIGNvbnRlbnRzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBpc0V4YWN0U2VsZWN0aW9uXG4gICAgICogQHBhcmFtIHtET00gTm9kZX1cbiAgICAgKiBAcGFyYW0ge2ZsYWc6ICB1bmRlZmluZWQgb3IgJ3Zpc2libGUnfSBpZiAndmlzaWJsZScgaXMgcGFzc2VkXG4gICAgICogICB3aGl0ZXNwYWNlcyBhdCB0aGUgYmVnaW5uaW5nIG9yIGVuZCBvZiB0aGUgc2VsZWN0aW9uIHdpbGxcbiAgICAgKiAgIGJlIGlnbm9yZWQuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0V4YWN0U2VsZWN0aW9uOiBmdW5jdGlvbihlbGVtLCBvbmx5VmlzaWJsZSkge1xuICAgICAgcmV0dXJuIGNvbnRlbnQuaXNFeGFjdFNlbGVjdGlvbih0aGlzLnJhbmdlLCBlbGVtLCBvbmx5VmlzaWJsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBzZWxlY3Rpb24gY29udGFpbnMgdGhlIHBhc3NlZCBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGNvbnRhaW5zU3RyaW5nXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBjb250YWluc1N0cmluZzogZnVuY3Rpb24oc3RyKSB7XG4gICAgICByZXR1cm4gY29udGVudC5jb250YWluc1N0cmluZyh0aGlzLnJhbmdlLCBzdHIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYWxsIG9jY3VyZW5jZXMgb2YgdGhlIHNwZWNpZmllZCBjaGFyYWN0ZXIgZnJvbSB0aGVcbiAgICAgKiBzZWxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGRlbGV0ZUNoYXJhY3RlclxuICAgICAqL1xuICAgIGRlbGV0ZUNoYXJhY3RlcjogZnVuY3Rpb24oY2hhcmFjdGVyKSB7XG4gICAgICB0aGlzLnJhbmdlID0gY29udGVudC5kZWxldGVDaGFyYWN0ZXIodGhpcy5ob3N0LCB0aGlzLnJhbmdlLCBjaGFyYWN0ZXIpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTZWxlY3Rpb247XG59KSgpO1xuIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBjb250ZW50ID0gcmVxdWlyZSgnLi9jb250ZW50Jyk7XG52YXIgaGlnaGxpZ2h0VGV4dCA9IHJlcXVpcmUoJy4vaGlnaGxpZ2h0LXRleHQnKTtcbnZhciBub2RlVHlwZSA9IHJlcXVpcmUoJy4vbm9kZS10eXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIC8vIFVuaWNvZGUgY2hhcmFjdGVyIGJsb2NrcyBmb3IgbGV0dGVycy5cbiAgLy8gU2VlOiBodHRwOi8vanJncmFwaGl4Lm5ldC9yZXNlYXJjaC91bmljb2RlX2Jsb2Nrcy5waHBcbiAgLy9cbiAgLy8gXFxcXHUwMDQxLVxcXFx1MDA1QSAgICBBLVogKEJhc2ljIExhdGluKVxuICAvLyBcXFxcdTAwNjEtXFxcXHUwMDdBICAgIGEteiAoQmFzaWMgTGF0aW4pXG4gIC8vIFxcXFx1MDAzMC1cXFxcdTAwMzkgICAgMC05IChCYXNpYyBMYXRpbilcbiAgLy8gXFxcXHUwMEFBICAgICAgICAgICAgwqogICAoTGF0aW4tMSBTdXBwbGVtZW50KVxuICAvLyBcXFxcdTAwQjUgICAgICAgICAgICDCtSAgIChMYXRpbi0xIFN1cHBsZW1lbnQpXG4gIC8vIFxcXFx1MDBCQSAgICAgICAgICAgIMK6ICAgKExhdGluLTEgU3VwcGxlbWVudClcbiAgLy8gXFxcXHUwMEMwLVxcXFx1MDBENiAgICDDgC3DliAoTGF0aW4tMSBTdXBwbGVtZW50KVxuICAvLyBcXFxcdTAwRDgtXFxcXHUwMEY2ICAgIMOYLcO2IChMYXRpbi0xIFN1cHBsZW1lbnQpXG4gIC8vIFxcXFx1MDBGOC1cXFxcdTAwRkYgICAgw7gtw78gKExhdGluLTEgU3VwcGxlbWVudClcbiAgLy8gXFxcXHUwMTAwLVxcXFx1MDE3RiAgICDEgC3FvyAoTGF0aW4gRXh0ZW5kZWQtQSlcbiAgLy8gXFxcXHUwMTgwLVxcXFx1MDI0RiAgICDGgC3JjyAoTGF0aW4gRXh0ZW5kZWQtQilcbiAgdmFyIGxldHRlckNoYXJzID0gJ1xcXFx1MDA0MS1cXFxcdTAwNUFcXFxcdTAwNjEtXFxcXHUwMDdBXFxcXHUwMDMwLVxcXFx1MDAzOVxcXFx1MDBBQVxcXFx1MDBCNVxcXFx1MDBCQVxcXFx1MDBDMC1cXFxcdTAwRDZcXFxcdTAwRDgtXFxcXHUwMEY2XFxcXHUwMEY4LVxcXFx1MDBGRlxcXFx1MDEwMC1cXFxcdTAxN0ZcXFxcdTAxODAtXFxcXHUwMjRGJztcblxuICB2YXIgZXNjYXBlUmVnRXggPSBmdW5jdGlvbihzKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzKS5yZXBsYWNlKC8oWy4qKz9ePSE6JHt9KCl8W1xcXVxcL1xcXFxdKS9nLCAnXFxcXCQxJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNwZWxsY2hlY2sgY2xhc3MuXG4gICAqXG4gICAqIEBjbGFzcyBTcGVsbGNoZWNrXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgdmFyIFNwZWxsY2hlY2sgPSBmdW5jdGlvbihlZGl0YWJsZSwgY29uZmlndXJhdGlvbikge1xuICAgIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuICAgICAgY2hlY2tPbkZvY3VzOiBmYWxzZSwgLy8gY2hlY2sgb24gZm9jdXNcbiAgICAgIGNoZWNrT25DaGFuZ2U6IHRydWUsIC8vIGNoZWNrIGFmdGVyIGNoYW5nZXNcbiAgICAgIHRocm90dGxlOiAxMDAwLCAvLyB1bmJvdW5jZSByYXRlIGluIG1zIGJlZm9yZSBjYWxsaW5nIHRoZSBzcGVsbGNoZWNrIHNlcnZpY2UgYWZ0ZXIgY2hhbmdlc1xuICAgICAgcmVtb3ZlT25Db3JyZWN0aW9uOiB0cnVlLCAvLyByZW1vdmUgaGlnaGxpZ2h0cyBhZnRlciBhIGNoYW5nZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSBhIGhpZ2hsaWdodFxuICAgICAgbWFya2VyTm9kZTogJCgnPHNwYW4gY2xhc3M9XCJzcGVsbGNoZWNrXCI+PC9zcGFuPicpLFxuICAgICAgc3BlbGxjaGVja1NlcnZpY2U6IHVuZGVmaW5lZFxuICAgIH07XG5cbiAgICB0aGlzLmVkaXRhYmxlID0gZWRpdGFibGU7XG4gICAgdGhpcy53aW4gPSBlZGl0YWJsZS53aW47XG4gICAgdGhpcy5jb25maWcgPSAkLmV4dGVuZChkZWZhdWx0Q29uZmlnLCBjb25maWd1cmF0aW9uKTtcbiAgICB0aGlzLnByZXBhcmVNYXJrZXJOb2RlKCk7XG4gICAgdGhpcy5zZXR1cCgpO1xuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24oZWRpdGFibGUpIHtcbiAgICBpZiAodGhpcy5jb25maWcuY2hlY2tPbkZvY3VzKSB7XG4gICAgICB0aGlzLmVkaXRhYmxlLm9uKCdmb2N1cycsICQucHJveHkodGhpcywgJ29uRm9jdXMnKSk7XG4gICAgICB0aGlzLmVkaXRhYmxlLm9uKCdibHVyJywgJC5wcm94eSh0aGlzLCAnb25CbHVyJykpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jb25maWcuY2hlY2tPbkNoYW5nZSB8fCB0aGlzLmNvbmZpZy5yZW1vdmVPbkNvcnJlY3Rpb24pIHtcbiAgICAgIHRoaXMuZWRpdGFibGUub24oJ2NoYW5nZScsICQucHJveHkodGhpcywgJ29uQ2hhbmdlJykpO1xuICAgIH1cbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5vbkZvY3VzID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gICAgaWYgKHRoaXMuZm9jdXNlZEVkaXRhYmxlICE9PSBlZGl0YWJsZUhvc3QpIHtcbiAgICAgIHRoaXMuZm9jdXNlZEVkaXRhYmxlID0gZWRpdGFibGVIb3N0O1xuICAgICAgdGhpcy5lZGl0YWJsZUhhc0NoYW5nZWQoZWRpdGFibGVIb3N0KTtcbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUub25CbHVyID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gICAgaWYgKHRoaXMuZm9jdXNlZEVkaXRhYmxlID09PSBlZGl0YWJsZUhvc3QpIHtcbiAgICAgIHRoaXMuZm9jdXNlZEVkaXRhYmxlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5vbkNoYW5nZSA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5jaGVja09uQ2hhbmdlKSB7XG4gICAgICB0aGlzLmVkaXRhYmxlSGFzQ2hhbmdlZChlZGl0YWJsZUhvc3QsIHRoaXMuY29uZmlnLnRocm90dGxlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbW92ZU9uQ29ycmVjdGlvbikge1xuICAgICAgdGhpcy5yZW1vdmVIaWdobGlnaHRzQXRDdXJzb3IoZWRpdGFibGVIb3N0KTtcbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUucHJlcGFyZU1hcmtlck5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFya2VyID0gdGhpcy5jb25maWcubWFya2VyTm9kZTtcbiAgICBpZiAobWFya2VyLmpxdWVyeSkge1xuICAgICAgbWFya2VyID0gbWFya2VyWzBdO1xuICAgIH1cbiAgICBtYXJrZXIgPSBjb250ZW50LmFkb3B0RWxlbWVudChtYXJrZXIsIHRoaXMud2luLmRvY3VtZW50KTtcbiAgICB0aGlzLmNvbmZpZy5tYXJrZXJOb2RlID0gbWFya2VyO1xuXG4gICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnZGF0YS1lZGl0YWJsZScsICd1aS11bndyYXAnKTtcbiAgICBtYXJrZXIuc2V0QXR0cmlidXRlKCdkYXRhLXNwZWxsY2hlY2snLCAnc3BlbGxjaGVjaycpO1xuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLmNyZWF0ZU1hcmtlck5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcubWFya2VyTm9kZS5jbG9uZU5vZGUoKTtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5yZW1vdmVIaWdobGlnaHRzID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gICAgJChlZGl0YWJsZUhvc3QpLmZpbmQoJ1tkYXRhLXNwZWxsY2hlY2s9c3BlbGxjaGVja10nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtKSB7XG4gICAgICBjb250ZW50LnVud3JhcChlbGVtKTtcbiAgICB9KTtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5yZW1vdmVIaWdobGlnaHRzQXRDdXJzb3IgPSBmdW5jdGlvbihlZGl0YWJsZUhvc3QpIHtcbiAgICB2YXIgd29yZElkO1xuICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmVkaXRhYmxlLmdldFNlbGVjdGlvbihlZGl0YWJsZUhvc3QpO1xuICAgIGlmIChzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmlzQ3Vyc29yKSB7XG4gICAgICB2YXIgZWxlbWVudEF0Q3Vyc29yID0gc2VsZWN0aW9uLnJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgICAgaWYgKGVsZW1lbnRBdEN1cnNvci5ub2RlVHlwZSA9PT0gbm9kZVR5cGUudGV4dE5vZGUpIHtcbiAgICAgICAgZWxlbWVudEF0Q3Vyc29yID0gZWxlbWVudEF0Q3Vyc29yLnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGVsZW1lbnRBdEN1cnNvciA9PT0gZWRpdGFibGVIb3N0KSByZXR1cm47XG4gICAgICAgIGlmICggZWxlbWVudEF0Q3Vyc29yLmhhc0F0dHJpYnV0ZSgnZGF0YS13b3JkLWlkJykgKSB7XG4gICAgICAgICAgd29yZElkID0gZWxlbWVudEF0Q3Vyc29yLmdldEF0dHJpYnV0ZSgnZGF0YS13b3JkLWlkJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKCAoZWxlbWVudEF0Q3Vyc29yID0gZWxlbWVudEF0Q3Vyc29yLnBhcmVudE5vZGUpICk7XG5cbiAgICAgIGlmICh3b3JkSWQpIHtcbiAgICAgICAgc2VsZWN0aW9uLnJldGFpblZpc2libGVTZWxlY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJChlZGl0YWJsZUhvc3QpLmZpbmQoJ1tkYXRhLXdvcmQtaWQ9Jysgd29yZElkICsnXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW0pIHtcbiAgICAgICAgICAgIGNvbnRlbnQudW53cmFwKGVsZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUuY3JlYXRlUmVnZXggPSBmdW5jdGlvbih3b3Jkcykge1xuICAgIHZhciBlc2NhcGVkV29yZHMgPSAkLm1hcCh3b3JkcywgZnVuY3Rpb24od29yZCkge1xuICAgICAgcmV0dXJuIGVzY2FwZVJlZ0V4KHdvcmQpO1xuICAgIH0pO1xuXG4gICAgdmFyIHJlZ2V4ID0gJyc7XG4gICAgcmVnZXggKz0gJyhbXicgKyBsZXR0ZXJDaGFycyArICddfF4pJztcbiAgICByZWdleCArPSAnKCcgKyBlc2NhcGVkV29yZHMuam9pbignfCcpICsgJyknO1xuICAgIHJlZ2V4ICs9ICcoPz1bXicgKyBsZXR0ZXJDaGFycyArICddfCQpJztcblxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCAnZycpO1xuICB9O1xuXG4gIFNwZWxsY2hlY2sucHJvdG90eXBlLmhpZ2hsaWdodCA9IGZ1bmN0aW9uKGVkaXRhYmxlSG9zdCwgbWlzc3BlbGxlZFdvcmRzKSB7XG5cbiAgICAvLyBSZW1vdmUgb2xkIGhpZ2hsaWdodHNcbiAgICB0aGlzLnJlbW92ZUhpZ2hsaWdodHMoZWRpdGFibGVIb3N0KTtcblxuICAgIC8vIENyZWF0ZSBuZXcgaGlnaGxpZ2h0c1xuICAgIGlmIChtaXNzcGVsbGVkV29yZHMgJiYgbWlzc3BlbGxlZFdvcmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciByZWdleCA9IHRoaXMuY3JlYXRlUmVnZXgobWlzc3BlbGxlZFdvcmRzKTtcbiAgICAgIHZhciBzcGFuID0gdGhpcy5jcmVhdGVNYXJrZXJOb2RlKCk7XG4gICAgICBoaWdobGlnaHRUZXh0LmhpZ2hsaWdodChlZGl0YWJsZUhvc3QsIHJlZ2V4LCBzcGFuKTtcbiAgICB9XG4gIH07XG5cbiAgU3BlbGxjaGVjay5wcm90b3R5cGUuZWRpdGFibGVIYXNDaGFuZ2VkID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0LCB0aHJvdHRsZSkge1xuICAgIGlmICh0aGlzLnRpbWVvdXRJZCAmJiB0aGlzLmN1cnJlbnRFZGl0YWJsZUhvc3QgPT09IGVkaXRhYmxlSG9zdCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICB9XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdGhhdC5jaGVja1NwZWxsaW5nKGVkaXRhYmxlSG9zdCk7XG4gICAgICB0aGF0LmN1cnJlbnRFZGl0YWJsZUhvc3QgPSB1bmRlZmluZWQ7XG4gICAgICB0aGF0LnRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcbiAgICB9LCB0aHJvdHRsZSB8fCAwKTtcblxuICAgIHRoaXMuY3VycmVudEVkaXRhYmxlSG9zdCA9IGVkaXRhYmxlSG9zdDtcbiAgfTtcblxuICBTcGVsbGNoZWNrLnByb3RvdHlwZS5jaGVja1NwZWxsaW5nID0gZnVuY3Rpb24oZWRpdGFibGVIb3N0KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciB0ZXh0ID0gaGlnaGxpZ2h0VGV4dC5leHRyYWN0VGV4dChlZGl0YWJsZUhvc3QpO1xuICAgIHRleHQgPSBjb250ZW50Lm5vcm1hbGl6ZVdoaXRlc3BhY2UodGV4dCk7XG5cbiAgICB0aGlzLmNvbmZpZy5zcGVsbGNoZWNrU2VydmljZSh0ZXh0LCBmdW5jdGlvbihtaXNzcGVsbGVkV29yZHMpIHtcbiAgICAgIHZhciBzZWxlY3Rpb24gPSB0aGF0LmVkaXRhYmxlLmdldFNlbGVjdGlvbihlZGl0YWJsZUhvc3QpO1xuICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICBzZWxlY3Rpb24ucmV0YWluVmlzaWJsZVNlbGVjdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGF0LmhpZ2hsaWdodChlZGl0YWJsZUhvc3QsIG1pc3NwZWxsZWRXb3Jkcyk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhhdC5oaWdobGlnaHQoZWRpdGFibGVIb3N0LCBtaXNzcGVsbGVkV29yZHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTcGVsbGNoZWNrO1xufSkoKTtcbiIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcblxuLy8gQWxsb3dzIGZvciBzYWZlIGVycm9yIGxvZ2dpbmdcbi8vIEZhbGxzIGJhY2sgdG8gY29uc29sZS5sb2cgaWYgY29uc29sZS5lcnJvciBpcyBub3QgYXZhaWxhYmxlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoY29uZmlnLmxvZ0Vycm9ycyA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGFyZ3M7XG4gIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICBhcmdzID0gYXJnc1swXTtcbiAgfVxuXG4gIGlmICh3aW5kb3cuY29uc29sZSAmJiB0eXBlb2Ygd2luZG93LmNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY29uc29sZS5lcnJvcihhcmdzKTtcbiAgfSBlbHNlIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhhcmdzKTtcbiAgfVxufTtcbiIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcblxuLy8gQWxsb3dzIGZvciBzYWZlIGNvbnNvbGUgbG9nZ2luZ1xuLy8gSWYgdGhlIGxhc3QgcGFyYW0gaXMgdGhlIHN0cmluZyBcInRyYWNlXCIgY29uc29sZS50cmFjZSB3aWxsIGJlIGNhbGxlZFxuLy8gY29uZmlndXJhdGlvbjogZGlzYWJsZSB3aXRoIGNvbmZpZy5sb2cgPSBmYWxzZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGNvbmZpZy5sb2cgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuXG4gIHZhciBhcmdzLCBfcmVmO1xuICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgaWYgKGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ3RyYWNlJykge1xuICAgICAgYXJncy5wb3AoKTtcbiAgICAgIGlmICgoX3JlZiA9IHdpbmRvdy5jb25zb2xlKSA/IF9yZWYudHJhY2UgOiB2b2lkIDApIHtcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgIGFyZ3MgPSBhcmdzWzBdO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5jb25zb2xlKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKGFyZ3MpO1xuICB9XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgaHRtbENoYXJhY3RlcnMgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgICdcXCcnOiAnJiMzOTsnXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICB0cmltUmlnaHQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1xccyskLywgJycpO1xuICAgIH0sXG5cbiAgICB0cmltTGVmdDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvXlxccysvLCAnJyk7XG4gICAgfSxcblxuICAgIHRyaW06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICB9LFxuXG4gICAgaXNTdHJpbmc6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFR1cm4gYW55IHN0cmluZyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLlxuICAgICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIG9yIHJlcGxhY2UgYSBzdHJpbmcgY29udmVuaWVudGx5LlxuICAgICAqL1xuICAgIHJlZ2V4cDogZnVuY3Rpb24oc3RyLCBmbGFncykge1xuICAgICAgaWYgKCFmbGFncykgZmxhZ3MgPSAnZyc7XG4gICAgICB2YXIgZXNjYXBlZFN0ciA9IHN0ci5yZXBsYWNlKC9bLVtcXF17fSgpKis/LixcXFxcXiR8I1xcc10vZywgJ1xcXFwkJicpO1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoZXNjYXBlZFN0ciwgZmxhZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFc2NhcGUgSFRNTCBjaGFyYWN0ZXJzIDwsID4gYW5kICZcbiAgICAgKiBVc2FnZTogZXNjYXBlSHRtbCgnPGRpdj4nKTtcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7IFN0cmluZyB9XG4gICAgICogQHBhcmFtIHsgQm9vbGVhbiB9IE9wdGlvbmFsLiBJZiB0cnVlIFwiIGFuZCAnIHdpbGwgYWxzbyBiZSBlc2NhcGVkLlxuICAgICAqIEByZXR1cm4geyBTdHJpbmcgfSBFc2NhcGVkIEh0bWwgeW91IGNhbiBhc3NpZ24gdG8gaW5uZXJIVE1MIG9mIGFuIGVsZW1lbnQuXG4gICAgICovXG4gICAgZXNjYXBlSHRtbDogZnVuY3Rpb24ocywgZm9yQXR0cmlidXRlKSB7XG4gICAgICByZXR1cm4gcy5yZXBsYWNlKGZvckF0dHJpYnV0ZSA/IC9bJjw+J1wiXS9nIDogL1smPD5dL2csIGZ1bmN0aW9uKGMpIHsgLy8gXCInXG4gICAgICAgIHJldHVybiBodG1sQ2hhcmFjdGVyc1tjXTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFc2NhcGUgYSBzdHJpbmcgdGhlIGJyb3dzZXIgd2F5LlxuICAgICAqL1xuICAgIGJyb3dzZXJFc2NhcGVIdG1sOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIpKTtcbiAgICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJhbmd5O1xuIl19

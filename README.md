# editable.js
[![Build Status](https://travis-ci.org/upfrontIO/editable.js.svg?branch=master)](https://travis-ci.org/upfrontIO/editable.js)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Dependency Status](https://david-dm.org/upfrontIO/editable.js/master.svg)](https://david-dm.org/upfrontIO/editable.js/master)
[![devDependency Status](https://david-dm.org/upfrontIO/editable.js/master/dev-status.svg)](https://david-dm.org/upfrontIO/editable.js/master#info=devDependencies)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![NPM](https://nodei.co/npm/upfront-editable.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/upfront-editable/)


## What is it about?

A JavaScript API that defines a friendly and browser-consistent content editable interface.

Editable is built for block level elements containing only phrasing content. This normally means `p`, `h1`-`h6`, `blockquote` etc. elements. This allows editable to be lean and mean since it is only concerned with formatting and not with layouting.

We made editable.js to support our vision of online document editing. Have a look at [livingdocs.io](http://livingdocs.io/).

## Installation

Via npm:

```shell
npm install --save upfront-editable jquery
```

jQuery is a peerDependency, so you need to install it alongside editable.js. You can either `require('upfront-editable')` or find a prebuilt file in the npm bundle `dist/editable.js`. The required module will automatically pick up your `jQuery`, while the built version expects it as a global variable.

## Plnkr Demo

You can check out a [simple demo on the website](https://upfrontio.github.io/editable.js/). It features a formatting toolbar and the default insert, split and merge behavior that allow to add and remove content blocks like paragraphs easily.


## Events Overview

- **focus**  
  Fired when an editable element gets focus.
- **blur**  
  Fired when an editable element loses focus.
- **selection**  
  Fired when the user selects some text inside an editable element.
- **cursor**  
  Fired when the cursor position changes.
- **change**  
  Fired when the user has made a change.
- **clipboard**  
  Fired for `copy`, `cut` and `paste` events.
- **insert**  
  Fired when the user presses `ENTER` at the beginning or end of an editable (For example you can insert a new paragraph after the element if this happens).
- **split**  
  Fired when the user presses `ENTER` in the middle of an element.
- **merge**  
  Fired when the user pressed `FORWARD DELETE` at the end or `BACKSPACE` at the beginning of an element.
- **switch**  
  Fired when the user pressed an `ARROW KEY` at the top or bottom so that you may want to set the cursor into the preceding or following element.
- **newline**  
  Fired when the user presses `SHIFT+ENTER` to insert a newline.


## How to use

To make an element editable:

```javascript
var editable = new Editable()
editable.add($elem)
```

#### Example for Selection Changes

In a `selection` event you get the editable element that triggered the event as well as a selection object. Through the selection object you can get information about the selection like coordinates or the text it contains and you can manipulate the selection.

In the following example we are going to show a toolbar on top of the selection whenever the user has selected something inside of an editable element.

```javascript
editable.selection((editableElement, selection) => {
  if (!selection) return toolbar.hide()

  // get coordinates relative to the document (suited for absolutely positioned elements)
  const coords = selection.getCoordinates()

  // position toolbar
  const top = coords.top - toolbar.outerHeight()
  const left = coords.left + (coords.width / 2) - (toolbar.outerWidth() / 2)
  toolbar.css({top, left}).show()
})
```

#### Dive Deeper

We haven't got around to make this documentation comprehensive enough. In the meantime you can find the API methods in [src/core.js](src/core.js) and the default implementation in [src/default-behavior.js](src/default-behavior.js).

To find out what you can do with the the editable.js `cursor` and `selection` objects see [src/cursor.js](src/cursor.js) and [src/selection.js](src/selection.js).


## Development

Setup:

```bash
# install node dependencies
npm install
```


Tasks:

```bash
# livereload server with demo app
npm start

# run tests with karma on PhantomJS2
npm run test:karma

# run tests with karma on PhantomJS2 and rerun on changes
npm run test:watch

# run tests in Chrome, Firefox and Safari
npm run test:karma:all

# javascript linting (configuration in .eslintrc)
npm run lint

# run tests and build editable.js
npm run build
```

## License

editable.js is licensed under the [MIT License](LICENSE).

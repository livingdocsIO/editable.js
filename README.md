# editable.js
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## What is it about?

A JavaScript API that defines a friendly and browser-consistent content editable interface.

Editable is built for block level elements containing only phrasing content. This normally means `p`, `h1`-`h6`, `blockquote` etc. elements. This allows editable to be lean and mean since it is only concerned with formatting and not with layouting.

We made editable.js to support our vision of online document editing. Have a look at [livingdocs.io](http://livingdocs.io/).

## Installation

Via bower:

```shell
bower install editable
```

Otherwise you can just grab the [editable.js](editable.js) or [editable.min.js](editable.min.js) files from this repo.


## Plnkr Demo

You can check out a [simple demo](http://plnkr.co/edit/12OUl7) of editable.js on plnkr. It features a formatting toolbar and the default insert, split and merge behavior that allow to add and remove content blocks like paragraphs easily.


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
editalbe.add($elem)
```

#### Example for Selection Changes

In a `selection` event you get the editable element that triggered the event as well as a selection object. Through the selection object you can get information about the selection like coordinates or the text it contains and you can manipulate the selection.

In the following example we are going to show a toolbar on top of the selection whenever the user has selected something inside of an editable element.

```javascript
editable.selection(function(editableElement, selection) {
  if (selection) {
    // get coordinates relative to the document (suited for absolutely positioned elements)
    coords = selection.getCoordinates();

    // position toolbar
    var top = coords.top - toolbar.outerHeight();
    var left = coords.left + (coords.width / 2) - (toolbar.outerWidth() / 2);
    toolbar.show().css('top', top).css('left', left);
  } else {
    toolbar.hide();
  }
});
```

#### Dive Deeper

We haven't got around to make this documentation comprehensive enough. In the meantime you can find the API methods in [src/core.js](src/core.js) and the default implemnetation in [src/default-behavior.js](src/default-behavior.js).

To find out what you can do with the the editable.js `cursor` and `selection` objects see [src/cursor.js](src/cursor.js) and [src/selection.js](src/selection.js).


## Development

Setup:

- [PhantomJS](http://phantomjs.org/)

```bash
# install PhantomJS with homebrew
brew install phantomjs

# install node dependencies
npm install
```


Grunt tasks:

```bash
# watch and update editable.js and editable-test.js in .tmp/
# and hands-on browser testing with livereload
# (required for running tests)
grunt dev

# run tests with PhantomJS
grunt test

# run tests in Chrome, Firefox and Safari
grunt karma:browsers

# javascript linting (configuration in .jshintrc)
grunt jshint

# run tests, linting and build editable.js
grunt build
```

## License

editable.js is licensed under the [MIT License](LICENSE).

In Short:

- You can use, copy and modify the software however you want.
- You can give the software away for free or sell it.
- The only restriction is that it be accompanied by the license agreement.

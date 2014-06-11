Editable.JS
==========

JavaScript API that defines a browser-consistent content editable interface

Editable is built for block level elements containing only phrasing content. This normally means `p`, `h1`-`h6`, `blockquote` etc. elements. This allows editable to be lean and mean since it is only concerned with formatting and not with layouting.

#### Demo

You can check out a simple demo of Editable.JS on this [plnkr](http://plnkr.co/edit/12OUl7)

#### To Start

To make an element editable:

```javascript
var editable = new Editable()
editalbe.add($elem)
```

#### Events Overview

- **focus**
  Fired when an editable element gets focus.
- **blur**
  Fired when an editable element looses focus.
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
  Fired when the user pressed an `ARROW KEY` at the top or bottom so that you may want to set the cursor into the preceeding or following element.
- **newline**
  Fired when the user presses `SHIFT+ENTER` to insert a newline.

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


Development
-----------

Organization:
All files of Editable.JS share the same closure. This is in order to allow all classes inside the Editable.JS API to use global objects, but only expose the Editable singleton as the only externally visible variable of Editable.JS. To get a shared closure the files editable.prefix and editable.suffix wrap all code.

**JSHint** does not know this, so all variables defined directly in this editable.js scope have to be added to the globals in .jshintrc


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
# (required for grunt server and running tests)
grunt dev

# hands-on browser testing with livereload
grunt server

# run tests with PhantomJS
grunt test

# run tests in Chrome, Firefox and Safari
grunt karma:browsers

# javascript linting (configuration in .jshintrc)
grunt jshint

# run tests, linting and build editable.js
grunt build
```

License
-------

Editable.JS is licensed under the [MIT License](LICENSE)

In Short:

- You can use, copy and modify the software however you want.
- You can give the software away for free or sell it.
- The only restriction is that it be accompanied by the license agreement.

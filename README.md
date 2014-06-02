Editable.JS
==========

JavaScript API that defines a browser-consistent content editable interface


Development
-----------

Organization:
All files of Editable.JS share the same closure. This is in order to allow all classes inside the Editable.JS API to use global objects, but only expose the Editable singleton as the only externally visible variable of Editable.JS. To get a shared closure the files editable.prefix and editable.suffix wrap all code.


JSHint does not know this, so all variables defined directly in this editable.js scope have to be added to the globals in .jshintrc


Setup:

- [PhantomJS](http://phantomjs.org/)

```bash
# install PhantomJS with homebrew
brew install phantomjs

# install node dependencies
npm install
```


Development setup (optional):

- [YUIDoc](http://yui.github.com/yuidoc/)

```bash
# YUIDoc should be installed globally (its not required in packages.json)
npm install -g yuidocjs
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

YUIDoc:

```bash
# build and run the documentation
yuidoc --server src/
```

License
-------

Editable.JS is licensed under the [MIT License](LICENSE)

In Short:

- You can use, copy and modify the software however you want.
- You can give the software away for free or sell it.
- The only restriction is that it be accompanied by the license agreement.

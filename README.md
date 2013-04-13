Editable.JS
==========

Low level JavaScript API for dealing with content editable


Development
-----------

Organization:  
All code is wrapped in one function by editable.prefix and editable.suffix. So all files of editable.js share the same closure.  
(JSHint does not know this, so all variables defined directly in this editable.js scope have to be added to the globals in .jshintrc)


Optional prerequisites:  
- [PhantomJS](http://phantomjs.org/)
- [YUIDoc](http://yui.github.com/yuidoc/)

Setup:
```bash
# install PhantomJS with homebrew
brew install phantomjs

# YUIDoc should be installed globally (its not required in packages.json)
sudo npm install -g yuidocjs

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

YUIDoc
```bash
# build and run the documentation
yuidoc --server src/
```

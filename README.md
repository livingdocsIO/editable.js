Editable.JS
==========

Low level JavaScript API for dealing with content editable


Development
-----------

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

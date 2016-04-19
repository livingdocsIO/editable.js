var $ = require('jquery')
var Prism = require('prismjs')

var Editable = require('../')
var examples = require('./events.js')

// Paragraph Example
;(function () {
  var editable = new Editable({})

  // Paragraph
  // ---------

  $(document).ready(function () {
    editable.add('.paragraph-example p')
    examples.setup(editable)
  })

  // Text Formatting
  // ---------------

  var currentSelection
  var setupTooltip = function () {
    var tooltip = $('<div class="selection-tip" style="display:none;">' +
      '<button class="js-format js-format-bold"><i class="fa fa-bold"></i></button>' +
      '<button class="js-format js-format-italic"><i class="fa fa-italic"></i></button>' +
      '<button class="js-format js-format-link"><i class="fa fa-link"></i></button>' +
      '<button class="js-format js-format-quote"><i class="fa fa-quote-left"></i></button>' +
      '<button class="js-format js-format-clear"><i class="fa fa-eraser"></i></button>' +
      '</div>')
    $(document.body).append(tooltip)

    editable.selection(function (el, selection) {
      currentSelection = selection
      if (selection) {
        var coords = selection.getCoordinates()

        // position tooltip
        var top = coords.top - tooltip.outerHeight() - 15
        var left = coords.left + (coords.width / 2) - (tooltip.outerWidth() / 2)
        tooltip.show().css('top', top).css('left', left)
      } else {
        tooltip.hide()
      }
    }).blur(function (el) {
      tooltip.hide()
    })

    setupTooltipListeners()
  }

  var setupTooltipListeners = function () {
    // prevent editable from loosing focus
    $(document).on('mousedown', '.js-format', function (event) {
      event.preventDefault()
    })

    $(document).on('click', '.js-format-bold', function (event) {
      if (currentSelection.isSelection) {
        currentSelection.toggleBold()
        currentSelection.triggerChange()
      }
    })

    $(document).on('click', '.js-format-italic', function (event) {
      if (currentSelection.isSelection) {
        currentSelection.toggleEmphasis()
        currentSelection.triggerChange()
      }
    })

    $(document).on('click', '.js-format-link', function (event) {
      if (currentSelection.isSelection) {
        currentSelection.toggleLink('www.upfront.io')
        currentSelection.triggerChange()
      }
    })

    $(document).on('click', '.js-format-quote', function (event) {
      if (currentSelection.isSelection) {
        currentSelection.toggleSurround('«', '»')
        currentSelection.triggerChange()
      }
    })

    $(document).on('click', '.js-format-clear', function (event) {
      if (currentSelection.isSelection) {
        currentSelection.removeFormatting()
        currentSelection.triggerChange()
      }
    })
  }

  var updateCode = function (elem) {
    var content = editable.getContent(elem)
    var $codeBlock = $('.formatting-code-js')
    $codeBlock.text(content.trim())
    Prism.highlightElement($codeBlock[0])
  }

  $(document).ready(function () {
    editable.add('.formatting-example p')
    setupTooltip()

    var secondExample = document.querySelector('.formatting-example p')
    updateCode(secondExample)

    editable.on('change', function (elem) {
      if (elem === secondExample) {
        updateCode(elem)
      }
    })
  })

  // Highlighting
  // ------------

  var $highlightExample = $('.highlighting-example p')
  editable.add($highlightExample)

  var highlightService = function (text, callback) {
    var words = ['happy']
    callback(words)
  }

  editable.setupSpellcheck({
    spellcheckService: highlightService,
    markerNode: $('<span class="highlight"></span>'),
    throttle: 0
  })

  editable.spellcheck.checkSpelling($highlightExample[0])

  // Pasting
  // -------

  editable.add('.pasting-example p')

  // IFrame
  // ------

  $(document).ready(function () {
    var $iframe = $('.iframe-example')

    $iframe.on('load', function () {
      var iframeWindow = $iframe[0].contentWindow
      var iframeEditable = new Editable({
        window: iframeWindow
      })

      var iframeBody = $iframe[0].contentDocument.body
      iframeEditable.add($('.is-editable', iframeBody))
    })
  })
})()

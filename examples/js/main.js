// Paragraph Example
;(function() {

  var editable = new Editable({});


  // Paragraph
  // ---------

  $(document).ready(function() {
    editable.add('.paragraph-example p');
  });


  // Text Formatting
  // ---------------

  var lastSelection;
  var setupTooltip = function() {
    var tooltip = $('<div class="selection-tip" style="display:none;">' +
      '<button class="js-format js-format-bold"><i class="fa fa-bold"></i></button>' +
      '<button class="js-format js-format-italic"><i class="fa fa-italic"></i></button>' +
      '<button class="js-format js-format-link"><i class="fa fa-link"></i></button>' +
      '<button class="js-format js-format-quote"><i class="fa fa-quote-left"></i></button>' +
      '<button class="js-format js-format-clear"><i class="fa fa-eraser"></i></button>' +
    '</div>');
    $(document.body).append(tooltip);
    // tooltip.show().css('top', 100).css('left', 100);

    editable.selection(function(el, selection) {
      lastSelection = selection;
      if (selection) {
        coords = selection.getCoordinates();

        // position tooltip
        var top = coords.top - tooltip.outerHeight() - 15;
        var left = coords.left + (coords.width / 2) - (tooltip.outerWidth() / 2);
        tooltip.show().css('top', top).css('left', left);
      } else {
        tooltip.hide();
      }
    }).blur(function(el) {
      tooltip.hide();
    });

    setupTooltipListeners();
  };

  var setupTooltipListeners = function() {

    // prevent editable from loosing focus
    $(document).on('mousedown', '.js-format', function(event) {
      event.preventDefault();
    });

    $(document).on('click', '.js-format-bold', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleBold();
        lastSelection.triggerChange();
      }
    });

    $(document).on('click', '.js-format-italic', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleEmphasis();
        lastSelection.triggerChange();
      }
    });

    $(document).on('click', '.js-format-link', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleLink('www.upfront.io');
        lastSelection.triggerChange();
      }
    });

    $(document).on('click', '.js-format-quote', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleSurround('«', '»');
        lastSelection.triggerChange();
      }
    });

    $(document).on('click', '.js-format-clear', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.removeFormatting();
        lastSelection.triggerChange();
      }
    });
  };

  $(document).ready(function() {
    editable.add('.formatting-example p');
    setupTooltip();
  });


  // Highlighting
  // ------------

  editable.add('.highlighting-example p');

  var highlightService = function(text, callback) {
    var words = ['happy'];
    callback(words);
  };

  editable.setupSpellcheck({
    spellcheckService: highlightService,
    markerNode: $('<span class="highlight"></span>')
  });


  // Pasting
  // -------

  editable.add('.pasting-example p');


  // IFrame
  // ------

  $(document).ready(function(){
    var $iframe = $('.iframe-example');

    $iframe.on('load', function() {
      var iframeWindow = $iframe[0].contentWindow;
      var iframeEditable = new Editable({
        window: iframeWindow
      });

      var iframeBody = $iframe[0].contentDocument.body;
      iframeEditable.add( $('.is-editable', iframeBody) );
    });
  });

})();


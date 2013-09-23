;(function($) {

  // initalize Editable
  Editable.init({
    log: false
  });

  var lastSelection;

  var setupTooltip = function() {
    var tooltip = $('<div class="selection-tip" style="display:none;">' +
      '<button class="js-format js-format-bold">b</button>' +
      '<button class="js-format js-format-italic">i</button>' +
      '<button class="js-format js-format-link">a</button>' +
      '<button class="js-format js-format-quote">«</button>' +
      '<button class="js-format js-format-clear">x</button>' +
    '</div>');
    $(document.body).append(tooltip);

    Editable.selection(function(el, selection) {
      lastSelection = selection;
      if (selection) {
        coords = selection.getCoordinates()

        // position tooltip
        var top = coords.top - tooltip.outerHeight() - 15;
        var left = coords.left + (coords.width / 2) - (tooltip.outerWidth() / 2);
        tooltip.show().css('top', top).css('left', left);
      } else {
        tooltip.hide();
      }
    }).blur(function(el) {
      // todo: this should not be necessary here
      tooltip.hide();
    });

    setupTooltipListeners();
  };

  var setupTooltipListeners = function() {
    // prevent editable from loosing focus
    $(document).on('mousedown', '.js-format', function(event) {
      event.preventDefault();
    });

    $(document).on('click', '.js-format', function(event) {
      event.preventDefault();
      if (!lastSelection.isSelection) {
        console.log('main.js: got no selection');
      }
    });

    $(document).on('click', '.js-format-bold', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleBold();
      }
    });

    $(document).on('click', '.js-format-italic', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleEmphasis();
      }
    });

    $(document).on('click', '.js-format-link', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleLink('www.upfront.io');
      }
    });

    $(document).on('click', '.js-format-quote', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.toggleSurround('«', '»');
      }
    });

    $(document).on('click', '.js-format-clear', function(event) {
      if (lastSelection.isSelection) {
        lastSelection.removeFormatting();
      }
    });
  };


  $(document).ready(function() {
    $("article>div>p, article>div li").editable();
    setupTooltip();
  });

})(jQuery);

;(function($) {

  // initalize Editable
  Editable.init({
    log: false
  });


  var setupTooltip = function() {
    var tooltip = $('<div class="selection-tip" style="display:none;">How may I help?</div>')
    $(document.body).append(tooltip);

    Editable.selection(function(el, selection) {
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
  };


  $(document).ready(function() {
    $("article>div>p, article>div li").editable();
    setupTooltip();
  });

})(jQuery);

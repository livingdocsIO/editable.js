;(function($) {

  // initalize Editable
  Editable.init({
    log: false
  });


  $(document).ready(function() {
    var tooltip = $('<div class="selection-tip" style="display:none;">How may I help?</div>')
    $(document.body).append(tooltip);

    $("article>div>p").editable();
    Editable.focus(function(el) {
      console.log('Focus event handler was triggered on', el);

    }).blur(function(el) {
      console.log('Blur event handler was triggered on', el);

      // todo: this should not be necessary here
      tooltip.hide();

    }).selection(function(el, selection) {
      if (selection) {
        coords = selection.getCoordinates()

        // position tooltip
        var top = coords.top - tooltip.outerHeight() - 15;
        var left = coords.left + (coords.width / 2) - (tooltip.outerWidth() / 2);
        tooltip.show().css('top', top).css('left', left);
      } else {
        tooltip.hide();
      }
    });
  });
})(jQuery);

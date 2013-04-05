;(function($) {
  $(document).ready(function() {

    $("article>div>p").editable();
    Editable.focus(function(el) {
      console.log('Focus event handler was triggered on', el);
    }).blur(function(el) {
      console.log('Blur event handler was triggered on', el);
    });
  });
})(jQuery);

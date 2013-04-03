;(function($) {
  $(document).ready(function() {

    Editable.init();
    $("article>div>p").editable();
    Editable.on('focus', function() {
      console.log('Focus event handler was triggered');
    }).on('blur', function() {
      console.log('Blur event handler was triggered');
    });
  });
})(jQuery);

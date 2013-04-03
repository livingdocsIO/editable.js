;(function($) {
  $(document).ready(function() {

    Editable.init();
    $("article>div>p").editable();
    Editable.on('focus', function(par1, par2,par3) {
      console.log('Focus event handler was triggered', par1, par2, par3);
    }).on('blur', function() {
      console.log('Blur event handler was triggered');
    });
  });
})(jQuery);

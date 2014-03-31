describe('Keyboard', function() {
  var keyboard, event, called;

  beforeEach(function() {
    keyboard = new Keyboard();
    event = jQuery.Event("keydown");
    called = 0;
  });

  describe('dispatchKeyEvent()', function() {

    it('notifies a left event', function() {
      keyboard.on('left', function(event) {
        called += 1
      });

      event.keyCode = Keyboard.key['left'];
      keyboard.dispatchKeyEvent(event, {});
      expect(called).toEqual(1);
    });

  });

});

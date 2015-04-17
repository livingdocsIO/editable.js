describe('Keyboard', function() {
  var keyboard, event, called;

  beforeEach(function() {
    var mockedSelectionWatcher = {
      getFreshRange: function() { return {}; }
    };
    keyboard = new Keyboard(mockedSelectionWatcher);
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

    describe('notify "character" event', function() {

      it('does not fire the event for a "left" key', function() {
        keyboard.on('character', function(event) {
          called += 1
        });

        event.keyCode = Keyboard.key['left'];
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(0);
      });

      it('does not fire the event for a "ctrl" key', function() {
        keyboard.on('character', function(event) {
          called += 1
        });

        event.keyCode = Keyboard.key['ctrl'];
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(0);
      });

      it('does fire the event for a "e" key', function() {
        keyboard.on('character', function(event) {
          called += 1
        });

        event.keyCode = 'e'.charCodeAt(0);
        keyboard.dispatchKeyEvent(event, {}, true);
        expect(called).toEqual(1);
      });

      it('does not fire the event for a "e" key without the notifyCharacterEvent param', function() {
        keyboard.on('character', function(event) {
          called += 1
        });

        event.keyCode = 'e'.charCodeAt(0);
        keyboard.dispatchKeyEvent(event, {}, false);
        expect(called).toEqual(0);
      });
    });
  });
});

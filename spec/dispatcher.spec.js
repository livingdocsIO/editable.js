describe('Dispatcher', function() {

  var key = keyboard.key;
  var editable, event;
  var onListener;

  // create a Cursor object and set the selection to it
  var createCursor = function(range) {
    var cursor = new Cursor(editable, range);
    cursor.update();
    return cursor;
  };

  var createRangyCursorAtEnd = function(node) {
    var range = rangy.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    return range;
  };

  // register one listener per test
  var on = function(eventName, func) {
    off(); // make sure the last listener is unregistered
    var obj = { calls: 0 }
    var proxy = function() {
      obj.calls += 1;
      func.apply(this, arguments);
    }
    onListener = { event: eventName, listener: proxy };
    Editable.on(eventName, proxy)
    return obj;
  };

  // unregister the event listener registered with 'on'
  var off = function() {
    if (onListener) {
      Editable.off(onListener.event, onListener.listener);
      onListener = undefined;
    }
  }

  describe('for editable', function() {

    beforeEach(function() {
      editable = $('<div contenteditable="true"></div>');
      $(document.body).append(editable);
      Editable.add(editable);
      editable.focus();
    });

    afterEach(function() {
      off();
      editable.remove();
    });


    describe('on Enter', function() {

      beforeEach(function(){
        event = jQuery.Event("keydown");
        event.keyCode = key.enter;
      });

      it('fires insert "after" if cursor is at the end', function() {
        // <div>foo\</div>
        editable.html('foo');
        createCursor( createRangyCursorAtEnd(editable[0]) );

        var insert = on('insert', function(element, direction, cursor) {
          expect(element).toEqual(editable[0]);
          expect(direction).toEqual('after');
          expect(cursor.isCursor).toEqual(true);
        });

        editable.trigger(event);
        expect(insert.calls).toEqual(1);
      });

      it('fires insert "before" if cursor is at the beginning', function() {
        // <div>|foo</div>
        editable.html('foo');
        var range = rangy.createRange();
        range.selectNodeContents(editable[0]);
        range.collapse(true);
        createCursor(range);

        var insert = on('insert', function(element, direction, cursor) {
          expect(element).toEqual(editable[0]);
          expect(direction).toEqual('before');
          expect(cursor.isCursor).toEqual(true);
        });

        editable.trigger(event);
        expect(insert.calls).toEqual(1);
      });

      it('fires merge if cursor is in the middle', function() {
        // <div>fo|o</div>
        editable.html('foo');
        var range = rangy.createRange();
        range.setStart(editable[0].firstChild, 2);
        range.setEnd(editable[0].firstChild, 2);
        createCursor(range);

        var insert = on('split', function(element, before, after, cursor) {
          expect(element).toEqual(editable[0]);
          expect(before.querySelector('*').innerHTML).toEqual('fo');
          expect(after.querySelector('*').innerHTML).toEqual('o');
          expect(cursor.isCursor).toEqual(true);
        });

        editable.trigger(event);
        expect(insert.calls).toEqual(1);
      });
    });
  });
});

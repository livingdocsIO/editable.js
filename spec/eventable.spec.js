describe('eventable', function() {
  var obj;

  beforeEach(function() {
    obj = {};
    eventable(obj);
  });

  it('attaches an "on" method', function() {
    expect(obj.on).toBeDefined();
  });

  it('attaches an "off" method', function() {
    expect(obj.off).toBeDefined();
  });

  it('attaches a "notify" method', function() {
    expect(obj.notify).toBeDefined();
  });

  it('notifies a listener', function() {
    var called = 0;
    obj.on('publish', function(arg) {
      called += 1;
      expect(arg).toEqual('success')
    });
    obj.notify('publish', this, 'success');
    expect(called).toEqual(1);
  });

  describe('on()', function() {

    it('notifies a listener', function(){
      var called = 0;
      obj.on('publish', function() {
        called += 1;
      });

      obj.notify('publish', this, 'success');
      expect(called).toEqual(1);
    });

  });

  describe('off()', function() {
    var calledA, calledB, calledC;
    var listenerA, listenerB, listenerC;

    beforeEach(function() {
      calledA = calledB = calledC = 0;
      listenerA = function() {
        calledA += 1;
      };
      listenerB = function() {
        calledB += 1;
      };
      listenerC = function() {
        calledC += 1;
      };
      obj.on('publish', listenerA);
      obj.on('publish', listenerB);
      obj.on('awesome', listenerC);
    });

    it('can cope with undefined', function() {
      obj.off('publish', undefined);
      obj.notify('publish', this, 'success');
      expect(calledA).toEqual(1);
      expect(calledB).toEqual(1);
      expect(calledC).toEqual(0);
    });

    it('removes a single listener', function() {
      obj.off('publish', listenerA);
      obj.notify('publish', this, 'success');
      expect(calledA).toEqual(0);
      expect(calledB).toEqual(1);
      expect(calledC).toEqual(0);
    });

    it('removes all listeners for one event type', function() {
      obj.off('publish');
      obj.notify('publish', this, 'success');
      obj.notify('awesome', this, 'success');
      expect(calledA).toEqual(0);
      expect(calledB).toEqual(0);
      expect(calledC).toEqual(1);
    });

    it('removes all listeners', function() {
      obj.off();
      obj.notify('publish', this, 'success');
      obj.notify('awesome', this, 'success');
      expect(calledA).toEqual(0);
      expect(calledB).toEqual(0);
      expect(calledC).toEqual(0);
    });

  });

});

import eventable from '../src/eventable'

describe('eventable', function () {
  var obj

  describe('with individual contexts', function () {
    beforeEach(function () {
      obj = {}
      eventable(obj)
    })

    it('passes the arguments right', function () {
      var called = 0
      obj.on('publish', function (argA, argB) {
        called += 1
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })

      obj.notify(undefined, 'publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the proper context', function () {
      var called = 0
      obj.on('publish', function (arg) {
        called += 1
        expect(this.test).toEqual('A')
      })
      obj.notify({ test: 'A' }, 'publish')
      expect(called).toEqual(1)
    })
  })

  describe('with a predefined context', function () {
    beforeEach(function () {
      obj = {}
      eventable(obj, { test: 'context' })
    })

    it('attaches an "on" method', function () {
      expect(obj.on).toBeDefined()
    })

    it('attaches an "off" method', function () {
      expect(obj.off).toBeDefined()
    })

    it('attaches a "notify" method', function () {
      expect(obj.notify).toBeDefined()
    })

    it('passes the arguments right', function () {
      var called = 0
      obj.on('publish', function (argA, argB) {
        called += 1
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })
      obj.notify('publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the context', function () {
      var called = 0
      obj.on('publish', function () {
        called += 1
        expect(this.test).toEqual('context')
      })
      obj.notify('publish')
      expect(called).toEqual(1)
    })

    describe('on()', function () {
      it('notifies a listener', function () {
        var called = 0
        obj.on('publish', function () {
          called += 1
        })

        obj.notify('publish', 'success')
        expect(called).toEqual(1)
      })
    })

    describe('off()', function () {
      var calledA, calledB, calledC
      var listenerA, listenerB, listenerC

      beforeEach(function () {
        calledA = calledB = calledC = 0
        listenerA = function () {
          calledA += 1
        }
        listenerB = function () {
          calledB += 1
        }
        listenerC = function () {
          calledC += 1
        }
        obj.on('publish', listenerA)
        obj.on('publish', listenerB)
        obj.on('awesome', listenerC)
      })

      it('can cope with undefined', function () {
        obj.off('publish', undefined)
        obj.notify('publish', 'success')
        expect(calledA).toEqual(1)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes a single listener', function () {
        obj.off('publish', listenerA)
        obj.notify('publish', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes all listeners for one event type', function () {
        obj.off('publish')
        obj.notify('publish', 'success')
        obj.notify('awesome', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(0)
        expect(calledC).toEqual(1)
      })

      it('removes all listeners', function () {
        obj.off()
        obj.notify('publish', 'success')
        obj.notify('awesome', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(0)
        expect(calledC).toEqual(0)
      })
    })
  })
})

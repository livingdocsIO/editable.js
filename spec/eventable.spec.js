import eventable from '../src/eventable'

describe('eventable', () => {
  let obj

  describe('with individual contexts', () => {
    beforeEach(() => {
      obj = {}
      eventable(obj)
    })

    it('passes the arguments right', () => {
      let called = 0
      obj.on('publish', function (argA, argB) {
        called++
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })

      obj.notify(undefined, 'publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the proper context', () => {
      let called = 0
      obj.on('publish', function (arg) {
        called++
        expect(this.test).toEqual('A')
      })
      obj.notify({ test: 'A' }, 'publish')
      expect(called).toEqual(1)
    })
  })

  describe('with a predefined context', () => {
    beforeEach(() => {
      obj = {}
      eventable(obj, { test: 'context' })
    })

    it('attaches an "on" method', () => {
      expect(obj.on).toBeDefined()
    })

    it('attaches an "off" method', () => {
      expect(obj.off).toBeDefined()
    })

    it('attaches a "notify" method', () => {
      expect(obj.notify).toBeDefined()
    })

    it('passes the arguments right', () => {
      let called = 0
      obj.on('publish', (argA, argB) => {
        called++
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })
      obj.notify('publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the context', () => {
      let called = 0
      obj.on('publish', function () {
        called++
        expect(this.test).toEqual('context')
      })
      obj.notify('publish')
      expect(called).toEqual(1)
    })

    describe('on()', () => {
      it('notifies a listener', () => {
        let called = 0
        obj.on('publish', () => {
          called++
        })

        obj.notify('publish', 'success')
        expect(called).toEqual(1)
      })
    })

    describe('off()', () => {
      let calledA, calledB, calledC
      function listenerA () {
        calledA++
      }

      beforeEach(() => {
        calledA = calledB = calledC = 0
        obj.on('publish', listenerA)
        obj.on('publish', () => calledB++)
        obj.on('awesome', () => calledC++)
      })

      it('can cope with undefined', () => {
        obj.off('publish', undefined)
        obj.notify('publish', 'success')
        expect(calledA).toEqual(1)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes a single listener', () => {
        obj.off('publish', listenerA)
        obj.notify('publish', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes all listeners for one event type', () => {
        obj.off('publish')
        obj.notify('publish', 'success')
        obj.notify('awesome', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(0)
        expect(calledC).toEqual(1)
      })

      it('removes all listeners', () => {
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

import eventable from '../src/eventable'

describe('eventable', function () {

  describe('with individual contexts', function () {

    beforeEach(function () {
      this.obj = {}
      eventable(this.obj)
    })

    it('passes the arguments right', function () {
      let called = 0
      this.obj.on('publish', function (argA, argB) {
        called++
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })

      this.obj.notify(undefined, 'publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the proper context', function () {
      let called = 0
      this.obj.on('publish', function (arg) {
        called++
        expect(this.test).toEqual('A')
      })
      this.obj.notify({ test: 'A' }, 'publish')
      expect(called).toEqual(1)
    })
  })

  describe('with a predefined context', function () {

    beforeEach(function () {
      this.obj = {}
      eventable(this.obj, { test: 'context' })
    })

    it('attaches an "on" method', function () {
      expect(this.obj.on).toBeDefined()
    })

    it('attaches an "off" method', function () {
      expect(this.obj.off).toBeDefined()
    })

    it('attaches a "notify" method', function () {
      expect(this.obj.notify).toBeDefined()
    })

    it('passes the arguments right', function () {
      let called = 0
      this.obj.on('publish', (argA, argB) => {
        called++
        expect(argA).toEqual('A')
        expect(argB).toEqual('B')
      })
      this.obj.notify('publish', 'A', 'B')
      expect(called).toEqual(1)
    })

    it('sets the context', function () {
      let called = 0
      this.obj.on('publish', function () {
        called++
        expect(this.test).toEqual('context')
      })
      this.obj.notify('publish')
      expect(called).toEqual(1)
    })

    describe('on()', function () {

      it('notifies a listener', function () {
        let called = 0
        this.obj.on('publish', () => {
          called++
        })

        this.obj.notify('publish', 'success')
        expect(called).toEqual(1)
      })

      it('accepts multiple whitespace separated event names', function () {
        let called = 0
        this.obj.on('publish unpublish', () => {
          called++
        })

        this.obj.notify('publish')
        this.obj.notify('unpublish')
        this.obj.notify('foo') // should do nothing
        expect(called).toEqual(2)
      })

      it('accepts an object to register multiple events', function () {
        let published = 0
        let unpublished = 0

        this.obj.on({
          publish: () => { published++ },
          unpublish: () => { unpublished++ }
        })

        this.obj.notify('publish')
        this.obj.notify('unpublish')
        expect(published).toEqual(1)
        expect(unpublished).toEqual(1)
      })

      it('accepts multiple event names in object form', function () {
        let called = 0

        this.obj.on({
          'publish unpublish': () => { called++ }
        })

        this.obj.notify('publish')
        this.obj.notify('unpublish')
        expect(called).toEqual(2)
      })
    })

    describe('off()', function () {
      let calledA, calledB, calledC
      function listenerA () {
        calledA++
      }

      beforeEach(function () {
        calledA = calledB = calledC = 0
        this.obj.on('publish', listenerA)
        this.obj.on('publish', () => calledB++)
        this.obj.on('awesome', () => calledC++)
      })

      it('can cope with undefined', function () {
        this.obj.off('publish', undefined)
        this.obj.notify('publish', 'success')
        expect(calledA).toEqual(1)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes a single listener', function () {
        this.obj.off('publish', listenerA)
        this.obj.notify('publish', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(1)
        expect(calledC).toEqual(0)
      })

      it('removes all listeners for one event type', function () {
        this.obj.off('publish')
        this.obj.notify('publish', 'success')
        this.obj.notify('awesome', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(0)
        expect(calledC).toEqual(1)
      })

      it('removes all listeners', function () {
        this.obj.off()
        this.obj.notify('publish', 'success')
        this.obj.notify('awesome', 'success')
        expect(calledA).toEqual(0)
        expect(calledB).toEqual(0)
        expect(calledC).toEqual(0)
      })
    })
  })

  describe('notify()', function () {
    let results, obj

    beforeEach(function () {
      results = []
      obj = {}
      eventable(obj)

      obj.on('foo', () => results.push(2))

      obj.on('foo', () => results.push(1))
    })

    it('executes newest listeners first', function () {
      obj.notify({}, 'foo')

      expect(results).toEqual([1, 2])
    })

    it('executes newest listeners first on repeated calls', function () {
      obj.notify({}, 'foo')
      obj.notify({}, 'foo')

      expect(results).toEqual([1, 2, 1, 2])
    })
  })
})

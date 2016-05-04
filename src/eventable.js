import $ from 'jquery'

// Eventable Mixin.
//
// Simple mixin to add event emitter methods to an object (Publish/Subscribe).
//
// Add on, off and notify methods to an object:
// eventable(obj)
//
// publish an event:
// obj.notify(context, 'action', param1, param2)
//
// Optionally pass a context that will be applied to every event:
// eventable(obj, context)
//
// With this publishing can omit the context argument:
// obj.notify('action', param1, param2)
//
// Subscribe to a 'channel'
// obj.on('action', funtion(param1, param2){ ... })
//
// Unsubscribe an individual listener:
// obj.off('action', method)
//
// Unsubscribe all listeners of a channel:
// obj.off('action')
//
// Unsubscribe all listeners of all channels:
// obj.off()

export default function eventable (obj, notifyContext) {
  $.extend(obj, getEventableModule(notifyContext))
}

function getEventableModule (notifyContext) {
  let listeners = {}

  function addListener (event, listener) {
    listeners[event] = [...listeners[event] || [], listener]
  }

  function removeListener (event, listener) {
    const eventListeners = listeners[event]
    if (eventListeners === undefined) return

    const index = eventListeners.indexOf(listener)
    if (index < 0) return

    eventListeners.splice(index, 1)
  }

  // Public Methods
  return {
    on (event, listener) {
      if (arguments.length === 2) {
        addListener(event, listener)
      } else if (arguments.length === 1) {
        for (let eventType in event) addListener(eventType, event[eventType])
      }
      return this
    },

    off (event, listener) {
      if (arguments.length === 2) {
        removeListener(event, listener)
      } else if (arguments.length === 1) {
        listeners[event] = []
      } else {
        listeners = {}
      }
    },

    notify (context, event) {
      const args = Array.from(arguments)

      if (notifyContext) {
        event = context
        context = notifyContext
        args.splice(0, 1)
      } else {
        args.splice(0, 2)
      }

      const eventListeners = listeners[event]
      if (eventListeners === undefined) return

      // Traverse backwards and execute the newest listeners first.
      // Stop if a listener returns false.
      eventListeners.reverse().every((listener) => listener.apply(context, args) !== false)
    }
  }
}

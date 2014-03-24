
var getEventableModule = function() {

  var listeners = {};

  var addListener = function(event, listener) {
    if (listeners[event] === undefined) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  };

  var removeListener = function(event, listener) {
    var eventListeners = listeners[event];
    if (eventListeners === undefined) return;

    for (var i = 0, len = eventListeners.length; i < len; i++) {
      if (eventListeners[i] === listener) {
        eventListeners.splice(i, 1);
        break;
      }
    }
  };

  // Public Methods
  return {
    on: function(event, listener) {
      if (arguments.length === 2) {
        addListener(event, listener);
      } else if (arguments.length === 1) {
        var eventObj = event;
        for (var eventType in eventObj) {
          addListener(eventType, eventObj[eventType]);
        }
      }
      return this;
    },

    off: function(event, listener) {
      if (arguments.length === 2) {
        removeListener(event, listener);
      } else if (arguments.length === 1) {
        listeners[event] = [];
      } else {
        listeners = {};
      }
    },

    notify: function(event, context) {
      var eventListeners = listeners[event];
      if (eventListeners === undefined) return;

      var args = Array.prototype.slice.call(arguments).splice(2);
      for (var i = 0, len = eventListeners.length; i < len; i++) {
        if (eventListeners[i].apply(context, args) === false)
          break;
      }
    }
  };

};

var eventable = function(obj) {
  var module = getEventableModule();
  for (var prop in module) {
    obj[prop] = module[prop];
  }
};

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var guid = 0;

var Events = React.createClass({displayName: "Events",
  render: function() {
    var content, list = this.props.list;
    if (list.length) {
      content = list.map(function(entry) {
        return React.createElement(Events.Entry, React.__spread({key:  entry.id},   entry ))
      });
    } else {
      content = React.createElement("div", {key: "empty-entry"}, "Nothing to see yet.");
    }

    return (
      React.createElement("div", {className: "events-list"}, 
        React.createElement(ReactCSSTransitionGroup, {transitionName: "events", transitionLeave: false}, 
           content 
        )
      )
    )
  }
});

Events.Entry = React.createClass({displayName: "Entry",
  render: function() {
    return (
      React.createElement("div", {className: "events-list-entry"}, 
        React.createElement("span", {className: "event-name"},  this.props.name), 
         this.props.content
      )
    );
  }
});

var CursorPosition = React.createClass({displayName: "CursorPosition",
  render: function() {
    return (
      React.createElement("span", {className: "cursor-position"}, "\"",  this.props.before, React.createElement("i", null, " "),  this.props.after, "\"")
    );
  }
});

var Selection = React.createClass({displayName: "Selection",
  render: function() {
    return (
      React.createElement("span", {className: "selection"},  this.props.content)
    );
  }
});

var Clipboard = React.createClass({displayName: "Clipboard",
  render: function() {
    return (
      React.createElement("span", null, 
        React.createElement("span", {className: "clipboard-action"},  this.props.action), " ", React.createElement("span", {className: "clipboard-content"}, "\"",  this.props.content, "\"")
      )
    );
  }
});

var listLength = 7;
var events = [];
var addToList = function(event) {
  events.unshift(event);
  if (events.length > listLength) {
    removeFromList();
  }
};

var removeFromList = function() {
  var event = events.pop();
  draw();
}

var showEvent = function(event) {
  guid += 1;
  event.id = guid;
  addToList(event);
  draw();
};

var draw = function() {
  React.render(
    React.createElement(Events, {list:  events }),
    document.querySelector('.paragraph-example-events')
  );
}

var isFromFirstExample = function(elem) {
  if ( $(elem).closest('.paragraph-example').length ) return true;
}

window.examples = {
  setup: function(editable) {

    editable.on('focus', function(elem) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'focus'
      };
      showEvent(event);
    });

    editable.on('blur', function(elem) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'blur'
      };
      showEvent(event);
    });

    editable.on('cursor', function(elem, cursor) {
      if (!isFromFirstExample(elem)) return;
      if (cursor) {
        var before = $(cursor.before()).text();
        var after = $(cursor.after()).text();
        var beforeMatch = /[^ ]{0,10}[ ]?$/.exec(before);
        var afterMatch = /^[ ]?[^ ]{0,10}/.exec(after);
        if (beforeMatch) before = beforeMatch[0];
        if (beforeMatch) after = afterMatch[0];
        var event = {
          name: 'cursor',
          content: React.createElement(CursorPosition, {before:  before, after:  after })
        };
        showEvent(event);
      }
    });

    editable.on('selection', function(elem, selection) {
      if (!isFromFirstExample(elem)) return;
      if (selection) {
        var event = {
          name: 'selection',
          content: React.createElement(Selection, {content:  selection.text() })
        };
        showEvent(event);
      }
    });

    editable.on('change', function(elem) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'change'
      };
      showEvent(event);
    });

    editable.on('clipboard', function(elem, action, selection) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'clipboard',
        content: React.createElement(Clipboard, {action:  action, content:  selection.text() })
      };
      showEvent(event);
    });

    editable.on('insert', function(elem, direction, cursor) {
      if (!isFromFirstExample(elem)) return;
      var content;
      if (direction == 'after') {
        content = "Insert a new block after the current one";
      } else {
        content = "Insert a new block before the current one";
      }
      var event = {
        name: 'insert',
        content: content
      };
      showEvent(event);
    });

    editable.on('split', function(elem, fragmentA, fragmentB, cursor) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'split',
        content: 'Split this block'
      };
      showEvent(event);
    });

    editable.on('merge', function(elem, direction) {
      if (!isFromFirstExample(elem)) return;
      if (direction == 'after') {
        content = "Merge this block with the following block";
      } else {
        content = "Merge this block with the previous block";
      }
      var event = {
        name: 'merge',
        content: content
      };
      showEvent(event);
    });

    editable.on('switch', function(elem, direction, cursor) {
      if (!isFromFirstExample(elem)) return;
      if (direction == 'after') {
        content = "Set the focus to the following block";
      } else {
        content = "Set the focus to the previous block";
      }
      var event = {
        name: 'switch',
        content: content
      };
      showEvent(event);
    });

    editable.on('newline', function(elem) {
      if (!isFromFirstExample(elem)) return;
      var event = {
        name: 'newline'
      };
      showEvent(event);
    });

    draw();
  }
};

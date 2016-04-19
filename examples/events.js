var $ = require('jquery')
var React = require('react/addons')

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup
var guid = 0

var Events = React.createClass({
  render: function () {
    var content
    var list = this.props.list
    if (list.length) {
      content = list.map(function (entry) {
        return <Events.Entry key={entry.id} { ...entry } />
      })
    } else {
      content = <div key='empty-entry'>
                  Nothing to see yet.
                </div>
    }

    return (
    <div className='events-list'>
      <ReactCSSTransitionGroup transitionName='events' transitionLeave={false}>
        {content}
      </ReactCSSTransitionGroup>
    </div>
    )
  }
})

Events.Entry = React.createClass({
  render: function () {
    return (
    <div className='events-list-entry'>
      <span className='event-name'>{this.props.name}</span>
      {this.props.content}
    </div>
    )
  }
})

var CursorPosition = React.createClass({
  render: function () {
    return (
    <span className='cursor-position'>'{this.props.before}<i>&nbsp;</i>{this.props.after}'</span>
    )
  }
})

var Selection = React.createClass({
  render: function () {
    return (
    <span className='selection'>{this.props.content}</span>
    )
  }
})

var Clipboard = React.createClass({
  render: function () {
    return (
    <span><span className='clipboard-action'>{this.props.action}</span> <span className='clipboard-content'>'{this.props.content}'</span></span>
    )
  }
})

var listLength = 7
var events = []
var addToList = function (event) {
  events.unshift(event)
  if (events.length > listLength) {
    removeFromList()
  }
}

var removeFromList = function () {
  events.pop()
  draw()
}

var showEvent = function (event) {
  guid += 1
  event.id = guid
  addToList(event)
  draw()
}

var draw = function () {
  React.render(
    <Events list={events} />,
    document.querySelector('.paragraph-example-events')
  )
}

var isFromFirstExample = function (elem) {
  if ($(elem).closest('.paragraph-example').length) return true
}

module.exports = {
  setup: function (editable) {
    editable.on('focus', function (elem) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'focus'
      }
      showEvent(event)
    })

    editable.on('blur', function (elem) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'blur'
      }
      showEvent(event)
    })

    editable.on('cursor', function (elem, cursor) {
      if (!isFromFirstExample(elem)) return
      if (cursor) {
        var before = $(cursor.before()).text()
        var after = $(cursor.after()).text()
        var beforeMatch = /[^ ]{0,10}[ ]?$/.exec(before)
        var afterMatch = /^[ ]?[^ ]{0,10}/.exec(after)
        if (beforeMatch) before = beforeMatch[0]
        if (beforeMatch) after = afterMatch[0]
        var event = {
          name: 'cursor',
          content: <CursorPosition before={before} after={after} />
        }
        showEvent(event)
      }
    })

    editable.on('selection', function (elem, selection) {
      if (!isFromFirstExample(elem)) return
      if (selection) {
        var event = {
          name: 'selection',
          content: <Selection content={selection.text()} />
        }
        showEvent(event)
      }
    })

    editable.on('change', function (elem) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'change'
      }
      showEvent(event)
    })

    editable.on('clipboard', function (elem, action, selection) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'clipboard',
        content: <Clipboard action={action} content={selection.text()} />
      }
      showEvent(event)
    })

    editable.on('paste', function (elem, blocks, cursor) {
      if (!isFromFirstExample(elem)) return

      console.log(blocks)
      var text = blocks.join(' ')
      if (text.length > 40) {
        text = text.substring(0, 38) + '...'
      }

      var event = {
        name: 'paste',
        content: <Clipboard content={text} />
      }
      showEvent(event)
    })

    editable.on('insert', function (elem, direction, cursor) {
      if (!isFromFirstExample(elem)) return
      var content = direction === 'after'
        ? 'Insert a new block after the current one'
        : 'Insert a new block before the current one'

      var event = {
        name: 'insert',
        content: content
      }
      showEvent(event)
    })

    editable.on('split', function (elem, fragmentA, fragmentB, cursor) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'split',
        content: 'Split this block'
      }
      showEvent(event)
    })

    editable.on('merge', function (elem, direction) {
      if (!isFromFirstExample(elem)) return
      var content = direction === 'after'
        ? 'Merge this block with the following block'
        : 'Merge this block with the previous block'

      var event = {
        name: 'merge',
        content: content
      }
      showEvent(event)
    })

    editable.on('switch', function (elem, direction, cursor) {
      if (!isFromFirstExample(elem)) return
      var content = direction === 'after'
        ? 'Set the focus to the following block'
        : 'Set the focus to the previous block'

      var event = {
        name: 'switch',
        content: content
      }
      showEvent(event)
    })

    editable.on('newline', function (elem) {
      if (!isFromFirstExample(elem)) return
      var event = {
        name: 'newline'
      }
      showEvent(event)
    })

    draw()
  }
}

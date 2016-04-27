import $ from 'jquery'
import React, { Component, PropTypes } from 'react/addons'
const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

class Events extends Component {
  render () {
    const content = this.props.list.map(function (entry) {
      return <Events.Entry key={entry.id} { ...entry } />
    })

    return (<div className='events-list'>
      <ReactCSSTransitionGroup transitionName='events' transitionLeave={false}>
        {content.length ? content : (<div key='empty-entry'>
          Nothing to see yet.
        </div>)}
      </ReactCSSTransitionGroup>
    </div>)
  }
}
Events.propTypes = {
  list: PropTypes.array
}

Events.Entry = class Entry extends Component {
  render () {
    return (<div className='events-list-entry'>
      <span className='event-name'>{this.props.name}</span>
      {this.props.content}
    </div>)
  }
}
Events.Entry.propTypes = {
  name: PropTypes.string,
  content: PropTypes.object
}

class CursorPosition extends Component {
  render () {
    return (<span className='cursor-position'>
      {this.props.before}
      <i>&nbsp;</i>
      {this.props.after}
    </span>)
  }
}
CursorPosition.propTypes = {
  before: PropTypes.string,
  after: PropTypes.string
}

class Selection extends Component {
  render () {
    return <span className='selection'>{this.props.content}</span>
  }
}
Selection.propTypes = {
  content: PropTypes.string
}

class Clipboard extends Component {
  render () {
    return (<span>
      <span className='clipboard-action'>{this.props.action}</span> <span className='clipboard-content'>{this.props.content}</span>
    </span>)
  }
}
Clipboard.propTypes = {
  action: PropTypes.string,
  content: PropTypes.string
}

let guid = 0
const listLength = 7
const events = []

function addToList (event) {
  events.unshift(event)
  if (events.length > listLength) removeFromList()
}

function removeFromList () {
  events.pop()
  draw()
}

function showEvent (event) {
  event.id = ++guid
  addToList(event)
  draw()
}

function draw () {
  React.render(<Events list={events} />, document.querySelector('.paragraph-example-events'))
}

function isFromFirstExample (elem) {
  return !!$(elem).closest('.paragraph-example').length
}

export default function (editable) {
  editable

  .on('focus', (elem) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'focus'
    })
  })

  .on('blur', (elem) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'blur'
    })
  })

  .on('cursor', (elem, cursor) => {
    if (!isFromFirstExample(elem)) return
    if (!cursor) return
    let before = $(cursor.before()).text()
    let after = $(cursor.after()).text()
    const beforeMatch = /[^ ]{0,10}[ ]?$/.exec(before)
    const afterMatch = /^[ ]?[^ ]{0,10}/.exec(after)
    if (beforeMatch) before = beforeMatch[0]
    if (beforeMatch) after = afterMatch[0]
    showEvent({
      name: 'cursor',
      content: <CursorPosition before={before} after={after} />
    })
  })

  .on('selection', (elem, selection) => {
    if (!isFromFirstExample(elem)) return
    if (!selection) return
    showEvent({
      name: 'selection',
      content: <Selection content={selection.text()} />
    })
  })

  .on('change', (elem) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'change'
    })
  })

  .on('clipboard', (elem, action, selection) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'clipboard',
      content: <Clipboard action={action} content={selection.text()} />
    })
  })

  .on('paste', (elem, blocks, cursor) => {
    if (!isFromFirstExample(elem)) return

    console.log(blocks)
    let text = blocks.join(' ')
    if (text.length > 40) text = text.substring(0, 38) + '...'

    showEvent({
      name: 'paste',
      content: <Clipboard content={text} />
    })
  })

  .on('insert', (elem, direction, cursor) => {
    if (!isFromFirstExample(elem)) return
    const content = direction === 'after'
      ? 'Insert a new block after the current one'
      : 'Insert a new block before the current one'

    showEvent({
      name: 'insert',
      content
    })
  })

  .on('split', (elem, fragmentA, fragmentB, cursor) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'split',
      content: 'Split this block'
    })
  })

  .on('merge', (elem, direction) => {
    if (!isFromFirstExample(elem)) return
    const content = direction === 'after'
      ? 'Merge this block with the following block'
      : 'Merge this block with the previous block'

    showEvent({
      name: 'merge',
      content: content
    })
  })

  .on('switch', (elem, direction, cursor) => {
    if (!isFromFirstExample(elem)) return
    const content = direction === 'after'
      ? 'Set the focus to the following block'
      : 'Set the focus to the previous block'

    showEvent({
      name: 'switch',
      content: content
    })
  })

  .on('newline', (elem) => {
    if (!isFromFirstExample(elem)) return
    showEvent({
      name: 'newline'
    })
  })

  draw()
}

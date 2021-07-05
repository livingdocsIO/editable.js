import React, {Component} from 'react'
import {PropTypes} from 'prop-types'
import ReactDOM from 'react-dom'
import {CSSTransition, TransitionGroup} from 'react-transition-group'

class Events extends Component {
  render () {
    const transitionOptions = {
      classNames: 'events',
      in: true,
      timeout: 500
    }

    const defaultContent = (<CSSTransition key='empty-entry' {...transitionOptions}>
      <div>Nothing to see yet.</div>
    </CSSTransition>)

    const content = this.props.list.map(function (entry) {
      return (<CSSTransition key={entry.id} {...transitionOptions}>
        <div className='events-list-entry'>
          <span className='event-name'>{entry.name}</span>
          {entry.content}
        </div>
      </CSSTransition>)
    })

    return (<div className='events-list'>
      <TransitionGroup
        children={content.length ? content : defaultContent}
        enter={true}
        exit={false}
      />
    </div>)
  }
}
Events.propTypes = {
  list: PropTypes.array
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
  ReactDOM.render(<Events list={events} />, document.querySelector('.paragraph-example-events'))
}

function isFromFirstExample (elem) {
  return !!elem.closest('.paragraph-example')
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
      let before = cursor.before().textContent
      let after = cursor.after().textContent
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

      let text = blocks.join(' ')
      if (text.length > 40) text = `${text.substring(0, 38)}...`

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
        content: <span>Split this block</span>
      })
    })

    .on('merge', (elem, direction) => {
      if (!isFromFirstExample(elem)) return
      const content = direction === 'after'
        ? 'Merge this block with the following block'
        : 'Merge this block with the previous block'

      showEvent({
        name: 'merge',
        content: <span>{content}</span>
      })
    })

    .on('switch', (elem, direction, cursor) => {
      if (!isFromFirstExample(elem)) return
      const content = direction === 'down'
        ? 'Set the focus to the following block'
        : 'Set the focus to the previous block'

      showEvent({
        name: 'switch',
        content: <span>{content}</span>
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

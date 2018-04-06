const morphdom = require('morphdom')
const MutationSummary = require('mutation-summary')


module.exports = EditableView

function EditableView (model, elem, emit) {
  this.model = model
  this.elem = elem

  const self = this
  this.observer = this.mutationSummary = new MutationSummary({
    rootNode: this.elem,
    oldPreviousSibling: true,
    queries: [{ all: true}],
    callback: function (summaries) {
      console.log(summaries)
      // what to do in here:
      //  - normalize edit operations
      //  - ignore all dom operations
      //  - handle paste
      //  - handle cmd+b, cmd+i, cmd+u (register regular events, reject edits)
      //  - handle text inserts and deletion (including dom )
      //  - track cursor position?
      // emit({type: 'insertChar', value: '123'})
      // emit({type: 'backspaceChar', value: '123'})
      // emit({type: 'deleteChar', value: '123'})
      // emit({type: 'replaceChar', value: '123'})
      // emit({type: 'deleteTag', id: 1})
    }
  })

  this.elem.addEventListener('focus', this.render.bind(this, model.toDom()))
  this.elem.addEventListener('blur', this.render.bind(this, model.toDom()))
  this.model.on('event', EditableView.prototype.apply.bind(this))
}

EditableView.prototype.apply = function (evt) {
  this.disconnect()

  this.reconnect()
}

EditableView.prototype.reconnect = function () {
  this.observer.reconnect()
}

EditableView.prototype.disconnect = function () {
  this.observer.disconnect()
}

EditableView.prototype.render = function (toNode) {
  this.observer.disconnect()
  morphdom(this.elem, toNode, {childrenOnly: true})
  this.observer.reconnect()
}



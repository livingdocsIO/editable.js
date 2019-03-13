import $ from 'jquery'
import rangy from 'rangy'
import { unwrap, adoptElement } from './content'

function defaultMarkerConstructor (id, namespace) {
  const marker = $('span')[0]
  return marker
}

const defaultOptions = {
  namespace: 'vspan',
  idAttribute: 'data-vspan-id',
  namespaceAttribute: 'data-vspan-namespace',
  editableNamespace: 'vspan',
  markerConstructor: defaultMarkerConstructor,
  win: undefined
}

class VirtualSpan {
  constructor ({
    namespace,
    idAttribute,
    namespaceAttribute,
    editableNamespace,
    markerConstructor,
    win
  } = defaultOptions) {
    this.namespace = namespace
    this.idAttribute = idAttribute
    this.namespaceAttribute = namespaceAttribute
    this.editableNamespace = editableNamespace
    this.markerConstructor = markerConstructor
    this.win = win
  }

  extractRanges (host, markers) {
    const range = rangy.createRange()
    if (markers.length > 1) {
      range.setStartBefore(markers.first()[0])
      range.setEndAfter(markers.last()[0])
    } else {
      range.selectNode(markers[0])
    }
    return range.toCharacterRange(host)
  }

  getIdSelector (id) {
    return `[${this.idAttribute}="${id}"]`
  }

  getIdAttrSelector () {
    return `[${this.idAttribute}]`
  }

  createMarkerNode (id) {
    let marker = this.markerConstructor(id, this.namespace)
    if (this.win) {
      marker = adoptElement(marker, this.win.document)
    }
    marker.setAttribute('data-editable', this.editableNamespace)
    marker.setAttribute(this.idAttribute, id)
    marker.setAttribute(this.namespaceAttribute, this.namespace)
    return marker
  }

  insertIntoHost (host, id, startIndex, endIndex) {
    const marker = this.createMarkerNode(id, this.namespace, this.win)
    const range = rangy.createRange()
    range.selectCharacters(host, startIndex, endIndex)
    const fragment = range.extractContents()
    marker.appendChild(fragment)
    range.deleteContents()
    range.insertNode(marker)
  }

  has (host, id) {
    const matches = $(host).find(this.getIdSelector(id))
    return !!matches.length
  }

  insert (host, id, startIndex, endIndex) {
    if (this.has(host, id)) {
      this.removeVSpan(host, id)
    }
    this.insertIntoHost(host, id, startIndex, endIndex)
  }

  remove (host, id) {
    $(host)
      .find(this.getIdSelector(id))
      .each((index, elem) => {
        unwrap(elem)
      })
  }

  update (host, id, addCssClass, removeCssClass) {
    if (!this.win || !this.win.document.documentElement.classList) return
    $(host)
      .find(this.getIdSelector(id))
      .each((index, elem) => {
        if (removeCssClass) elem.classList.remove(removeCssClass)
        if (addCssClass) elem.classList.add(addCssClass)
      })
  }

  getData (contentStr) {
    const $host = $(`<div>${contentStr}</div>`)
    const markers = $host.find(this.getIdAttrSelector())
    if (!markers.length) {
      return
    }
    const groups = {}
    markers.each((_, marker) => {
      const id = $(marker).attr(this.idAttribute)
      if (!groups[id]) {
        groups[id] = $host.find(this.getIdSelector(id))
      }
    })

    const res = {}
    Object.keys(groups).forEach(id => {
      const position = this.extractRanges($host[0], groups[id])
      const namespace = groups[id].attr(this.namespaceAttribute)
      if (position) {
        res[id] = {
          ...position,
          namespace
        }
      }
    })
    return res
  }

  applyData (contentStr, data) {
    const $host = $(`<div>${contentStr}</div>`)

    for (const id in data) {
      const rangeData = data[id]
      this.insertIntoHost($host[0], id, rangeData.start, rangeData.end)
    }
    return $host.html()
  }

  cleanUp (contentStr) {
    const $host = $(`<div>${contentStr}</div>`)
    const markers = $host.find(this.getIdAttrSelector())
    $(markers).each((_, m) => unwrap(m))
    return $host.html()
  }
}

export default VirtualSpan

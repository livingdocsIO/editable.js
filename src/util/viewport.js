// code from mdn: https://developer.mozilla.org/en-US/docs/Web/API/window.scrollX
function getScrollPosition (win) {
  const x = (win.pageXOffset !== undefined) ? win.pageXOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollLeft
  const y = (win.pageYOffset !== undefined) ? win.pageYOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollTop
  return {x, y}
}

export {getScrollPosition}

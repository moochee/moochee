'use strict'

export default function loadCss(url) {
    const head = document.getElementsByTagName('head')[0]
    const cssnode = document.createElement('link')
    cssnode.type = 'text/css'
    cssnode.rel = 'stylesheet'
    cssnode.href = url
    head.appendChild(cssnode)
}

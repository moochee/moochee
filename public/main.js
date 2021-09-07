'use strict'

// if (navigator.serviceWorker) {
//     navigator.serviceWorker.register('/service-worker.js')
// }

import { html, render } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import QuizSocketClient from '/quiz-socket-client.js'
import WebApp from '/components/app/web-app.js'

loadCss('/font/komikatext_regular_macroman/stylesheet.css')
loadCss('/style.css')

// eslint-disable-next-line no-undef
const socket = new WebSocket(`ws://${location.host}`)

window.onload = function () {
    render(html`<${WebApp} adapter=${new QuizSocketClient(socket)} />`, document.body)
}

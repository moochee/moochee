'use strict'

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
}

import { html, render } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import QuizSocketClient from '/quiz-socket-client.js'
import WebApp from '/components/app/web-app.js'

loadCss('/font/komikatext_regular_macroman/stylesheet.css')
loadCss('/style.css')

const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`
render(html`<${WebApp} adapter=${new QuizSocketClient(() => new WebSocket(wsUrl))} />`, document.body)

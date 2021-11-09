'use strict'

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
}

import { html, render } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import QuizSocketClient from '/public/quiz-socket-client.js'
import PlayApp from '/play/components/app/play-app.js'

loadCss('/public/font/komikatext_regular_macroman/stylesheet.css')
loadCss('/public/style.css')

const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
render(html`<${PlayApp} client=${new QuizSocketClient(() => new WebSocket(wsUrl))} />`, document.body)

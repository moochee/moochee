'use strict'

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
}

import { html, render } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import QuizSocketClient from '/public/quiz-socket-client.js'
import HostApp from '/components/app/host-app.js'

loadCss('/public/font/komikatext_regular_macroman/stylesheet.css')
loadCss('/public/style.css')

const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
const isNewGameCreate = window.location.hash.indexOf('?newGameCreate') > -1
render(html`<${HostApp} client=${new QuizSocketClient(() => new WebSocket(wsUrl), isNewGameCreate)} />`, document.body)

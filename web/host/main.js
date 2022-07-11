'use strict'

import { html, render } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import QuizSocketClient from '/public/quiz-socket-client.js'
import HostApp from './components/app/host-app.js'

loadCss('/public/style.css')

const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
const createGame = async (quizId) => {
    const response = await fetch('/api/v1/games', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ quizId })
    })
    const targetUrl = new URL(response.headers.get('location'))
    const gameId = targetUrl.pathname.substring(1)
    return gameId
}
render(html`<${HostApp} client=${new QuizSocketClient(() => new WebSocket(wsUrl), createGame)} />`, document.body)

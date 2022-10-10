import { html, render } from '../../node_modules/htm/preact/standalone.mjs'
import QuizSocketClient from '../public/quiz-socket-client.js'
import HostApp from './app/host-app.js'

window.loadCss('/web/public/style.css')

export default function init() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    const createGame = async (quizId) => {
        const response = await fetch(`${window.location.origin}/api/v1/games`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ quizId })
        })
        const targetUrl = new URL(response.headers.get('location'))
        const gameId = targetUrl.pathname.substring(1)
        return gameId
    }
    render(html`<${HostApp} client=${new QuizSocketClient(() => new WebSocket(wsUrl), createGame)} />`, document.body)
}

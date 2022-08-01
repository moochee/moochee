import { html, render } from '../../node_modules/htm/preact/standalone.mjs'
import QuizSocketClient from '../public/quiz-socket-client.js'
import PlayApp from './components/app/play-app.js'

window.loadCss('/web/public/style.css')

export default function init() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    render(html`<${PlayApp} client=${new QuizSocketClient(() => new WebSocket(wsUrl), () => null, setTimeout, true)} />`, document.body)
}

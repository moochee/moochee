import { html, render } from '../../node_modules/htm/preact/standalone.mjs'
import PlayerClient from './player-client.js'
import PlayApp from './app/play-app.js'

window.loadCss('/web/public/style.css')

export default function init() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    render(html`<${PlayApp} client=${new PlayerClient(() => new WebSocket(wsUrl))} />`, document.body)
}

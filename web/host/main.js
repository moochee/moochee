import { html, render } from '../../node_modules/htm/preact/standalone.mjs'
import HostClient from './host-client.js'
import HostApp from './app/host-app.js'

window.loadCss('/web/public/style.css')

export default function init() {
    const location = window.location
    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`
    render(html`<${HostApp} client=${new HostClient(() => new WebSocket(wsUrl), location.origin)} />`, document.body)
}
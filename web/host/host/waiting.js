import { html, useState, useRef } from '../../../node_modules/htm/preact/standalone.mjs'

window.loadCss('/web/host/host/waiting.css')

export default function Waiting(props) {
    const joinUrl = `${window.location.origin}/web/play/#/game/${props.gameId}`
    const [copied, setCopied] = useState('')
    const joinUrlInput = useRef()

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinUrl)
        setCopied('copied!')
    }

    const start = () => {
        props.client.nextRound(props.gameId)
    }

    const playerInfo = props.players.map(p => html`<div key=${p} class=hostWaitingBounceIn>${p}</div>`)
    const players = props.players.length > 0
        ? html`<div class=hostWaitingPlayerInfo>${playerInfo}</div>`
        : html`<div class='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>Let people scan the QR code or send them the join URL.</div>`

    const startButton = props.canStart ? html`<button class=startButton onClick=${start}>Start</button>` : ''

    return html`<div class=hostWaiting>
        <div class=hostWaitingJoinUrl>
            <input ref=${joinUrlInput} readOnly value=${joinUrl} onClick=${copyToClipboard}></input>
            <button onClick=${copyToClipboard}>📋</button>
            <div>${copied}</div>
        </div>
        <div class=hostWaitingSplitContainer>
            <img class=hostWaitingQrCode src='${window.location.origin}/qr-code?url=${encodeURIComponent(joinUrl)}'></img>
            ${players}
        </div>

        ${startButton}
    </div>`
}
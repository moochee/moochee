'use strict'

import { html, useState, useRef, useEffect } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import QrCreator from '/public/lib/qr-creator.es6.min.js'

loadCss('components/host/waiting.css')

const QRCode = function (props) {
    const appendQr = useRef(null)
    useEffect(() => {
        QrCreator.render({ text: props.url, background: '#ffffff', size: 1024 }, appendQr.current)
    }, [])
    return html`<canvas class=hostWaitingQrCode ref=${appendQr} />`
}

export default function Waiting(props) {
    const joinUrl = `${window.location.origin}/play/#/game/${props.gameId}`
    const [copied, setCopied] = useState('')
    const joinUrlInput = useRef()

    // REVISE check if still needed, clipboard now supported according to https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
    function iosCopyToClipboard(el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const s = window.getSelection()
        s.removeAllRanges()
        s.addRange(range)
        el.setSelectionRange(0, el.value.length)
        document.execCommand('copy')
        el.setSelectionRange(-1, -1)
    }

    const copyToClipboard = () => {
        if (navigator.userAgent.match(/ipad|iphone/i)) {
            iosCopyToClipboard(joinUrlInput.current)
        } else {
            navigator.clipboard.writeText(joinUrl)
        }
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
            <${QRCode} url=${joinUrl} />
            ${players}
        </div>

        ${startButton}
    </div>`
}

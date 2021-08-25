'use strict'

import { html, useState, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import StickyButton from '/components/sticky/sticky-button.js'

loadCss('components/host/waiting.css')

const QRCode = function (props) {
    // eslint-disable-next-line no-undef
    const appendQr = (el) => new QRious({ element: el, value: props.url, size: 1024 })
    return html`<canvas class=hostWaitingQrCode ref=${appendQr} />`
}

export default function Waiting(props) {
    const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [copied, setCopied] = useState('')
    const joinUrlInput = useRef()

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
        props.adapter.nextRound(props.gameId)
    }

    const playerInfo = props.players.map(p => html`<div key=${p} class=hostWaitingBounceIn>${p}</div>`)
    const players = props.players.length > 0
        ? html`<div class=hostWaitingPlayerInfo>${playerInfo}</div>`
        : html`<div class='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>Let people scan the QR code or send them the join URL</div>`

    const startButton = props.canStart ? html`<${StickyButton} onClick=${start} color=blue text=Start />` : ''

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
        <div class=hostWaitingStartButton>${startButton}</div>
    </div>`
}

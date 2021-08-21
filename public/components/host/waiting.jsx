'use strict'

import loadCss from '../../load-css.js'
import StickyButton from '../sticky/sticky-button.jsx'

loadCss('components/host/waiting.css')

const QRCode = function (props) {
    // eslint-disable-next-line no-undef
    const appendQr = (el) => new QRious({ element: el, value: props.url, size: 1024 })
    return <canvas className='hostWaitingQrCode' ref={appendQr} />
}

export default function Waiting(props) {
    const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [copied, setCopied] = React.useState('')
    const joinUrlInput = React.useRef()

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
        props.adapter.start(props.gameId)
    }

    const players = props.players.length > 0
        ? <div className='hostWaitingPlayerInfo'>{props.players.map(p => <div key={p} className='hostWaitingBounceIn'>{p}</div>)}</div>
        : <div className='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>Let people scan the QR code or send them the join URL</div>

    const startButton = props.canStart ? <StickyButton onClick={start} color='blue' text='Start' /> : ''

    return <div className='hostWaiting'>
        <div className='hostWaitingJoinUrl'>
            <input ref={joinUrlInput} readOnly value={joinUrl} onClick={copyToClipboard}></input>
            <button onClick={copyToClipboard}>📋</button>
            <div>{copied}</div>
        </div>
        <div className='hostWaitingSplitContainer'>
            <QRCode url={joinUrl} />
            {players}
        </div>
        <div className='hostWaitingStartButton'>{startButton}</div>
    </div>
}

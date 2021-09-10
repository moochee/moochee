'use strict'

import { html, useState, useEffect, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import Shell from '/components/shell/shell.js'

loadCss('components/join/join.css')

export default function Join(props) {
    const [playerName, setPlayerName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const name = useRef(null)

    const onJoiningFailed = (error) => {
        setErrorMessage(error)
    }

    useEffect(() => {
        props.adapter.subscribe('joiningFailed', onJoiningFailed)
        setTimeout(() => name.current.focus(), 1) // firefox needs 1ms to focus
        return () => props.adapter.unsubscribe('joiningFailed')
    })

    const updatePlayerName = (event) => {
        setPlayerName(event.target.value)
    }

    const join = async () => {
        const name = playerName.trim()
        props.adapter.join(props.gameId, name)
    }

    return html`<${Shell} headerCenter='Welcome to the 🦍 Quiz'>
        <div class=join>
            <h1>Join Game ${props.gameId}</h1>
            <input ref=${name} placeholder='Enter your name' maxLength=30 value=${playerName}
                onInput=${updatePlayerName} onKeyPress=${e => e.code === 'Enter' ? join() : null}></input>
            <button onClick=${join}>Join</button>
            <div>${errorMessage}</div>
        </div>
    <//>`
}

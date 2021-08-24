'use strict'

import { html, useState } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import Shell from '/components/shell/shell.js'

loadCss('components/join/join.css')

export default function Join(props) {
    const [playerName, setPlayerName] = useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value.trim())
    const [errorMessage, setErrorMessage] = useState('')

    const join = async () => {
        try {
            const joinResponse = await props.adapter.join(props.gameId, playerName)
            props.onJoin(joinResponse.quizTitle, playerName, joinResponse.avatar, joinResponse.otherPlayers)
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    return html`<${Shell} headerCenter='Welcome to the 🦍 Quiz'>
        <div class=join>
            <h1>Join Game ${props.gameId}</h1>
            <input placeholder='Enter your name' autoFocus=true maxLength=30 value=${playerName}
                onInput=${updatePlayerName} onKeyPress=${e => e.code === 'Enter' ? join() : null}></input>
            <button onClick=${join}>Join</button>
            <div>${errorMessage}</div>
        </div>
    <//>`
}

'use strict'

import loadCss from '../../load-css.js'
import Shell from '../shell/shell.jsx'

loadCss('components/join/join.css')

export default function Join(props) {
    const [playerName, setPlayerName] = React.useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value)
    const [errorMessage, setErrorMessage] = React.useState('')

    const join = async () => {
        try {
            const joinResponse = await props.adapter.join(props.gameId, playerName)
            props.onJoin(joinResponse.quizTitle, playerName, joinResponse.avatar, joinResponse.otherPlayers)
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    return <Shell headerCenter='Welcome to the 🦍 Quiz'>
        <div className='join'>
            <h1>Join Game {props.gameId}</h1>
            <input id='playerName' placeholder='Enter your name' autoFocus={true} value={playerName}
                onInput={updatePlayerName} onKeyPress={e => e.code === 'Enter' ? join() : null}></input>
            <button onClick={join}>Join</button>
            <div>{errorMessage}</div>
        </div>
    </Shell>
}

'use strict'

Gorilla.JoinGame = function (props) {
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

    return <Gorilla.Shell headerCenter='Welcome to the 🦍 Quiz'>
        <div style={{ display: 'flex', flexDirection: 'column', height: '80%', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Join Game {props.gameId}</h1>
            <input style={{ width: '10em', height: '3em', textAlign: 'center', fontFamily: 'inherit', fontSize: 'inherit' }}
                id='playerName' placeholder='Enter your name' autoFocus={true} value={playerName}
                onInput={updatePlayerName} onKeyPress={e => e.code === 'Enter' ? join() : null}></input>
            <button style={{ width: '10.5em', height: '3em', fontFamily: 'inherit', fontSize: 'inherit' }} onClick={join}>Join</button>
            <div>{errorMessage}</div>
        </div>
    </Gorilla.Shell>
}
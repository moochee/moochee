Gorilla.JoinGame = function (props) {
    const [playerName, setPlayerName] = React.useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value)
    const [errorMessage, setErrorMessage] = React.useState('')

    const join = async () => {
        try {
            const playerAvatar = await props.adapter.join(props.gameId, playerName)
            props.onJoin(playerName, playerAvatar)
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    return <div style={{ display: 'flex', flexDirection: 'column', height: '80%', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Game {props.gameId}</h1>
        <input style={{ width: '10em', height: '3em', textAlign: 'center', fontFamily: 'inherit', fontSize: 'inherit' }}
            id='playerName' placeholder='Enter your name' autoFocus={true} value={playerName}
            onInput={updatePlayerName} onKeyPress={e => e.code === 'Enter' ? join() : null}></input>
        <button style={{ width: '10.5em', height: '3em', fontFamily: 'inherit', fontSize: 'inherit' }} onClick={join}>Join</button>
        <div>{errorMessage}</div>
    </div>
}
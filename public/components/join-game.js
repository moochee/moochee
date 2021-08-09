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

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>Game {props.gameId}</h1>
        <input style={{ width: '100%' }} id='playerName' placeholder='Enter your name' value={playerName} onInput={updatePlayerName}></input>
        <button style={{ width: '100%' }} onClick={join}>Join</button>
        <div>{errorMessage}</div>
    </div>
}
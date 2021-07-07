'use strict'

function Entrance(props) {
    // TODO enable join button only when correct game id (e.g. exactly 6 numbers)
    const [gameId, setGameId] = React.useState('')
    const updateGameId = (event) => setGameId(event.target.value)
    const [playerName, setPlayerName] = React.useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value)

    const join = async () => {
        // TODO do we get avatar back? and if yes, what to do with it?
        await props.adapter.join(gameId, playerName)
        props.onJoin(gameId, playerName)
    }

    const host = async () => {
        const gameId = await props.adapter.host()
        props.onHost(gameId)
    }

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <ui5-title level="H1">Welcome to the Gorilla Quiz App!</ui5-title>
        <ui5-title level="H4">Host a new game or joing an existing one</ui5-title>
        <p />
        <ui5-button onClick={host}>Host Game</ui5-button>
        <ui5-panel header-text="Join Game">
            <ui5-label for="gameId" required>Game id</ui5-label>
            <ui5-input style={{ width: "100%" }} id="gameId" placeholder="Enter game id" value={gameId} onInput={updateGameId}></ui5-input>
            <p />
            <ui5-label for="playerName" required>Name</ui5-label>
            <ui5-input style={{ width: "100%" }} id="playerName" placeholder="Enter your name" value={playerName} onInput={updatePlayerName}></ui5-input>
            <p />
            <ui5-button style={{ width: "100%" }} onClick={join}>Join</ui5-button>
        </ui5-panel>
    </div>
}

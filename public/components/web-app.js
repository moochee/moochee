'use strict'

Gorilla.HostGameWeb = function (props) {
    const [atEntrance, setAtEntrance] = React.useState(true)
    const [gameId, setGameId] = React.useState('')
    const [quizTitle, setQuizTitle] = React.useState('')

    const host = (gameId, quizTitle) => {
        setGameId(gameId)
        setQuizTitle(quizTitle)
        setAtEntrance(false)
    }

    const home = () => setAtEntrance(true)

    return atEntrance ?
        <Gorilla.Entrance adapter={props.adapter} onHost={host} /> :
        <Gorilla.HostGame gameId={gameId} adapter={props.adapter} quizTitle={quizTitle} onBackHome={home} />
}

Gorilla.PlayGameWeb = function (props) {
    const { gameId } = ReactRouterDOM.useParams()
    const [atJoinGame, setAtJoinGame] = React.useState(true)
    const [playerName, setPlayerName] = React.useState('')
    const [playerAvatar, setPlayerAvatar] = React.useState('')
    const [otherPlayers, setOtherPlayers] = React.useState([])

    const join = (playerName, playerAvatar, otherPlayers) => {
        setAtJoinGame(false)
        setPlayerName(playerName)
        setPlayerAvatar(playerAvatar)
        setOtherPlayers(otherPlayers)
    }
    const addPlayer = (otherPlayer) => {
        setOtherPlayers((oldOtherPlayers) => [...oldOtherPlayers, otherPlayer])
    }

    const removePlayer = (player) => {
        setOtherPlayers((oldPlayers) => oldPlayers.filter(p => p != player))
    }
    return atJoinGame ?
        <Gorilla.JoinGame gameId={gameId} adapter={props.adapter} onJoin={join} /> :
        <Gorilla.PlayGame gameId={gameId} adapter={props.adapter}
            playerName={playerName} playerAvatar={playerAvatar} otherPlayers={otherPlayers}
            onPlayerJoined={addPlayer} onPlayerDisconnected={removePlayer} />
}

Gorilla.WebApp = function (props) {
    const { HashRouter, Switch, Route } = ReactRouterDOM

    return <div style={{ height: '100%', width: '100%' }}>
        <HashRouter>
            <Switch>
                <Route exact path='/'>
                    <Gorilla.HostGameWeb adapter={props.adapter} />
                </Route>
                <Route path='/play/:gameId'>
                    <Gorilla.PlayGameWeb adapter={props.adapter} />
                </Route>
            </Switch>
        </HashRouter>
    </div>
}

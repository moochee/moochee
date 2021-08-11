'use strict'

// REVISE merge those things together, cause anyway there is state in the transition
Gorilla.EntranceWeb = function (props) {
    const history = ReactRouterDOM.useHistory()
    const host = (gameId, quizTitle) => {
        props.onHost(quizTitle)
        history.push(`host/${gameId}`)
    }
    return <Gorilla.Entrance adapter={props.adapter} onHost={host} />
}

Gorilla.HostGameWeb = function (props) {
    const { gameId } = ReactRouterDOM.useParams()
    const history = ReactRouterDOM.useHistory()
    // REVISE check if can find a better name for onReplay - basically it is sending the host back to the home page to be able to host another quiz if he/she wants to
    return <div style={{ height: '100%' }}>
        <Gorilla.HostGame gameId={gameId} adapter={props.adapter} quizTitle={props.quizTitle} onReplay={() => history.push('/')} />
    </div>
}

Gorilla.PlayGameWeb = function (props) {
    const { gameId, playerName } = ReactRouterDOM.useParams()
    return <div style={{ height: '100%' }}>
        <Gorilla.PlayGame gameId={gameId} adapter={props.adapter} playerName={playerName} playerAvatar={props.avatar} otherPlayers={props.otherPlayers} onPlayerJoined={props.onPlayerJoined} onPlayerDisconnected={props.onPlayerDisconnected} />
    </div>
}

Gorilla.JoinGameWeb = function (props) {
    const { gameId } = ReactRouterDOM.useParams()
    const history = ReactRouterDOM.useHistory()

    const join = (playerName, avatar, otherPlayers) => {
        history.push(`${gameId}/${playerName}`)
        props.onJoin(avatar, otherPlayers)
    }

    return <Gorilla.JoinGame gameId={gameId} adapter={props.adapter} onJoin={join} />
}

Gorilla.WebApp = function (props) {
    const { HashRouter, Switch, Route } = ReactRouterDOM
    const [avatar, setAvatar] = React.useState('')
    const [otherPlayers, setOtherPlayers] = React.useState([])
    const [quizTitle, setQuizTitle] = React.useState('')

    const join = (avatar, otherPlayers) => {
        setAvatar(avatar)
        setOtherPlayers(otherPlayers)
    }

    const addPlayer = (otherPlayer) => {
        setOtherPlayers((oldOtherPlayers) => [...oldOtherPlayers, otherPlayer])
    }

    const removePlayer = (player) => {
        setOtherPlayers((oldPlayers) => oldPlayers.filter(p => p != player))
    }

    // REVISE merge entrance/entranceweb with hostgame/hostgameweb and joingame/joingameweb with playgame/playgameweb
    //        by this, we won't need the title and avatar bubbling all the way up and down any more
    return <div style={{ height: '100%', width: '100%' }}>
        <HashRouter>
            <Switch>
                <Route exact path='/'>
                    <Gorilla.EntranceWeb adapter={props.adapter} onHost={setQuizTitle} />
                </Route>
                <Route path='/play/:gameId/:playerName'>
                    <Gorilla.PlayGameWeb adapter={props.adapter} avatar={avatar} otherPlayers={otherPlayers} onPlayerJoined={addPlayer} onPlayerDisconnected={removePlayer} />
                </Route>
                <Route path='/play/:gameId'>
                    <Gorilla.JoinGameWeb adapter={props.adapter} onJoin={join} />
                </Route>
                <Route path='/host/:gameId'>
                    <Gorilla.HostGameWeb adapter={props.adapter} quizTitle={quizTitle} />
                </Route>
            </Switch>
        </HashRouter>
    </div>
}

'use strict'

Gorilla.EntranceWeb = function (props) {
    const history = ReactRouterDOM.useHistory()
    return <Gorilla.Entrance adapter={props.adapter} onHost={gameId => history.push(`host/${gameId}`)} />
}

Gorilla.HostGameWeb = function (props) {
    const { gameId } = ReactRouterDOM.useParams()
    return <div style={{ height: '100%' }}>
        <Gorilla.HostGame gameId={gameId} adapter={props.adapter} />
    </div>
}

Gorilla.PlayGameWeb = function (props) {
    const { gameId, playerName } = ReactRouterDOM.useParams()
    return <div style={{ height: '100%' }}>
        <Gorilla.PlayGame gameId={gameId} playerName={playerName} playerAvatar={props.avatar} adapter={props.adapter} />
    </div>
}

Gorilla.EnterGameWeb = function (props) {
    const { gameId } = ReactRouterDOM.useParams()
    const [playerName, setPlayerName] = React.useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value)
    const [errorMessage, setErrorMessage] = React.useState('')
    const history = ReactRouterDOM.useHistory()

    const join = async () => {
        try {
            const playerAvatar = await props.adapter.join(gameId, playerName)
            props.onJoin(gameId, playerName, playerAvatar)
            history.push(`${gameId}/${playerName}`)
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>Game {gameId}</h1>
        <input style={{ width: '100%' }} id='playerName' placeholder='Enter your name' value={playerName} onInput={updatePlayerName}></input>
        <button style={{ width: '100%' }} onClick={join}>Join</button>
        <div>{errorMessage}</div>
    </div>
}

Gorilla.WebApp = function (props) {
    const { HashRouter, Switch, Route } = ReactRouterDOM

    const [avatar, setAvatar] = React.useState('')

    const join = (gameId, playerName, playerAvatar) => {
        setAvatar(playerAvatar)
    }

    return <div style={{ height: '100%', width: '100%' }}>
        <HashRouter>
            <Switch>
                <Route exact path='/'>
                    <Gorilla.EntranceWeb adapter={props.adapter} />
                </Route>
                <Route path='/play/:gameId/:playerName'>
                    <Gorilla.PlayGameWeb adapter={props.adapter} avatar={avatar} />
                </Route>
                <Route path='/play/:gameId'>
                    <Gorilla.EnterGameWeb adapter={props.adapter} onJoin={join} />
                </Route>
                <Route path='/host/:gameId'>
                    <Gorilla.HostGameWeb adapter={props.adapter} />
                </Route>
            </Switch>
        </HashRouter>
    </div>
}

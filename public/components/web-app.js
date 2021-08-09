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
    const history = ReactRouterDOM.useHistory()

    const join = (playerName, avatar) => {
        history.push(`${gameId}/${playerName}`)
        props.onJoin(avatar)
    }

    return <Gorilla.JoinGame gameId={gameId} adapter={props.adapter} onJoin={join} />
}

Gorilla.WebApp = function (props) {
    const { HashRouter, Switch, Route } = ReactRouterDOM
    const [avatar, setAvatar] = React.useState('')

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
                    <Gorilla.EnterGameWeb adapter={props.adapter} onJoin={setAvatar} />
                </Route>
                <Route path='/host/:gameId'>
                    <Gorilla.HostGameWeb adapter={props.adapter} />
                </Route>
            </Switch>
        </HashRouter>
    </div>
}

'use strict'

import Entrance from '../entrance/entrance.jsx'
import Host from '../host/host.jsx'
import Join from '../join/join.jsx'
import Play from '../play/play.jsx'

const HostGameWeb = function (props) {
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
        <Entrance adapter={props.adapter} onHost={host} /> :
        <Host gameId={gameId} adapter={props.adapter} quizTitle={quizTitle} onBackHome={home} />
}

const PlayGameWeb = function (props) {
    // Exception for linter, cause generally we want to restrict usage of ReactRouterDOM
    // eslint-disable-next-line no-undef
    const { gameId } = ReactRouterDOM.useParams()
    const [atJoinGame, setAtJoinGame] = React.useState(true)
    const [playerName, setPlayerName] = React.useState('')
    const [playerAvatar, setPlayerAvatar] = React.useState('')
    const [otherPlayers, setOtherPlayers] = React.useState([])
    const [quizTitle, setQuizTitle] = React.useState('')

    const join = (quizTitle, playerName, playerAvatar, otherPlayers) => {
        setPlayerName(playerName)
        setPlayerAvatar(playerAvatar)
        setOtherPlayers(otherPlayers)
        setQuizTitle(quizTitle)
        setAtJoinGame(false)
    }

    const addPlayer = (otherPlayer) => {
        setOtherPlayers((oldOtherPlayers) => [...oldOtherPlayers, otherPlayer])
    }

    const removePlayer = (player) => {
        setOtherPlayers((oldPlayers) => oldPlayers.filter(p => p != player))
    }

    return atJoinGame ?
        <Join gameId={gameId} adapter={props.adapter} onJoin={join} /> :
        <Play gameId={gameId} adapter={props.adapter} quizTitle={quizTitle}
            playerName={playerName} playerAvatar={playerAvatar} otherPlayers={otherPlayers}
            onPlayerJoined={addPlayer} onPlayerDisconnected={removePlayer} />
}

export default function WebApp(props) {
    // Exception for linter, cause generally we want to restrict usage of ReactRouterDOM
    // eslint-disable-next-line no-undef
    const { HashRouter, Switch, Route } = ReactRouterDOM

    return <HashRouter>
        <Switch>
            <Route exact path='/'>
                <HostGameWeb adapter={props.adapter} />
            </Route>
            <Route path='/play/:gameId'>
                <PlayGameWeb adapter={props.adapter} />
            </Route>
        </Switch>
    </HashRouter>
}

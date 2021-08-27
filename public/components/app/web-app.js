'use strict'

import { html, useState, useEffect } from '/lib/preact-3.1.0.standalone.module.js'
import Entrance from '/components/entrance/entrance.js'
import Host from '/components/host/host.js'
import Join from '/components/join/join.js'
import Play from '/components/play/play.js'

const HostGameWeb = function (props) {
    const [atEntrance, setAtEntrance] = useState(true)
    const [gameId, setGameId] = useState('')
    const [quizTitle, setQuizTitle] = useState('')

    const host = (gameId, quizTitle) => {
        setGameId(gameId)
        setQuizTitle(quizTitle)
        setAtEntrance(false)
    }

    const home = () => setAtEntrance(true)

    return atEntrance ?
        html`<${Entrance} adapter=${props.adapter} onHost=${host} />` :
        html`<${Host} gameId=${gameId} adapter=${props.adapter} quizTitle=${quizTitle} onBackHome=${home} />`
}

const PlayGameWeb = function (props) {
    const [atJoinGame, setAtJoinGame] = useState(true)
    const [playerName, setPlayerName] = useState('')
    const [playerAvatar, setPlayerAvatar] = useState('')
    const [otherPlayers, setOtherPlayers] = useState([])
    const [quizTitle, setQuizTitle] = useState('')

    const hashChanged = () => {
        setAtJoinGame(true)
    }
    useEffect(() => {
        addEventListener('hashchange', hashChanged)
        return () => removeEventListener('hashchange', hashChanged)
    })

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
        html`<${Join} gameId=${props.gameId} adapter=${props.adapter} onJoin=${join} />` :
        html`<${Play} gameId=${props.gameId} adapter=${props.adapter} quizTitle=${quizTitle}
            playerName=${playerName} playerAvatar=${playerAvatar} otherPlayers=${otherPlayers}
            onPlayerJoined=${addPlayer} onPlayerDisconnected=${removePlayer} />`
}

export default function WebApp(props) {
    const [hash, setHash] = useState(window.location.hash)
    const hashChanged = () => {
        setHash(window.location.hash)
    }
    useEffect(() => {
        addEventListener('hashchange', hashChanged)
        return () => removeEventListener('hashchange', hashChanged)
    })

    const gameId = (hash.indexOf('#/play/') > -1) ? hash.split('/')[2] : ''
    return gameId
        ? html`<${PlayGameWeb} gameId=${gameId} adapter=${props.adapter} />`
        : html`<${HostGameWeb} adapter=${props.adapter} />`
}

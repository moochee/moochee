'use strict'

import { html, useState, useEffect } from '/public/lib/preact-3.1.0.standalone.module.js'
import Entrance from '/public/components/entrance/entrance.js'
import Host from '/public/components/host/host.js'
import Join from '/public/components/join/join.js'
import Play from '/public/components/play/play.js'

const HostGameWeb = function (props) {
    const [atEntrance, setAtEntrance] = useState(true)
    const [gameId, setGameId] = useState('')
    const [quizTitle, setQuizTitle] = useState('')

    const onGameStarted = (gameId, quizTitle) => {
        setGameId(gameId)
        setQuizTitle(quizTitle)
        setAtEntrance(false)
    }

    useEffect(() => {
        props.client.subscribe('gameStarted', onGameStarted)
        return () => props.client.unsubscribe('gameStarted')
    }, [])

    const home = () => setAtEntrance(true)

    return atEntrance ?
        html`<${Entrance} client=${props.client} />` :
        html`<${Host} gameId=${gameId} client=${props.client} quizTitle=${quizTitle} onBackHome=${home} />`
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

    const onJoiningOk = (quizTitle, name, avatar, otherPlayers) => {
        setPlayerName(name)
        setPlayerAvatar(avatar)
        setOtherPlayers(otherPlayers)
        setQuizTitle(quizTitle)
        setAtJoinGame(false)
    }

    useEffect(() => {
        addEventListener('hashchange', hashChanged)
        props.client.subscribe('joiningOk', onJoiningOk)
        return () => {
            removeEventListener('hashchange', hashChanged)
            props.client.unsubscribe('joiningOk')
        }
    }, [])

    const addPlayer = (otherPlayer) => {
        setOtherPlayers((oldOtherPlayers) => [otherPlayer, ...oldOtherPlayers])
    }

    const removePlayer = (player) => {
        setOtherPlayers((oldPlayers) => oldPlayers.filter(p => p != player))
    }

    return atJoinGame ?
        html`<${Join} gameId=${props.gameId} client=${props.client} />` :
        html`<${Play} gameId=${props.gameId} client=${props.client} quizTitle=${quizTitle}
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
    }, [])

    const gameId = (hash.indexOf('#/play/') > -1) ? hash.split('/')[2] : ''
    return gameId
        ? html`<${PlayGameWeb} gameId=${gameId} client=${props.client} />`
        : html`<${HostGameWeb} client=${props.client} />`
}

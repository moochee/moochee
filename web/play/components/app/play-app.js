'use strict'

import { html, useState, useEffect } from '../../../../node_modules/htm/preact/standalone.mjs'
import Join from '../join/join.js'
import Play from '../play/play.js'

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
        window.addEventListener('hashchange', hashChanged)
        props.client.subscribe('joiningOk', onJoiningOk)
        return () => {
            window.removeEventListener('hashchange', hashChanged)
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

export default function PlayApp(props) {
    const [hash, setHash] = useState(window.location.hash)

    const hashChanged = () => {
        setHash(window.location.hash)
    }

    useEffect(() => {
        window.addEventListener('hashchange', hashChanged)
        return () => window.removeEventListener('hashchange', hashChanged)
    }, [])

    const gameId = (hash.indexOf('#/game/') > -1) ? hash.split('/')[2] : ''
    return gameId ? html`<${PlayGameWeb} gameId=${gameId} client=${props.client} />` : ''
}

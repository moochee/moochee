'use strict'

import { html, useState, useEffect } from '/public/lib/preact-3.1.0.standalone.module.js'
import Entrance from '/components/entrance/entrance.js'
import Host from '/components/host/host.js'
import QuizCreator from '/components/quiz-creator/quiz-creator.js'
import Admin from '/components/admin/admin.js'
import QuizSocketClient from '/public/quiz-socket-client.js'

const HostGameWeb = function (props) {
    const [atEntrance, setAtEntrance] = useState(true)
    const [gameId, setGameId] = useState('')
    const [quizTitle, setQuizTitle] = useState('')
    const [client, setClient] = useState()

    const onGameStarted = (gameId, quizTitle) => {
        setGameId(gameId)
        setQuizTitle(quizTitle)
        setAtEntrance(false)
    }

    const onGameCreated = (origin, gameId, quizTitle) => {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${origin}`
        setClient(new QuizSocketClient(() => new WebSocket(wsUrl)))
        setGameId(gameId)
        setQuizTitle(quizTitle)
        setAtEntrance(false)
    }

    useEffect(() => {
        if (window.location.hash.indexOf('?newGameCreate') > -1) {
            props.client.subscribe('gameCreated', onGameCreated)
            return () => props.client.unsubscribe('gameCreated')
        }
        props.client.subscribe('gameStarted', onGameStarted)
        return () => props.client.unsubscribe('gameStarted')
    }, [])

    const home = () => setAtEntrance(true)

    return atEntrance ?
        html`<${Entrance} client=${props.client} />` :
        html`<${Host} origin=${origin} gameId=${gameId} client=${client} quizTitle=${quizTitle} onBackHome=${home} />`
}

export default function HostApp(props) {
    const [hash, setHash] = useState(window.location.hash)

    const hashChanged = () => {
        setHash(window.location.hash)
    }

    useEffect(() => {
        addEventListener('hashchange', hashChanged)
        return () => removeEventListener('hashchange', hashChanged)
    }, [])

    let page
    if (hash.indexOf('#/create') > -1) {
        page = html`<${QuizCreator} />`
    } else if (hash.indexOf('#/admin') > -1) {
        page = html`<${Admin} />`
    } else {
        page = html`<${HostGameWeb} client=${props.client} />`
    }
    return page
}

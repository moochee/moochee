'use strict'

import { html, useState, useEffect } from '/public/lib/preact-3.1.0.standalone.module.js'
import Entrance from '/components/entrance/entrance.js'
import Host from '/components/host/host.js'
import QuizCreator from '/components/quiz-creator/quiz-creator.js'

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

export default function HostApp(props) {
    const [hash, setHash] = useState(window.location.hash)

    const hashChanged = () => {
        setHash(window.location.hash)
    }

    useEffect(() => {
        addEventListener('hashchange', hashChanged)
        return () => removeEventListener('hashchange', hashChanged)
    }, [])

    const inQuizCreator = (hash.indexOf('#/create') > -1) ? true : false
    return inQuizCreator ?
        html`<${QuizCreator} />` :
        html`<${HostGameWeb} client=${props.client} />`
}

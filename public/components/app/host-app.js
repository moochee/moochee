'use strict'

import { html, useState, useEffect } from '/public/lib/preact-3.1.0.standalone.module.js'
import Entrance from '/public/components/entrance/entrance.js'
import Host from '/public/components/host/host.js'

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
    return html`<${HostGameWeb} client=${props.client} />`
}

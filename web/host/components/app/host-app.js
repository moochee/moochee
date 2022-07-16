'use strict'

import { html, useState, useEffect } from '/lib/htm/preact/standalone.module.js'
import Entrance from '../entrance/entrance.js'
import Host from '../host/host.js'
import QuizEditor from '../quiz-editor/quiz-editor.js'
import Admin from '../admin/admin.js'
import QuizInfo from '../quiz-info/quiz-info.js'

const HostGameWeb = function (props) {
    const [state, setState] = useState({ atEntrance: true, gameId: '', quizTitle: '', origin: '', client: null })

    const onGameStarted = (gameId, quizTitle) => {
        setState({atEntrance: false, gameId, quizTitle})
    }

    useEffect(() => {
        props.client.subscribe('gameStarted', onGameStarted)
        return () => props.client.unsubscribe('gameStarted')
    }, [])

    const home = () => setState({ atEntrance: true, gameId: '', quizTitle: '', origin: '', client: null })

    const {atEntrance, client, gameId, quizTitle} = state

    return atEntrance ?
        html`<${Entrance} client=${props.client} />` :
        html`<${Host} origin=${origin} client=${client || props.client} gameId=${gameId} quizTitle=${quizTitle} onBackHome=${home} />`
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
        page = html`<${QuizEditor} />`
    } else if (hash.indexOf('#/edit') > -1 ) {
        const id = hash.split('/')[2]
        page = html`<${QuizEditor} id=${id} />`
    } else if (hash.indexOf('#/admin') > -1) {
        page = html`<${Admin} />`
    } else if (hash.indexOf('#/show') > -1) {
        const id = hash.split('/')[2]
        page = html`<${QuizInfo} id=${id} />`
    } else {
        page = html`<${HostGameWeb} client=${props.client} />`
    }
    return page
}

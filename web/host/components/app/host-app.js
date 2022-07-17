'use strict'

import { html, useState, useEffect } from '/lib/htm/preact/standalone.module.js'
import Entrance from '../entrance/entrance.js'
import Host from '../host/host.js'
import QuizEditor from '../quiz-editor/quiz-editor.js'
import Admin from '../admin/admin.js'
import QuizInfo from '../quiz-info/quiz-info.js'

const HostGameWeb = function (props) {
    const [state, setState] = useState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '', hostIsPlayer: false })

    const onGameStarted = (gameId, quizTitle, hostIsPlayer) => {
        setState({ pageId: 'host', gameId, quizTitle, quizId, hostIsPlayer })
    }

    const onShowInfo = (quizId) => {
        setState({ pageId: 'quiz-info', gameId: '', quizTitle: '', quizId, hostIsPlayer })
    }

    useEffect(() => {
        props.client.subscribe('gameStarted', onGameStarted)
        return () => props.client.unsubscribe('gameStarted')
    }, [])

    const home = () => setState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '', hostIsPlayer: false })

    const { pageId, gameId, quizTitle, quizId, hostIsPlayer } = state

    let page 
    if ( pageId === 'entrance' ) {
        page = html`<${Entrance} client=${props.client} onShowInfo=${onShowInfo}/>`
    } else if (pageId === 'quiz-info') {
        page = html`<${QuizInfo} client=${props.client} id=${quizId} onBackHome=${home} />`
    } else if (pageId === 'host') {
        page = html`<${Host} client=${props.client} gameId=${gameId} quizTitle=${quizTitle} hostIsPlayer=${hostIsPlayer} onBackHome=${home} />`
    }
    return page
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
    } else {
        page = html`<${HostGameWeb} client=${props.client} />`
    }
    return page
}

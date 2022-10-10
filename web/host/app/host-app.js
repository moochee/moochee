import { html, useState, useEffect } from '../../../node_modules/htm/preact/standalone.mjs'
import Entrance from '../entrance/entrance.js'
import Host from '../host/host.js'
import QuizEditor from '../quiz-editor/quiz-editor.js'
import Admin from '../admin/admin.js'
import QuizInfo from '../quiz-info/quiz-info.js'
import History from '../game-history/history.js'

const HostGameWeb = function (props) {
    const [state, setState] = useState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '' })
    const [hostIsPlayer, setHostIsPlayer] = useState(false)

    const onHostJoined = (gameId, quizTitle) => {
        setState({ pageId: 'host', gameId, quizTitle, quizId: state.quizId })
    }

    const onShowInfo = (quizId) => {
        setState({ pageId: 'quiz-info', gameId: state.gameId, quizTitle: state.quizTitle, quizId })
    }

    const home = () => setState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '' })

    const hostAndPlay = async (quizId, quizTitle) => {
        setHostIsPlayer(true)
        await props.client.host(quizId, quizTitle)
    }
    const hostOnly = async (quizId, quizTitle) => {
        setHostIsPlayer(false)
        await props.client.host(quizId, quizTitle)
    }

    useEffect(() => {
        props.client.subscribe('hostJoined', onHostJoined)
        return () => props.client.unsubscribe('hostJoined')
    }, [])

    let page 
    if ( state.pageId === 'entrance' ) {
        page = html`<${Entrance} client=${props.client} onShowInfo=${onShowInfo} onPlay=${hostOnly} />`
    } else if (state.pageId === 'quiz-info') {
        page = html`<${QuizInfo} id=${state.quizId} onBackHome=${home} onPlay=${hostAndPlay} onHost=${hostOnly} />`
    } else if (state.pageId === 'host') {
        page = html`<${Host} client=${props.client} gameId=${state.gameId} quizTitle=${state.quizTitle} hostIsPlayer=${hostIsPlayer} onBackHome=${home} />`
    }
    return page
}

export default function HostApp(props) {
    const [hash, setHash] = useState(window.location.hash)

    const hashChanged = () => {
        setHash(window.location.hash)
    }

    useEffect(() => {
        window.addEventListener('hashchange', hashChanged)
        return () => window.removeEventListener('hashchange', hashChanged)
    }, [])

    let page
    if (hash.indexOf('#/create') > -1) {
        page = html`<${QuizEditor} />`
    } else if (hash.indexOf('#/edit') > -1 ) {
        const id = hash.split('/')[2]
        page = html`<${QuizEditor} id=${id} />`
    } else if (hash.indexOf('#/admin') > -1) {
        page = html`<${Admin} />`
    } else if (hash.indexOf('#/history') > -1) {
        page = html`<${History} />`
    } else {
        page = html`<${HostGameWeb} client=${props.client} />`
    }
    return page
}

import { html, useState, useEffect } from '../../../node_modules/htm/preact/standalone.mjs'
import Entrance from '../entrance/entrance.js'
import Host from '../host/host.js'
import QuizEditor from '../quiz-editor/quiz-editor.js'
import Admin from '../admin/admin.js'
import QuizInfo from '../quiz-info/quiz-info.js'
import History from '../game-history/history.js'
import MyQuizzes from '../my-quizzes/my-quizzes.js'

const HostGameWeb = function (props) {
    const [state, setState] = useState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '' })

    const onHostJoined = (gameId, quizTitle) => {
        setState({ pageId: 'host', gameId, quizTitle, quizId: state.quizId })
    }

    const onShowInfo = (quizId) => {
        setState({ pageId: 'quiz-info', gameId: state.gameId, quizTitle: state.quizTitle, quizId })
    }

    const home = () => setState({ pageId: 'entrance', gameId: '', quizTitle: '', quizId: '' })

    const host = async (quizId, quizTitle) => {
        await props.client.host(quizId, quizTitle)
    }

    useEffect(() => {
        props.client.subscribe('hostJoined', onHostJoined)
        return () => props.client.unsubscribe('hostJoined')
    }, [])

    let page 
    if ( state.pageId === 'entrance' ) {
        page = html`<${Entrance} client=${props.client} onShowInfo=${onShowInfo} onHost=${host} />`
    } else if (state.pageId === 'quiz-info') {
        page = html`<${QuizInfo} id=${state.quizId} onBackHome=${home} onHost=${host} />`
    } else if (state.pageId === 'host') {
        page = html`<${Host} client=${props.client} gameId=${state.gameId} quizTitle=${state.quizTitle} onBackHome=${home} />`
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
    } else if (hash.indexOf('#/my-quizzes') > -1) {
        page = html`<${MyQuizzes} />`
    } else if (hash.indexOf('#/history') > -1) {
        page = html`<${History} />`
    } else {
        page = html`<${HostGameWeb} client=${props.client} />`
    }
    return page
}

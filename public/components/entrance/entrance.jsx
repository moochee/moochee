'use strict'

import loadCss from '../../load-css.js'
import Shell from '../shell/shell.jsx'
import StickyButton from '../sticky/sticky-button.jsx'

loadCss('components/entrance/entrance.css')

export default function Entrance(props) {
    const [quizzes, setQuizzes] = React.useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    React.useEffect(async () => {
        const list = await props.adapter.getQuizzes()
        list.forEach((entry, index) => entry.color = colors[index % 4])
        setQuizzes(list)
    }, [])

    const host = async (quizId, quizTitle) => {
        const gameId = await props.adapter.host(quizId)
        props.onHost(gameId, quizTitle)
    }

    const quizList = quizzes.map((q) => {
        return <div key={q.id} className='entranceQuiz'>
            <StickyButton onClick={() => host(q.id, q.text)} text={q.text} color={q.color} />
        </div>
    })

    return <Shell headerCenter='Welcome to the 🦍 Quiz'>
        <div className='entrance'>
            <h1 className='entranceTitle'>Select a quiz to host a new game</h1>
            <div className='entranceQuizzes'>
                {quizList}
            </div>
        </div>
    </Shell>
}

'use strict'

import { html, useEffect, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'
import StickyButton from '/public/components/sticky/sticky-button.js'

loadCss('/components/entrance/entrance.css')

export default function Entrance(props) {
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    const onQuizzesReceived = (quizzes) => {
        quizzes.forEach((entry, index) => entry.color = colors[index % 4])
        setQuizzes(quizzes)
    }

    useEffect(() => {
        props.client.subscribe('quizzesReceived', onQuizzesReceived)
        props.client.getQuizzes()
        return () => props.client.unsubscribe('quizzesReceived')
    }, [])

    const host = (quizId) => {
        props.client.host(quizId)
    }

    const quizList = quizzes.map((q) => {
        return html`<div key=${q.id} class=entranceQuiz>
            <${StickyButton} onClick=${() => host(q.id, q.title)} text=${q.title} color=${q.color} />
        </div>`
    })

    return html`<${Shell} headerCenter='Welcome to the 🦍 Quiz'>
        <div class=entrance>
            <h1 class=entranceTitle>Select a quiz to host a new game</h1>
            <div class=entranceQuizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

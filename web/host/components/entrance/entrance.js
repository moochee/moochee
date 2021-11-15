'use strict'

import { html, useEffect, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'
import StickyButton from '/public/components/sticky/sticky-button.js'

loadCss('/components/entrance/entrance.css')

function AdminButton() {
    const click = () => window.location.href = '/#/admin'
    return html`<div class=entranceAdminButton onclick=${click}>⚙️</div>`
}

export default function Entrance(props) {
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple', 'red', 'yellow', 'petrol']

    useEffect(() => {
        const getQuizzes = async () => {
            const quizList = await (await fetch('/api/v1/quizzes')).json()
            quizList.forEach((entry, index) => entry.color = colors[index % 7])
            setQuizzes(quizList)
        }
        getQuizzes()
    }, [])

    const host = (quizId, quizTitle) => {
        props.client.host(quizId, quizTitle)
    }

    const quizList = quizzes.map((q) => {
        return html`<div key=${q.id} class=entranceQuiz>
            <${StickyButton} onClick=${() => host(q.id, q.title)} text=${q.title} color=${q.color} />
        </div>`
    })

    const adminButton = html`<${AdminButton} />`

    return html`<${Shell} headerCenter='Welcome to the 🦍 Quiz' headerRight=${adminButton}>
        <div class=entrance>
            <div class=entranceTitle>Select a quiz to host a new game</div>
            <div class=entranceQuizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

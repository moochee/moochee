'use strict'

import { html, useEffect, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'
import StickyCard from '/public/components/sticky/sticky-card.js'

loadCss('/components/admin/admin.css')

export default function Admin() {
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple', 'red', 'yellow', 'petrol']

    useEffect(() => {
        const getQuizzes = async () => {
            const quizList = await (await fetch('/api/v1/quizzes?private=true')).json()
            quizList.forEach((entry, index) => entry.color = colors[index % 7])
            setQuizzes(quizList)
        }
        getQuizzes()
    }, [])

    const quizList = quizzes.map((q, i) => {
        const deleteQuiz = async () => {
            const response = await fetch(`/api/v1/quizzes/${q.id}`, { method: 'DELETE' })
            if (response.ok) setQuizzes(oldQuizzes => { return oldQuizzes.filter(o => o.id !== q.id) })
        }
        return html`<div key=${q.id} class=adminQuiz>
            <${StickyCard} onClick=${deleteQuiz} text=${q.title} color=${q.color} />
            <button id=${i} onclick=${deleteQuiz} class=adminSmallButton>Delete</button>
        </div>`
    })

    return html`<${Shell} headerCenter='Manage My Quizzes'>
        <div class=admin>
            <div class=adminAction>
                <a href='#/create'>Create New Quiz</a>
            </div>
            <div class=adminQuizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

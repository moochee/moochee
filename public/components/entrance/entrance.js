'use strict'

import { html, useEffect, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'
import Shell from '../shell/shell.js'
import StickyButton from '../sticky/sticky-button.js'

loadCss('components/entrance/entrance.css')

export default function Entrance(props) {
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    useEffect(async () => {
        const list = await props.adapter.getQuizzes()
        list.forEach((entry, index) => entry.color = colors[index % 4])
        setQuizzes(list)
    }, [])

    const host = async (quizId, quizTitle) => {
        const gameId = await props.adapter.host(quizId)
        props.onHost(gameId, quizTitle)
    }

    const quizList = quizzes.map((q) => {
        return html`<div key=${q.id} class=entranceQuiz>
            <${StickyButton} onClick=${() => host(q.id, q.text)} text=${q.text} color=${q.color} />
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

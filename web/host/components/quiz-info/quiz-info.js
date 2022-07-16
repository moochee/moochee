'use strict'

import { html, useState, useEffect } from '/lib/htm/preact/standalone.module.js'
import Shell from '/public/components/shell/shell.js'

import loadCss from '/public/load-css.js'
loadCss('/tryout/components/quiz-info/quiz-info.css')

export default function(props) {
    const [title, setTitle] = useState('')
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        const getQuiz = async () => {
            if (props.id) {
                const quiz = await (await fetch(`/api/v1/quizzes/${props.id}`)).json()
                setTitle(quiz.title)
                setQuestions(quiz.questions)
            }
        }
        getQuiz()
    }, [])

    const play = () => null
    const host = () => null
    const backToHome = () => window.location.href = '#/'
    const back=html`<a class=adminBack href='#/'>${'<'}</a>`

    const questionsBlock = questions.map((question) => {
        return html`
            <div key=${question.id} class=question>${question.text}</div
        `
    })

    const actions = html`
        <div class=quizInfoMainActions>
            <button onclick=${play}>Play</button>
            <button onclick=${host}>Host</button>
            <button onclick=${backToHome}>Home</button>
        </div>
    `

    return html`<${Shell} headerLeft=${back} headerCenter='Quiz Info' footerRight=${actions}>
        <div class=quizInfo>
            <div class=title>${title}</div>
            <hr/>
            <div class=questions>${questionsBlock}</div>
        </div>
    <//>`
}

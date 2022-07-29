import { html, useState, useEffect } from '../../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../../public/components/shell/shell.js'

window.loadCss('/web/host/components/quiz-info/quiz-info.css')

export default function(props) {
    const [title, setTitle] = useState('')
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        const getQuiz = async () => {
            const quiz = await (await fetch(`/api/v1/quizzes/${props.id}`)).json()
            setTitle(quiz.title)
            setQuestions(quiz.questions)
        }
        getQuiz()
    }, [])

    const back=html`<div class=quizInfoBack onclick=${() => props.onBackHome()}>${'<'}</div>`

    const questionsBlock = questions.map((question) => {
        return html`
            <li key=${question.id} class=question>${question.text}</li>
        `
    })

    const actions = html`
        <div class=quizInfoMainActions>
            <button onclick=${() => props.onPlay(props.id, title)}>Play</button>
            <button onclick=${() => props.onHost(props.id, title)}>Host</button>
        </div>
    `

    return html`<${Shell} headerLeft=${back} headerCenter=${title} footerRight=${actions}>
        <div class=quizInfo>
            <ol>${questionsBlock}</ol>
        </div>
    <//>`
}

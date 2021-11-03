'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import Shell from '/public/components/shell/shell.js'
import StickyInput from '/public/components/sticky/sticky-input.js'

import loadCss from '/public/load-css.js'
loadCss('/components/quiz-creator/quiz-creator.css')

function Answer(props) {
    const input = (e) => props.onUpdateText(e.target.innerText)
    const change = () => props.onChangeCorrectAnswer()
    const checked = props.answer.correct ? true : false

    return html`<div class=quizCreatorAnswer>
        <${StickyInput} id=${props.id} color=${props.color} text=${props.answer.text} oninput=${input} />
        <input type=checkbox id=${props.id} checked=${checked} onchange=${change}/>
    </div>`
}

function Answers(props) {
    const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']

    const answersBlock = props.answers.map((answer, index) => {
        return html`<${Answer} id=${index} answer=${answer} color=${colors[index]}
            onUpdateText=${(text) => props.onUpdateText(index, text)} 
            onChangeCorrectAnswer=${() => props.onChangeCorrectAnswer(index)} />`
    })
    return html`<div class=quizCreatorAnswers>
        ${answersBlock}
    </div>`
}

export default function QuizCreator() {
    const [title, setTitle] = useState('Quiz 1')
    const [question, setQuestion] = useState('Question 1?')
    const [answers, setAnswers] = useState([
        { text: 'Answer 1', correct: true },
        { text: 'Answer 2' },
        { text: 'Answer 3' },
        { text: 'Answer 4' }
    ])

    const updateTitle = (e) => setTitle(e.target.innerText)

    const updateQuestion = (e) => setQuestion(e.target.innerText)

    const updateAnswerText = (index, text) => setAnswers(oldAnswers => {
        const newAnswers = [...oldAnswers]
        newAnswers[index].text = text
        return newAnswers
    })

    const changeCorrectAnswer = (index) => setAnswers(oldAnswers => {
        const newAnswers = oldAnswers.map(a => ({ text: a.text }))
        newAnswers[index].correct = true
        return newAnswers
    })

    const create = () => {
        const createQuiz = async (newQuiz) => {
            await fetch('/api/v1/quizzes', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newQuiz)
            })
        }
        const quiz = { title, questions: [{ text: question, answers: answers.filter(a => a.text) }] }
        createQuiz(quiz).then(() => location.href = '/')
    }

    const cancel = () => location.href = '/'

    return html`<${Shell} headerCenter='Quiz Creator'>
        <div>
            <h1 class=quizCreatorTitle contenteditable=true oninput=${updateTitle}>${title}</h1>
        </div>
        <hr />
        <h1 class=quizCreatorQuestion contenteditable=true oninput=${updateQuestion}>${question}</h1>
        <${Answers} answers=${answers} onUpdateText=${updateAnswerText} onChangeCorrectAnswer=${changeCorrectAnswer} />
        <div class=quizCreatorActions>
            <button id=create class=quizCreatorButton onclick=${create}>Create</button>
            <button id=cancel class=quizCreatorButton onclick=${cancel}>Cancel</button>
        </div>
    <//>`
}
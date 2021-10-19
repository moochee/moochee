'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'

function Answer(props) {
    const input = (e) => props.onUpdateText(e.target.value)
    const change = () => props.onChangeCorrectAnswer()
    const checked = props.answer.correct ? true : false

    return html`<div>
        <input oninput=${input} value=${props.answer.text}></input>
        <input type=checkbox id=${props.id} checked=${checked} onchange=${change}/>
    </div>`
}

function Answers(props) {
    const answersBlock = props.answers.map((answer, index) => {
        return html`<${Answer} id=${index} answer=${answer} 
            onUpdateText=${(text) => props.onUpdateText(index, text)} 
            onChangeCorrectAnswer=${() => props.onChangeCorrectAnswer(index)} />`
    })
    return html`${answersBlock}`
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

    const updateTitle = (e) => setTitle(e.target.value)

    const updateQuestion = (e) => setQuestion(e.target.value)

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

    const save = () => {
        const saveQuiz = async (newQuiz) => {
            console.log(newQuiz)
        }
        const quiz = { title, questions: [{ text: question, answers: answers.filter(a => a.text) }] }
        saveQuiz(quiz)
    }

    return html`
        <div>
            <label for=title>Title</label>
            <input id=title oninput=${updateTitle} value=${title}></input>
        </div>
        <div>
            <label for=question>Question</label>
            <input id=question oninput=${updateQuestion} value=${question}>$</input>
        </div>
        <${Answers} answers=${answers} onUpdateText=${updateAnswerText} onChangeCorrectAnswer=${changeCorrectAnswer} />
        <button id=save onclick=${save}>Save</button>
    `
}
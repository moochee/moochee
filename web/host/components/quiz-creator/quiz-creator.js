'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'

function Answer(props) {
    const updateText = (e) => props.onInput(e.target.value)

    const changeSelection = () => props.onSelect()

    const deleteAnswer = () => props.onDelete()

    return html`<div>
        <input type=radio id=${props.id} name=answer value=${props.text} 
            checked=${props.correct} onchange=${changeSelection} />
        <input oninput=${updateText} value=${props.text}></input>
        <button onclick=${deleteAnswer}>Delete</button>
    </div>
  `
}

export default function QuizCreator() {
    const [title, setTitle] = useState('Quiz 1')
    const [question, setQuestion] = useState('Question 1?')
    const [answers, setAnswers] = useState([
        { text: 'Answer 1', correct: true },
        { text: 'Answer 2' }
    ])

    const updateTitle = (e) => setTitle(e.target.value)

    const updateQuestion = (e) => setQuestion(e.target.value)

    const addAnswer = () => setAnswers(oldAnswers => {
        if (oldAnswers.length >= 4) return oldAnswers
        return [...oldAnswers, { text: '' }]
    })

    const save = () => {
        const saveQuiz = async (newQuiz) => {
            const payload = { ...newQuiz }
            console.log(payload)
        }
        const quiz = { title, questions: [{ text: question, answers: answers }] }
        saveQuiz(quiz)
    }

    const answersBlock = answers.map((a, i) => {
        const updateAnswerText = (answer) => setAnswers(oldAnswers => {
            const newAnswers = [...oldAnswers]
            newAnswers[i].text = answer
            return newAnswers
        })

        const markCorrectAnswer = () => setAnswers(oldAnswers => {
            const newAnswers = oldAnswers.map(a => ({ text: a.text }))
            newAnswers[i].correct = true
            return newAnswers
        })

        const deleteAnswer = () => setAnswers(oldAnswers => {
            if (oldAnswers.length === 2) return oldAnswers
            const newAnswers = oldAnswers.filter((_, index) => index !== i)
            return newAnswers
        })

        return html`<${Answer} id=${i} text=${a.text} correct=${a.correct} 
            onInput=${updateAnswerText} onSelect=${markCorrectAnswer} onDelete=${deleteAnswer} />`
    })

    return html`
        <div>
            <label for=title>Title</label>
            <input id=title oninput=${updateTitle} value=${title}></input>
        </div>
        <div>
            <label for=question>Question</label>
            <input id=question oninput=${updateQuestion} value=${question}>$</input>
            <button onclick=${addAnswer}>Add answer</button>
        </div>
        ${answersBlock}
        <button id=save onclick=${save}>Save</button>
    `
}
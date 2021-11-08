'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import Shell from '/public/components/shell/shell.js'
import StickyInput from '/public/components/sticky/sticky-input.js'

import loadCss from '/public/load-css.js'
loadCss('/components/quiz-creator/quiz-creator.css')

function Answer(props) {
    const input = (e) => props.onUpdateText(e.target.innerText)
    const change = () => props.onChangeCorrectAnswer()
    const checked = Boolean(props.answer.correct)
    const disabled = !(props.answer.text.trim())

    return html`<div class=quizCreatorAnswer>
        <${StickyInput} id=${props.id} color=${props.color} text=${props.answer.text} oninput=${input} />
        <input class=quizCreatorCheckBox type=checkbox id=${props.id}
            checked=${checked} disabled=${disabled} onchange=${change} />
    </div>`
}

function Answers(props) {
    const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']
    const answersBlock = props.answers.map((answer, i) => {
        return html`<${Answer} id=${i} answer=${answer} color=${colors[i]}
            onUpdateText=${(text) => props.onUpdateText(i, text)} 
            onChangeCorrectAnswer=${() => props.onChangeCorrectAnswer(i)} />`
    })
    return html`<div class=quizCreatorAnswers>
        ${answersBlock}
    </div>`
}

function Question(props) {
    const [initialQuestionText] = useState(props.text)
    const updateQuestionText = (e) => props.onUpdateText(e.target.innerText)

    return html`<h1 class=quizCreatorQuestion contenteditable=true 
        oninput=${updateQuestionText} dangerouslySetInnerHTML=${{ __html: initialQuestionText }} />`
}

function QuestionAndAnswers(props) {
    return html`<div>
        <hr />
        <${Question} text=${props.question.text} onUpdateText=${props.onUpdateQuestionText} />
        <${Answers} answers=${props.question.answers} onUpdateText=${props.onUpdateAnswerText} 
            onChangeCorrectAnswer=${props.onChangeCorrectAnswer} />
        <div class=quizCreatorAddDeleteQuestion>
            <button id=add class=quizCreatorSmallButton onclick=${props.onAddQuestion}>+</button>
            <button id=delete class=quizCreatorSmallButton onclick=${props.onDeleteQuestion}>-</button>
        </div>
    </div>`
}

export default function QuizCreator() {
    const [title, setTitle] = useState('Untitled Quiz')
    const [initialTitle] = useState(title)
    const q1 = {
        text: 'Untitled Question?',
        answers: [
            { text: 'Answer 1', correct: true },
            { text: 'Answer 2' },
            { text: 'Answer 3' },
            { text: 'Answer 4' }
        ]
    }
    const [questions, setQuestions] = useState([q1])

    const updateTitle = (e) => setTitle(e.target.innerText)

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
        const quiz = {
            title,
            questions: questions.map(q => ({ text: q.text, answers: q.answers.filter(a => a.text.trim() !== '') }))
        }
        console.log(quiz)
        createQuiz(quiz).then(() => backToAdmin())
    }

    const backToAdmin = () => location.href = '/#/admin'

    const questionsBlock = questions.map((q, i) => {
        const updateQuestionText = (questionText) => setQuestions(oldQuestions => {
            const newQuestions = [...oldQuestions]
            newQuestions[i].text = questionText
            return newQuestions
        })

        const updateAnswerText = (answerIndex, answerText) => setQuestions(oldQuestions => {
            const newQuestions = [...oldQuestions]
            newQuestions[i].answers[answerIndex].text = answerText
            return newQuestions
        })

        const changeCorrectAnswer = (answerIndex) => setQuestions(oldQuestions => {
            const newQuestions = [...oldQuestions]
            newQuestions[i].answers = oldQuestions[i].answers.map(a => ({ text: a.text }))
            newQuestions[i].answers[answerIndex].correct = true
            return newQuestions
        })

        const addQuestion = () => setQuestions(oldQuestions => {
            const newQuestions = [...oldQuestions]
            newQuestions.splice(i + 1, 0, q1)
            return newQuestions
        })

        const deleteQuestion = () => setQuestions(oldQuestions => {
            if (oldQuestions.length === 1) return oldQuestions
            const newQuestions = [...oldQuestions]
            newQuestions.splice(i, 1)
            return newQuestions
        })

        return html`<${QuestionAndAnswers} question=${q} onUpdateQuestionText=${updateQuestionText} 
            onUpdateAnswerText=${updateAnswerText} onChangeCorrectAnswer=${changeCorrectAnswer} 
            onAddQuestion=${addQuestion} onDeleteQuestion=${deleteQuestion} />`
    })

    return html`<${Shell} headerCenter='Create New Quiz'>
        <div class=quizCreator>
            <h1 class=quizCreatorTitle contenteditable=true 
                oninput=${updateTitle} dangerouslySetInnerHTML=${{ __html: initialTitle }} />
            <div class=quizCreatorQuestions>
                ${questionsBlock}
            </div>
            <hr />
            <div class=quizCreatorActions>
                <button id=create class=quizCreatorButton onclick=${create}>Create</button>
                <button id=cancel class=quizCreatorButton onclick=${backToAdmin}>Cancel</button>
            </div>
        </div>
    <//>`
}
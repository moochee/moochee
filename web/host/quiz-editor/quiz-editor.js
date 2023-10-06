import { html, useState, useEffect } from '../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../public/shell/shell.js'

window.loadCss('/web/host/quiz-editor/quiz-editor.css')

const QuestionAndAnswers = function (props) {
    const addAnswer = () => {
        const newState = JSON.parse(JSON.stringify(props.question))
        newState.answers.push({ id: crypto.randomUUID(), text: `Answer${newState.answers.length + 1}` })
        props.onUpdateQuestion(newState)
    }

    const answersBlock = props.question.answers.map((answer, index) => {
        const text = (event) => {
            const newState = JSON.parse(JSON.stringify(props.question))
            newState.answers[index].text = event.target.value
            props.onUpdateQuestion(newState)
        }
        const correct = (event) => {
            const newState = JSON.parse(JSON.stringify(props.question))
            newState.answers[index].correct = event.target.checked
            props.onUpdateQuestion(newState)
        }
        const del = () => {
            const newState = JSON.parse(JSON.stringify(props.question))
            newState.answers.splice(index, 1)
            props.onUpdateQuestion(newState)
        }
        return html`
            <div key=${answer.id} class=answerEntry>
                <input class='answer background${index % 4}' value=${answer.text} onInput=${text}></input>
                <button title=delete class=delete onClick=${del}>🆇</button>
                <input title='correct?' type=checkbox checked=${answer.correct} class=correct onInput=${correct}></input>
            </div>
        `
    })
    answersBlock.push(html`<button class='answer addAnswer' onClick=${addAnswer}>+</button>`)

    const onInputQuestion = (event) => {
        const newState = JSON.parse(JSON.stringify(props.question))
        newState.text = event.target.value
        props.onUpdateQuestion(newState)
    }

    return html`<div class=questionAndAnswers>
        <input class=question placeholder=Question onInput=${onInputQuestion} value=${props.question.text}></input>
        <div class=answers>${answersBlock}</div>
    </div>`
}

const createTemplateQuestion = () => ({
    id: crypto.randomUUID(),
    text: 'Question',
    answers: [
        { id: crypto.randomUUID(), text: 'Answer1', correct: true }, { id: crypto.randomUUID(), text: 'Answer2' },
        { id: crypto.randomUUID(), text: 'Answer3' }, { id: crypto.randomUUID(), text: 'Answer4' }
    ]
})

const removeIDs = (quiz) => {
    const filteredQuiz = JSON.parse(JSON.stringify(quiz))
    filteredQuiz.questions.forEach(q => {
        delete q.id
        q.answers.forEach(a => delete a.id)
    })
    return filteredQuiz
}

export default function QuizEditor(props) {
    const [title, setTitle] = useState('Untitled')
    const [tags, setTags] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [secondsToGuess, setSecondsToGuess] = useState(20)
    const [questions, setQuestions] = useState([createTemplateQuestion()])

    useEffect(() => {
        const getQuiz = async () => {
            if (props.id) {
                const quiz = await (await fetch(`/api/v1/quizzes/${props.id}`)).json()
                setTitle(quiz.title)
                // REVISE if all quizzes have tags, this is not needed any longer
                const tagsString = quiz.tags ? quiz.tags.join(' ') : ''
                setTags(tagsString)
                setIsPublic(!quiz.isPrivate)
                setQuestions(quiz.questions)
                setSecondsToGuess(quiz.secondsToGuess || secondsToGuess)
            }
        }
        getQuiz()
    }, [])

    const updateTitle = (e) => setTitle(e.target.value)

    // TODO disallow comma
    const updateTags = (e) => setTags(e.target.value)

    const updateIsPublic = (e) => setIsPublic(e.target.checked)

    const updateSecondsToGuess = (e) => setSecondsToGuess(e.target.value)

    const save = () => {
        const saveQuiz = async (quiz) => {
            if (props.id) {
                return await fetch(`/api/v1/quizzes/${props.id}`, {
                    method: 'PUT',
                    // REVISE check if this can be ommitted by passing an object instead of string
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(removeIDs(quiz))
                })
            }
            await fetch('/api/v1/quizzes', {
                method: 'POST',
                // REVISE check if this can be ommitted by passing an object instead of string
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(removeIDs(quiz))
            })
        }
        const updatedQuiz = {
            title: title,
            tags: tags ? tags.split(' ') : [],
            isPrivate: !isPublic,
            questions: questions.map(q => ({ text: q.text, answers: q.answers.filter(a => a.text.trim() !== '') })),
            secondsToGuess: secondsToGuess
        }
        saveQuiz(updatedQuiz).then(() => backToAdmin())
    }

    const backToAdmin = () => window.location.href = '#/admin'

    const questionsBlock = questions.map((question, index) => {
        const addQuestion = () => setQuestions(oldQuestions => {
            const newQuestions = JSON.parse(JSON.stringify(oldQuestions))
            newQuestions.splice(index + 1, 0, createTemplateQuestion())
            return newQuestions
        })
        const deleteQuestion = () => setQuestions(oldQuestions => {
            if (oldQuestions.length === 1) return oldQuestions
            const newQuestions = JSON.parse(JSON.stringify(oldQuestions))
            newQuestions.splice(index, 1)
            return newQuestions
        })
        const updateQuestion = (newQuestion) => setQuestions(oldQuestions => {
            const newQuestions = JSON.parse(JSON.stringify(oldQuestions))
            newQuestions[index] = newQuestion
            return newQuestions
        })
        const deleteButton = index > 0 ? html`<button onClick=${deleteQuestion}>-</button>` : ''
        return html`
            <div key=${question.id}>
                <${QuestionAndAnswers} question=${question} onUpdateQuestion=${updateQuestion} />
            </div>
            <div key=actions-${question.id} class=addDeleteQuestion>
                <button onClick=${addQuestion}>+</button>
                ${deleteButton}
            </div>
        `
    })

    const header = props.id ? 'Edit Quiz' : 'New Quiz'
    const actions = html`
        <div class=quizEditorMainActions>
            <button onclick=${save}>✓ Save</button>
            <button onclick=${backToAdmin}>✕ Cancel</button>
        </div>
    `
    return html`<${Shell} headerCenter=${header} footerRight=${actions}>
        <div class=quizEditor>
            <input class=title value=${title} onInput=${updateTitle} placeholder=Title/>
            <div class=tagsLine>
                <input class=tags value=${tags} onInput=${updateTags} placeholder='Add tags, separated by space.'/>
                <input type=checkbox id=isPublic oninput=${updateIsPublic} checked=${isPublic}/>
                <label for=isPublic>Public?</label>
                <label class=secondsToGuess for=isPublic>Seconds to guess:</label>
                <input type=number min=10 max=30 step=1 
                       value=${secondsToGuess} onInput=${updateSecondsToGuess} placeholder='Seconds to Guess'/>
            </div>
            <hr/>
            <div class=questions>${questionsBlock}</div>
        </div>
    <//>`
}

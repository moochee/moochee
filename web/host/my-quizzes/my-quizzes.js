import { html, useEffect, useState } from '../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../public/shell/shell.js'

window.loadCss('/web/host/my-quizzes/my-quizzes.css')

const Quiz = function (props) {
    const tags = props.tags
        .map(tag => html`<div class='tag ${props.backgroundClass}Secondary' title=${tag}>${tag}</div>`)
        .slice(0, 4)

    if (props.tags.length > 4) {
        const tooltip = props.tags.slice(4).join(', ')
        tags.push(html`<div class='tag ${props.backgroundClass}Secondary' title=${tooltip}>...</div>`)
    }

    return html`<button class='quiz ${props.backgroundClass}' onClick=${props.onEdit}>
        ${props.title}
        <div class=tags>${tags}</div>
        <button title=delete onClick=${props.onDelete} class=deleteButton>✕</button>
    </button>`
}

export default function MyQuizzes() {
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple', 'red', 'yellow', 'petrol']

    useEffect(() => {
        const getQuizzes = async () => {
            const quizList = await (await fetch('/api/v1/quizzes?mine=true')).json()
            quizList.forEach((entry, index) => entry.color = colors[index % 7])
            setQuizzes(quizList)
        }
        getQuizzes()
    }, [])

    const quizList = quizzes.map((q, i) => {
        const del = async (event) => {
            event.stopPropagation()
            const response = await fetch(`/api/v1/quizzes/${q.id}`, { method: 'DELETE' })
            if (response.ok) setQuizzes(oldQuizzes => { return oldQuizzes.filter(o => o.id !== q.id) })
        }
        const edit = () => {
            window.location.href = `#/edit/${q.id}`
        }

        const bg = `background${i % 4}`
        return html`<${Quiz} key=${q.id} tags=${q.tags} title=${q.title} backgroundClass=${bg} onEdit=${edit} onDelete=${del} />`
    })
    quizList.push(html`<a title=add class='quiz add' href='#/create'>+</a>`)
    
    const back=html`<a class=myQuizzesBack href='#/admin'>${'<'}</a>`
    return html`<${Shell} headerLeft=${back} headerCenter='My Quizzes'>
        <div class=myQuizzes><div class=quizzes>${quizList}</div></div>
    <//>`
}

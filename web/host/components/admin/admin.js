'use strict'

import { html, useEffect, useState } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'

loadCss('/components/admin/admin.css')

const Quiz = function (props) {
    const tags = props.tags
        .map(tag => html`<div class='tag ${props.backgroundClass}Secondary' title=${tag}>${tag}</div>`)
        .slice(0, 4)

    if (props.tags.length > 4) {
        const tooltip = props.tags.slice(4).join(', ')
        tags.push(html`<div class='tag ${props.backgroundClass}Secondary' title=${tooltip}>...</div>`)
    }

    return html`<div class='quiz ${props.backgroundClass}'>
        ${props.title}
        <div class=tags>${tags}</div>
        <button title=edit onClick=${props.onEdit} class=editButton>✎</button>
        <button title=delete onClick=${props.onDelete} class=deleteButton>✕</button>
    </div>`
}

export default function Admin() {
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
        const del = async () => {
            const response = await fetch(`/api/v1/quizzes/${q.id}`, { method: 'DELETE' })
            if (response.ok) setQuizzes(oldQuizzes => { return oldQuizzes.filter(o => o.id !== q.id) })
        }
        const edit = async () => {
            window.location.href = `/#/edit/${q.id}`
        }

        const bg = `background${i % 4}`
        return html`<div  class=entry>
            <${Quiz} key=${q.id} tags=${q.tags} title=${q.title} backgroundClass=${bg} onEdit=${edit} onDelete=${del} />
        </div>`
    })
    quizList.push(html`<a title=add class='quiz add' href='/#/create'>+</a>`)
    
    const back=html`<a class=adminBack href='/'>${'<'}</a>`
    return html`<${Shell} headerLeft=${back} headerCenter='Manage My Quizzes'>
        <div class=admin><div class=quizzes>${quizList}</div></div>
    <//>`
}

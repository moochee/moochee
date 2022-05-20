'use strict'

import { html, useEffect, useState } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'

loadCss('/components/entrance/entrance-new.css')

function AdminButton() {
    const click = () => window.location.href = '/#/admin'
    return html`<div class=entranceAdminButton onclick=${click}>⚙️</div>`
}

const QuizCard = function (props) {
    const tags = props.tags
        .map(tag => html`<div class='tag ${props.backgroundClass}Secondary' title=${tag}>${tag}</div>`)
        .slice(0, 4)

    if (props.tags.length > 4) {
        const tooltip = props.tags.slice(4).join(', ')
        tags.push(html`<div class='tag ${props.backgroundClass}Secondary' title=${tooltip}>...</div>`)
    }

    return html`<button class='quizCard ${props.backgroundClass}' onClick=${props.onClick}>
        ${props.text}
        <div class=tags>${tags}</div>
    </button>`
}

export default function Entrance(props) {
    const [searchTerm, setSearchTerm] = useState(location.search.substring(1))
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    useEffect(() => {
        const searchChanged = (event) => setSearchTerm(event.state || '')
        const getQuizzes = async () => {
            const quizList = await (await fetch('/api/v1/quizzes')).json()
            quizList.forEach((entry, index) => entry.color = colors[index % 4])
            setQuizzes(quizList)
        }
        getQuizzes()
        addEventListener('popstate', searchChanged)
        return () => removeEventListener('popstate', searchChanged)
    }, [])

    const search = (term) => {
        setSearchTerm(term)
        history.pushState(term, '', `/?${term}`)
    }

    const host = (quizId, quizTitle) => {
        props.client.host(quizId, quizTitle)
    }

    const filteredQuizzes = quizzes.filter(q => {
        return q.tags.includes(searchTerm)
            || q.title.toLowerCase().includes(searchTerm.toLowerCase())
            || !searchTerm
    })

    const quizList = filteredQuizzes.map((q, i) => {
        return html`<${QuizCard} 
            key=${q.id} 
            tags=${q.tags} 
            text=${q.title} 
            backgroundClass=background${i % 4}
            onClick=${() => host(q.id, q.title)} />`
    })

    const headerRight = html`
        <div style='display: flex;'>
            <input class=entranceSearch
                    placeholder=Search...
                    value=${searchTerm}
                    onChange=${event => search(event.target.value)}>
            </input>
            <${AdminButton} />
        </div>
    `

    return html`<${Shell} headerLeft='Select your quiz' headerRight=${headerRight}>
        <div class=entrance>
            <div class=entranceQuizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

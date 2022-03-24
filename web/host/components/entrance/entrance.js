'use strict'

import {html, useEffect, useState} from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'
import StickyButton from '/public/components/sticky/sticky-button.js'

loadCss('/components/entrance/entrance.css')

function AdminButton() {
    const click = () => window.location.href = '/#/admin'
    return html`<div class=entranceAdminButton onclick=${click}>⚙️</div>`
}

export default function Entrance(props) {
    const [searchTerm, setSearchTerm] = useState(location.hash.substring(1))
    const [quizzes, setQuizzes] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple']

    useEffect(() => {
        const hashChanged = () => setSearchTerm(location.hash.substring(1))
        const getQuizzes = async () => {
            const quizList = await (await fetch('/api/v1/quizzes')).json()
            quizList.forEach((entry, index) => entry.color = colors[index % 4])
            setQuizzes(quizList)
        }
        getQuizzes()
        addEventListener('hashchange', hashChanged)
        return () => removeEventListener('hashchange', hashChanged)
    }, [])

    const host = (quizId, quizTitle) => {
        props.client.host(quizId, quizTitle)
    }

    // TODO visualize tags on the quiz elements
    // TODO add capability to add tags from quiz builder
    // TODO on input display a top 5 result list, only adjust that directly on input
    const filteredQuizzes = quizzes.filter(q => {
        return q.tags.includes(searchTerm) 
            || q.title.toLowerCase().includes(searchTerm.toLowerCase()) 
            || !searchTerm
    })

    const quizList = filteredQuizzes.map(q => {
        return html`<${StickyButton} key=${q.id} onClick=${() => host(q.id, q.title)} text=${q.title} color=${q.color} />`
    })

    const headerRight = html`
        <div style='display: flex;'>
            <input class=entranceSearch
                    placeholder=Search...
                    value=${searchTerm}
                    onChange=${event => location.hash = event.target.value}>
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

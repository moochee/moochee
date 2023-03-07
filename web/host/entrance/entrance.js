import { html, useEffect, useState } from '../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../public/shell/shell.js'

window.loadCss('/web/host/entrance/entrance.css')

const AdminButton = function() {
    const click = () => window.location.href = '/#/admin'
    return html`<div class=entranceAdmin onClick=${click}>⚙</div>`
}

const Quiz = function (props) {
    const tags = props.tags
        .map(tag => html`<div class='tag ${props.backgroundClass}Secondary' title=${tag}>${tag}</div>`)
        .slice(0, 3)

    if (props.tags.length > 3) {
        const tooltip = props.tags.slice(3).join(', ')
        tags.push(html`<div class='tag ${props.backgroundClass}Secondary' title=${tooltip}>...</div>`)
    }

    return html`<button class='quiz ${props.backgroundClass}' onClick=${props.onClick}>
        ${props.text}
        <div class=tags>${tags}</div>
        <button title=info onClick=${props.onInfo} class=infoButton>ℹ</button>
    </button>`
}

export default function Entrance(props) {
    const [searchTerm, setSearchTerm] = useState(decodeURIComponent(window.location.search.substring(1)))
    const [quizzes, setQuizzes] = useState([])

    useEffect(() => {
        const searchChanged = (event) => setSearchTerm(event.state || '')
        const getQuizzes = async () => {
            const quizList = await (await fetch(`${window.location.origin}/api/v1/quizzes`)).json()
            quizList.forEach((entry, i) => entry.backgroundClass=`background${i % 4}`)
            setQuizzes(quizList)
        }
        getQuizzes()
        window.addEventListener('popstate', searchChanged)
        return () => window.removeEventListener('popstate', searchChanged)
    }, [])

    const search = (term) => {
        setSearchTerm(term)
        const url = term ? `${window.location.pathname}?${term}` : window.location.pathname
        history.pushState(term, '', url)
    }

    const filteredQuizzes = quizzes.filter(q => {
        const lowerCaseTerm = searchTerm.toLowerCase() 
        return q.tags.some(t => t.toLowerCase().includes(lowerCaseTerm))
            || q.title.toLowerCase().includes(lowerCaseTerm)
            || !searchTerm
    })

    const quizList = filteredQuizzes.map(q => {
        const showInfo = (event) => {
            event.stopPropagation()
            props.onShowInfo(q.id)
        }
        return html`<${Quiz}
            key=${q.id}
            tags=${q.tags}
            text=${q.title}
            backgroundClass=${q.backgroundClass}
            onInfo=${showInfo}
            onClick=${() => props.onHost(q.id, q.title)} />`
    })

    const headerRight = html`
        <div class=entranceSearch>
            <input placeholder=Search...
                    value=${searchTerm}
                    onkeyup=${event => search(event.target.value)}>
            </input>
            <${AdminButton} />
        </div>
    `
    
    const footerRight = html`
        <a class=entranceHistory href='#/history'>
            History
        </a>
    `

    return html`<${Shell} headerLeft='😸 Moochee' headerRight=${headerRight} footerRight=${footerRight}>
        <!-- REVISE why do we need nested divs? -->
        <div class=entrance>
            <div class=quizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

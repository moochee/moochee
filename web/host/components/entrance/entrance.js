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
    
    const hashChanged = () => {
        setSearchTerm(location.hash.substring(1))
    }

    useEffect(() => {
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

    // TODO add capability to add tags from quiz builder
    // TODO do another filter for the title
    // TODO consider fuzzz search / partial search for title
    // TODO on input display a top 5 result list, only adjust that directly on input
    // TODO populate the search input field from the hash if there is one
    const filteredQuizzes = quizzes.filter(q => {
        return q.tags.includes(searchTerm) || !searchTerm
    })

    const quizList = filteredQuizzes.map((q) => {
        return html`<div key=${q.id} class=entranceQuiz>
            <${StickyButton} onClick=${() => host(q.id, q.title)} text=${q.title} color=${q.color} />
        </div>`
    })

    const adminButton = html`<${AdminButton} />`
    const searchBar = html`<input onChange=${(event) => location.hash = event.target.value}></input>`
    return html`<${Shell} headerLeft=${searchBar} headerCenter='Welcome to the 🦍 Quiz' headerRight=${adminButton}>
        <div class=entrance>
            <div class=entranceTitle>Select a quiz to host a new game</div>
            <div class=entranceQuizzes>
                ${quizList}
            </div>
        </div>
    <//>`
}

// export default function Entrance(props) {
//     const [quizzes, setQuizzes] = useState([])
//     const [filteredQuizzes, setFilteredQuizzes] = useState([])

//     const colors = ['green', 'blue', 'orange', 'purple']

    
//     useEffect(() => {
//         const hashChanged = () => {
//             console.log('hash changed')
//             //console.log(location.hash.substring(1))
//             search(location.hash.substring(1))
//         }
//         const getQuizzes = async () => {
//             const quizList = await (await fetch('/api/v1/quizzes')).json()
//             quizList.forEach((entry, index) => entry.color = colors[index % 4])
//             setQuizzes(quizList)
//             console.log(quizList)
//             setFilteredQuizzes([...quizList])
//             console.log(quizList)
//         }
//         getQuizzes()
//         addEventListener('hashchange', hashChanged)
//         return () => removeEventListener('hashchange', hashChanged)
//     }, [])

//     const host = (quizId, quizTitle) => {
//         props.client.host(quizId, quizTitle)
//     }

//     const quizList = filteredQuizzes.map((q) => {
//         return html`<div key=${q.id} class=entranceQuiz>
//             <${StickyButton} onClick=${() => host(q.id, q.title)} text=${q.title} color=${q.color} />
//         </div>`
//     })

//     // TODO once user hits enter, add the search term to the URL, and be able to directly filter based on the URL when entering the page
//     // TODO do another filter for the title
//     // TODO consider fuzzz search / partial search for title
//     // TODO on input display a top 5 result list, only adjust that directly on input
//     const search = (searchTerm) => {
//         console.log(searchTerm)
//         console.log(quizzes)
//         const filteredByTags = quizzes.filter(q => {
//             console.log(`filtering ${q.title}`)
//             console.log(searchTerm)
//             return q.tags.includes(searchTerm) || !searchTerm
//         })
//         console.log(quizzes)
//         setFilteredQuizzes(filteredByTags)
//     }

//     const adminButton = html`<${AdminButton} />`
//     const searchBar = html`<input onChange=${(event) => location.hash = event.target.value} ></input>`
//     return html`<${Shell} headerLeft=${searchBar} headerCenter='Welcome to the 🦍 Quiz' headerRight=${adminButton}>
//         <div class=entrance>
//             <div class=entranceTitle>Select a quiz to host a new game</div>
//             <div class=entranceQuizzes>
//                 ${quizList}
//             </div>
//         </div>
//     <//>`
// }
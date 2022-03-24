'use strict'

import { html, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/scoreboard/scoreboard.css')

// REVISE move remaining styling to css

export default function Scoreboard(props) {
    // REVISE still some spaghetti - this works because the scoreboard is sorted by oldRank elsewhere
    const top5oldAndNew = props.scoreboard.filter(entry => {
        return (entry.rank <= 5 || entry.oldRank <= 5)
    }).map((entry, index) => ({ ...entry, oldRank: index + 1 }))

    const entries = JSON.parse(JSON.stringify(top5oldAndNew)).map(entry => {
        // REVISE calculate shift here and then maybe can simplify/unify the CSS classes
        if (entry.oldRank > 5) {
            return { ...entry, class: 'scoreboardMoveIn' }
        } else if (entry.rank > 5) {
            return { ...entry, class: 'scoreboardMoveOut', rank: 6 }
        } else {
            return { ...entry, class: 'scoreboardMove' }
        }
    })

    const entriesHtml = entries.map(e => {
        return html`<div key=${e.avatar} class=${e.class} style='display: flex; align-items: center; --positions: ${e.rank - e.oldRank}'>
            <div style='margin-right: 0.5em; font-size: 2em;'>${e.avatar}</div>
            <div style='white-space: nowrap;'>${e.score} points</div>
        </div>`
    })

    const scoreboard = useRef()

    const setDimensions = () => {
        const height = Math.min(window.innerHeight, window.innerWidth * 9 / 16) / 100
        scoreboard.current.style.setProperty('--height', height)
        scoreboard.current.style.setProperty('--width', height * 16 / 9)
    }

    useEffect(() => {
        setDimensions()
        window.addEventListener('resize', setDimensions)
        return () => window.removeEventListener('resize', setDimensions)
    }, [])

    // REVISE check if we need the nested DIVs
    return html`<div ref=${scoreboard} class=scoreboard>
        <div style='display: flex; flex-direction: column; align-items: center;'>
            ${entriesHtml}
        </div>
    </div>`
}

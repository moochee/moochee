'use strict'

import { html, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/scoreboard/scoreboard.css')

// TODO move remaining styling to css

export default function Scoreboard(props) {
    // TODO tryout counter animation using css @property https://css-tricks.com/animating-number-counters/
    const rankingClasses = {}

    props.ranking.forEach(entry => {
        if (entry.oldRank <= 5 && entry.rank > 5) {
            rankingClasses[entry.avatar] = 'rankingMoveOut'
        } else if (entry.oldRank > 5 && entry.rank <= 5) {
            rankingClasses[entry.avatar] = 'rankingMoveIn'
        } else if (entry.oldRank <= 5 && entry.rank <= 5) {
            rankingClasses[entry.avatar] = 'rankingMove'
        } else if (!entry.oldRank && entry.rank <= 5) {
            rankingClasses[entry.avatar] = 'rankingAppear'
        } else {
            rankingClasses[entry.avatar] = 'rankingInvisible'
        }
    })

    const entries = props.ranking.map(e => {
        return html`<div key=${e.avatar} class=${rankingClasses[e.avatar]} style='display: flex; align-items: center; --positions: ${e.rank - e.oldRank}'>
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

    return html`<div ref=${scoreboard} class=ranking>
        <div style='display: flex; flex-direction: column; align-items: center; margin-top: 12vh;'>
            ${entries}
        </div>
    </div>`
}

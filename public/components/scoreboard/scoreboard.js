'use strict'

import { html } from '/lib/preact-3.1.0.standalone.module.js'
import Shell from '/components/shell/shell.js'
import loadCss from '/load-css.js'

loadCss('/components/scoreboard/scoreboard.css')

// TODO move remaining styling to css

export default function Scoreboard(props) {
    // TODO tryout counter animation using css @property https://css-tricks.com/animating-number-counters/
    const rankingClasses = {}

    // ranking.sort((a, b) => a.oldRank - b.oldRank)

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

    return html`<${Shell} headerCenter='Score Board'>
        <div style='height: 100%; display: flex; justify-content: center; font-size: 5vh;'>
            <div style='margin-top: 5vh'>
                ${entries}
            </div>
        </div>
    </ />`
}

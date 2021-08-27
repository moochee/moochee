'use strict'

import { html, useEffect, useState, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import Shell from '/components/shell/shell.js'
import loadCss from '/load-css.js'

loadCss('/scoreboard.css')

export default function Scoreboard() {
    // REVISE check if we can live without those 'invisible' style classes
    let [rankingClasses, setRankingClasses] = useState(['', '', '', '', '', 'rankingInvisible', 'rankingInvisible'])
    let rankingRef = useRef()

    const updateRanking = () => {
        // TODO hard coded right now to simulate swapping rank 1 and 2
        rankingRef.current.children[0].style.setProperty('--positions', 1)
        rankingRef.current.children[1].style.setProperty('--positions', -1)
        setRankingClasses(oldRankingClasses => {
            const newRankingClasses = [...oldRankingClasses]
            newRankingClasses[0] = 'rankingMove'
            newRankingClasses[1] = 'rankingMove'
            return newRankingClasses
        })
    }

    useEffect(() => {
        setTimeout(updateRanking, 1000)
    })

    // TODO tryout counter animation using css @property https://css-tricks.com/animating-number-counters/

    const ranking2 = [
        { avatar: '🐶', oldScore: 100, newScore: 100, oldRank: 7, newRank: 1 },
        { avatar: '🐱', oldScore: 200, newScore: 100, oldRank: 6, newRank: 2 },
        { avatar: '🐭', oldScore: 300, newScore: 100, oldRank: 5, newRank: 3 },
        { avatar: '🐹', oldScore: 400, newScore: 100, oldRank: 4, newRank: 4 },
        { avatar: '🐰', oldScore: 500, newScore: 100, oldRank: 3, newRank: 5 },
        { avatar: '🦊', oldScore: 600, newScore: 100, oldRank: 2, newRank: 6 },
        { avatar: '🐻', oldScore: 700, newScore: 100, oldRank: 1, newRank: 7 }
    ]

    const ranking = ranking2.sort((a, b) => a.oldRank - b.oldRank)

    const entries = ranking.map((e, index) => index <= 4 ? html`
        <div key=${e.avatar} class='${rankingClasses[index]}' style='display: flex; align-items: center;'>
            <div style='font-size: 2em; margin-right: 1em;'>${e.avatar}</div>
            <div>${e.oldScore} points</div>
        </div>` : ''
    )

    return html`<${Shell} headerCenter='Score Board'>
    <div ref=${rankingRef}
        style='font-size: 4vh; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: center;'>
        ${entries}
    </div>
    </ />
    `
}

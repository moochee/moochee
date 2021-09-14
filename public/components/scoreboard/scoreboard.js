'use strict'

import { html, useEffect, useState, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import Shell from '/components/shell/shell.js'
import loadCss from '/load-css.js'

loadCss('/components/scoreboard/scoreboard.css')

// TODO move remaining styling to css

export default function Scoreboard() {
    let [rankingClasses, setRankingClasses] = useState(['', '', '', '', '', 'rankingInvisible', 'rankingInvisible', 'rankingInvisible', 'rankingInvisible', 'rankingInvisible', 'rankingInvisible'])
    let rankingRef = useRef()

    const updateRanking = () => {
        const newRankingClasses = new Array(7)
        ranking.forEach((entry, index) => {
            rankingRef.current.children[index].style.setProperty('--positions', entry.newRank - entry.oldRank)
            if (entry.oldRank <= 5 && entry.newRank > 5) {
                newRankingClasses[index] = 'rankingDisappear'
            } else if (entry.oldRank > 5 && entry.newRank <= 5) {
                newRankingClasses[index] = 'rankingAppear'
            } else if (entry.oldRank > 5 && entry.newRank > 5) {
                newRankingClasses[index] = 'rankingInvisible'
            } else {
                newRankingClasses[index] = 'rankingMove'
            }
        })
        setRankingClasses(newRankingClasses)
    }

    useEffect(() => {
        setTimeout(updateRanking, 1000)
    }, [])

    // TODO tryout counter animation using css @property https://css-tricks.com/animating-number-counters/

    // const ranking = [
    //     { avatar: '🐶', oldScore: 100, newScore: 100, oldRank: 2, newRank: 1 },
    //     { avatar: '🐱', oldScore: 200, newScore: 100, oldRank: 1, newRank: 2 }
    // ]

    const ranking = [
        { avatar: '🐶', oldScore: 100, newScore: 100, oldRank: 7, newRank: 1 },
        { avatar: '🐱', oldScore: 200, newScore: 100, oldRank: 6, newRank: 2 },
        { avatar: '🐭', oldScore: 300, newScore: 100, oldRank: 5, newRank: 3 },
        { avatar: '🐹', oldScore: 400, newScore: 100, oldRank: 4, newRank: 4 },
        { avatar: '🐰', oldScore: 500, newScore: 100, oldRank: 3, newRank: 5 },
        { avatar: '🦊', oldScore: 600, newScore: 100, oldRank: 2, newRank: 6 },
        { avatar: '🐼', oldScore: 300, newScore: 100, oldRank: 8, newRank: 8 },
        { avatar: '🐨', oldScore: 400, newScore: 100, oldRank: 9, newRank: 9 },
        { avatar: '🐯', oldScore: 500, newScore: 100, oldRank: 10, newRank: 10 },
        { avatar: '🦁', oldScore: 600, newScore: 100, oldRank: 11, newRank: 11 },
        { avatar: '🐻', oldScore: 20000, newScore: 50, oldRank: 1, newRank: 7 }
    ]

    ranking.sort((a, b) => a.oldRank - b.oldRank)

    const entries = ranking.map((e, index) => {
        return html`<div key=${e.avatar} class=${rankingClasses[index]} style='display: flex; align-items: center;'>
            <div style='margin-right: 0.5em; font-size: 2em;'>${e.avatar}</div>
            <div style='white-space: nowrap;'>${e.oldScore} points</div>
        </div>`
    })

    return html`<${Shell} headerCenter='Score Board'>
        <div style='height: 100%; display: flex; justify-content: center; font-size: 5vh;'>
            <div style='margin-top: 5vh' ref=${rankingRef}>
                ${entries}
            </div>
        </div>
    </ />`
}

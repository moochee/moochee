'use strict'

import { html, useEffect, useRef } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'

loadCss('components/podium/podium.css')

export default function Podium(props) {
    const podium = useRef()

    // This is necessary because iPhone has a nasty behavior:
    // the visual viewport height is smaller than the viewport height when the browser navigation buttons are shown
    // due to this, we cannot make positioning based on viewport height and need to fallback to window.innerHeight, which gives the correct value
    const setDimensions = () => {
        // podium takes either full height (landscape / wide screen) or full width (portrait / narrow screen)
        // if takes full height -> height = window.innerHeight; if takes full width -> height = window.innerWidth * 9/16
        const height = Math.min(window.innerHeight, window.innerWidth * 9 / 16) / 100
        podium.current.style.setProperty('--height', height)
        podium.current.style.setProperty('--width', height * 16 / 9)
    }

    useEffect(() => {
        setDimensions()
        window.addEventListener('resize', setDimensions)
        return () => window.removeEventListener('resize', setDimensions)
    }, [])

    const playerToRankHtml = (player, rank) => {
        return html`<div key=${player.name} class='podiumRank${rank}'>
            <div>${player.score}</div>
            <div class=podiumAvatar>${player.avatar}</div>
        </div>`
    }
    const first3Players = props.players.slice(0, 3)

    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    return html`<div ref=${podium} class=podium>
        ${podiumPlayersHtml}
    </div>`
}
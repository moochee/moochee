'use strict'

import { html, useEffect, useRef } from '../../../../node_modules/htm/preact/standalone.mjs'

window.loadCss('/web/public/components/podium/podium.css')
window.loadCss('/web/public/components/podium/podium-animations.css')

export default function PodiumFinal(props) {
    const music = useRef({})
    const fireworks = useRef({})
    const podium = useRef()

    // This is necessary because iPhone has a nasty behavior:
    // The visual viewport height is smaller than the viewport height when the browser navigation buttons are shown.
    // Due to this, we cannot do the positioning based on viewport height.
    // window.innerHeight gives the correct value, but is not accessible from CSS, so we need to compute with JS - until we have a better idea.
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
        music.current.play()
        setTimeout(() => fireworks.current.play(), 14000)
        return () => window.removeEventListener('resize', setDimensions)
    }, [])

    const playerToRankHtml = (player, rank) => {
        return html`<div key=${player.name} class='podiumRank${rank}'>
            <div>${player.name}</div>
            <div class=podiumAvatar>${player.avatar}</div>
        </div>`
    }
    const first3Players = props.scoreboard.filter(p => p.rank <= 3)
    first3Players.sort((a, b) => a.rank - b.rank)
    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    return html`<div ref=${podium} class='podium podiumAnimated'>
        <audio ref=${music} volume=${props.volume.current} src=/web/public/sounds/Celebration.mp3></audio>
        <audio ref=${fireworks} volume=${props.volume.current} loop src=/web/public/components/podium/sounds-of-fireworks-exploding.mp3></audio>
        <img class=firework1 src=/web/public/components/podium/fireworks-blue.svg />
        <img class=firework2 src=/web/public/components/podium/fireworks-green.svg />
        <img class=firework3 src=/web/public/components/podium/fireworks-pink.svg />
        ${podiumPlayersHtml}
    </div>`
}

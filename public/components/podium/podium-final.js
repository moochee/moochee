'use strict'

import { html, useEffect, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'

loadCss('/components/podium/podium.css')
loadCss('/components/podium/podium-animations.css')

export default function PodiumFinal(props) {
    const music = useRef({})
    const fireworks = useRef({})
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
    const first3Players = props.players.slice(0, 3)
    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    music.current.volume = props.volume
    fireworks.current.volume = props.volume

    return html`<div ref=${podium} class='podium podiumAnimated'>
        <audio ref=${music} src=components/podium/arcade-game-music-loop.mp3></audio>
        <audio ref=${fireworks} loop src=components/podium/sounds-of-fireworks-exploding.mp3></audio>
        <img class=firework1 src=components/podium/fireworks-152949.svg />
        <img class=firework2 src=components/podium/celebration-152950.svg />
        <img class=firework3 src=components/podium/celebration-152951.svg />
        ${podiumPlayersHtml}
    </div>`
}

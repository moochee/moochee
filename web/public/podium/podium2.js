import { html, useEffect, useRef } from '../../../node_modules/htm/preact/standalone.mjs'
import confetti from '../../../node_modules/canvas-confetti/dist/confetti.module.mjs'

window.loadCss('/web/public/podium/podium2.css')

export default function PodiumFinal(props) {
    const podium = useRef()

    useEffect(() => {
        const duration = 12 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
        
        const randomInRange = (min, max) => {
          return Math.random() * (max - min) + min
        }
        
        const interval = setInterval(() => {
          let timeLeft = animationEnd - Date.now()
        
          if (timeLeft <= 0) {
            return clearInterval(interval)
          }
        
          let particleCount = 100 * (timeLeft / duration)
          // since particles fall down, start a bit higher than random
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)
    }, [])

    const playerToRankHtml = (player, rank) => {
        return html`<div key=${player.name} class='podiumPlayer rank${rank}'>
            <span class=rank>${player.rank}</span>
            <span class=avatar>${player.avatar}</span>
            <span>${player.name}</span>
            <span class=score>(${player.score})</span>
        </div>`
    }
    const topPlayers = props.scoreboard.filter(p => p.rank <= 7)
    topPlayers.sort((a, b) => a.rank - b.rank)
    const podiumPlayersHtml = topPlayers.map((p, index) => playerToRankHtml(p, index + 1))

    return html`<div ref=${podium} class=podiumContainer>
        <div class=podiumPlayerList>
            ${podiumPlayersHtml}
        </div>
    </div>`
}

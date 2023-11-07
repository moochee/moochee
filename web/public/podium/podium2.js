import { html, useRef } from '../../../node_modules/htm/preact/standalone.mjs'

window.loadCss('/web/public/podium/podium2.css')

export default function PodiumFinal(props) {
    const podium = useRef()

    const playerToRankHtml = (player, rank) => {
        return html`<div key=${player.name} class=podiumPlayer>
            <div>${rank}</div>
            <div>${player.name}</div>
            <div>${player.avatar}</div>
        </div>`
    }
    const topPlayers = props.scoreboard.filter(p => p.rank <= 7)
    topPlayers.sort((a, b) => a.rank - b.rank)
    const podiumPlayersHtml = topPlayers.map((p, index) => playerToRankHtml(p, index + 1))

    return html`<div ref=${podium} class=podiumPlayerList>
        ${podiumPlayersHtml}
    </div>`
}

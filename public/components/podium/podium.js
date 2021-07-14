'use strict'

function Podium(props) {

    const html = props.players.map((p) => {
        const img = ['🥇', '🥈', '🥉'][p.rank - 1] || ''
        return <div key={p.name} className="podium">
            {img} {p.avatar} {p.name}
        </div>
    })

    return <div>{html}</div>
}

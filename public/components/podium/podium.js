'use strict'

function Podium(props) {
    // document.getElementById('music').play()
    // setTimeout(() => {
    //     document.getElementById('fireworks').play()
    // }, 14000)

    // const playerToRankHtml = (player, rank) => {
    //     return <div className={`podiumRank${rank}`}>
    //         <div>{player.name}</div>
    //         <div className={`podiumAvatar${rank}`}>{player.avatar}</div>
    //     </div>
    // }
    // const players = props.players || []

    // players.map((p, index) => playerToRankHtml(p, index + 1))

    return <div className="podium">
        <audio id="music" src="components/podium/arcade-game-music-loop.mp3"></audio>
        <audio id="fireworks" loop src="components/podium/sounds-of-fireworks-exploding.mp3"></audio>
        <img className="firework firework1" src="components/podium/fireworks-152949.svg" />
        <img className="firework firework2" src="components/podium/celebration-152950.svg" />
        <img className="firework firework3" src="components/podium/celebration-152951.svg" />

        <div className="podiumRank1">
            <div>Alice</div>
            <div className="podiumAvatar1">🐰</div>
        </div>

        <div className="podiumRank2">
            <div>Bob Marley</div>
            <div className="podiumAvatar2">🦁</div>
        </div>

        <div className="podiumRank3">
            <div>Cindy</div>
            <div className="podiumAvatar3">🐵</div>
        </div>
    </div>
}

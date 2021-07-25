'use strict'

function PodiumFinal(props) {
    // document.getElementById('music').play()
    // setTimeout(() => {
    //     document.getElementById('fireworks').play()
    // }, 14000)

    // if (props.)
    // React.useEffect(() => {
    //     // document.getElementById('music').play()
    //     audio.current.play()
    // }, [])

    const playerToRankHtml = (player, rank) => {
        return <div key={player.name} className={`podiumRank${rank}Animated`}>
            <div>{player.name}</div>
            <div className={`podiumAvatar podiumAvatar${rank}`}>{player.avatar}</div>
        </div>
    }
    const first3Players = props.players.slice(0, 3)

    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    return <div className="podium podiumAnimated">
        <audio id="music" src="components/podium/arcade-game-music-loop.mp3"></audio>
        <audio id="fireworks" loop src="components/podium/sounds-of-fireworks-exploding.mp3"></audio>
        <img className="firework firework1" src="components/podium/fireworks-152949.svg" />
        <img className="firework firework2" src="components/podium/celebration-152950.svg" />
        <img className="firework firework3" src="components/podium/celebration-152951.svg" />

        {podiumPlayersHtml}
    </div>
}

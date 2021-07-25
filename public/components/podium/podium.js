'use strict'

function Podium(props) {
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
        return <div key={player.name} className={`podiumRank${rank}`}>
            <div>{player.score}</div>
            <div className={`podiumAvatar`}>{player.avatar}</div>
        </div>
    }
    const first3Players = props.players.slice(0, 3)

    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    return <div className="podium">
        <audio id="music" src="components/podium/arcade-game-music-loop.mp3"></audio>
        {podiumPlayersHtml}
    </div>
}

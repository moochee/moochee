'use strict'

Gorilla.Podium = function (props) {
    const playerToRankHtml = (player, rank) => {
        return <div key={player.name} className={`podiumRank${rank}`}>
            <div>{player.score}</div>
            <div className='podiumAvatar'>{player.avatar}</div>
        </div>
    }
    const first3Players = props.players.slice(0, 3)

    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    return <div className='podium'>
        <audio id='music' src='components/podium/arcade-game-music-loop.mp3'></audio>
        {podiumPlayersHtml}
    </div>
}

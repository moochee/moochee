'use strict'

Gorilla.PodiumFinal = function (props) {
    const music = React.useRef({})
    const fireworks = React.useRef({})

    React.useEffect(() => {
        music.current.play()
        setTimeout(() => fireworks.current.play(), 14000)
    }, [])

    const playerToRankHtml = (player, rank) => {
        return <div key={player.name} className={`podiumRank${rank}Animated`}>
            <div>{player.name}</div>
            <div className={`podiumAvatar podiumAvatar${rank}`}>{player.avatar}</div>
        </div>
    }
    const first3Players = props.players.slice(0, 3)
    const podiumPlayersHtml = first3Players.map((p, index) => playerToRankHtml(p, index + 1))

    music.current.volume = props.volume
    fireworks.current.volume = props.volume

    return <div className='podiumBackgroundWrapper'>
        <div className='podium podiumAnimated'>
            <audio ref={music} src='components/podium/arcade-game-music-loop.mp3'></audio>
            <audio ref={fireworks} loop src='components/podium/sounds-of-fireworks-exploding.mp3'></audio>
            <img className='firework firework1' src='components/podium/fireworks-152949.svg' />
            <img className='firework firework2' src='components/podium/celebration-152950.svg' />
            <img className='firework firework3' src='components/podium/celebration-152951.svg' />
            {podiumPlayersHtml}
        </div>
    </div>
}

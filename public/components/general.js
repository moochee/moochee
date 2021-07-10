'use strict'

function Podium(props) {
    const items = props.players.map((p, index) => 
        <li key={index}>{p.name}: {p.score}</li>
    )
    return <div>
        <h2>Podium</h2>
        <ol>{items}</ol>
    </div>
}

// TODO make it a countdown
function Clock() {
    const [date, setDate] = React.useState(new Date())

    React.useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return <div>
        <h2>It is {date.toLocaleTimeString()}</h2>
    </div>
}

function Music() {
    const audio = React.useRef(null)
    const [muted, setMuted] = React.useState(false)
    const toggleMute = () => setMuted(!muted)

    React.useEffect(() => audio.current.play(), [])

    return <div>
        <audio id="audio" ref={audio} loop muted={muted} src="components/positive-funny-background-music-for-video-games.mp3"></audio>
        <ui5-button onClick={toggleMute} icon={muted ? 'sound' : 'sound-off'} aria-labelledby="mute"></ui5-button>
        <ui5-label style={{ display: "none" }} id="mute" aria-hidden="true">{muted ? 'Unmute' : 'Mute'} Sound</ui5-label>
    </div>
}

function References() {
    return <ui5-label>
        <ui5-link target="_blank" href="https://icons8.com/icon/58842/harambe-the-gorilla">Harambe the Gorilla</ui5-link> favicon by <ui5-link target="_blank" href="https://icons8.com">Icons8</ui5-link>
    </ui5-label>
}

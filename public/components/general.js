'use strict'

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

function Audio(props) {
    const volumeSlider = React.useRef(false)
    const [muted, setMuted] = React.useState(false)

    const toggleMute = () => {
        const newState = !muted
        setMuted(newState)
        props.onVolume(newState ? 0 : volumeSlider.current.value)
    }

    const adjustVolume = () => {
        setMuted(false)
        props.onVolume(volumeSlider.current.value)
    }

    return <div className="audio" style={{ cursor: "pointer", position: "absolute", left: "calc(50vw - min(47vw, 16 / 9 * 47vh))", top: "calc(50vh - min(9 / 16 * 46vw, 46vh))" }}>
        <span style={{ fontSize: "2em" }} onClick={toggleMute}>{muted ? '🔇' : '🔈'}</span>
        <input style={{ cursor: "pointer" }} ref={volumeSlider} onChange={adjustVolume} type="range" min="0" step="0.01" max="1"></input>
    </div>
}

function Music() {
    const audio = React.useRef(null)
    const [muted, setMuted] = React.useState(false)
    const toggleMute = () => setMuted(!muted)

    React.useEffect(() => audio.current.play(), [])

    return <div>
        <audio ref={audio} loop muted={muted} src="components/positive-funny-background-music-for-video-games.mp3"></audio>
        <ui5-button onClick={toggleMute} icon={muted ? 'sound' : 'sound-off'} aria-labelledby="mute"></ui5-button>
        <ui5-label style={{ display: "none" }} id="mute" aria-hidden="true">{muted ? 'Unmute' : 'Mute'} Sound</ui5-label>
    </div>
}

function References() {
    return <ui5-label>
        <ui5-link target="_blank" href="https://icons8.com/icon/58842/harambe-the-gorilla">Harambe the Gorilla</ui5-link> favicon by <ui5-link target="_blank" href="https://icons8.com">Icons8</ui5-link>
    </ui5-label>
}

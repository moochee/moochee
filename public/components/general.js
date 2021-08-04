'use strict'

function Countdown(props) {
    const [secondsLeft, setSecondsLeft] = React.useState(props.seconds)

    React.useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(seconds => {
                if (seconds === 0) {
                    clearInterval(interval)
                    return seconds
                } else {
                    return seconds - 1
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return <h2>Counting down {secondsLeft}</h2>
}

function AudioControl(props) {
    const volumeSlider = React.useRef(false)
    const [muted, setMuted] = React.useState(false)

    React.useEffect(() => {
        const isMuted = localStorage.getItem('gorilla-quiz.muted') === 'true'
        const volume = Number(localStorage.getItem('gorilla-quiz.volume') || 1)
        setMuted(isMuted)
        volumeSlider.current.value = volume
        props.onVolume(isMuted ? 0 : volume)
    }, [])

    const toggleMute = () => {
        const newState = !muted
        localStorage.setItem('gorilla-quiz.muted', String(newState))
        setMuted(newState)
        props.onVolume(newState ? 0 : volumeSlider.current.value)
    }

    const adjustVolume = () => {
        setMuted(false)
        localStorage.setItem('gorilla-quiz.volume', String(volumeSlider.current.value))
        props.onVolume(volumeSlider.current.value)
    }

    // REVISE re-think the styling - especially the absolute positioning is probably not a good idea to be defined by the component itself. Should rather be decided by the parent/user of this component.
    return <div style={{ cursor: 'pointer', position: 'absolute', right: 'calc(50vw - min(47vw, 16 / 9 * 47vh))', top: 'calc(50vh - min(9 / 16 * 46vw, 46vh))' }}>
        <span style={{ fontSize: '2em' }} onClick={toggleMute}>{muted ? '🔇' : '🔈'}</span>
        <input style={{ cursor: 'pointer' }} ref={volumeSlider} onChange={adjustVolume} type='range' min='0' step='0.01' max='1'></input>
    </div>
}

function Music() {
    const audio = React.useRef(null)
    const [muted, setMuted] = React.useState(false)
    const toggleMute = () => setMuted(!muted)

    React.useEffect(() => audio.current.play(), [])

    return <div>
        <audio ref={audio} loop muted={muted} src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        <ui5-button onClick={toggleMute} icon={muted ? 'sound' : 'sound-off'} aria-labelledby='mute'></ui5-button>
        <ui5-label style={{ display: 'none' }} id='mute' aria-hidden='true'>{muted ? 'Unmute' : 'Mute'} Sound</ui5-label>
    </div>
}

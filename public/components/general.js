'use strict'

Gorilla.Countdown = function (props) {
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

Gorilla.Music = function () {
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

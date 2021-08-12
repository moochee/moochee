'use strict'

Gorilla.AudioControl = function (props) {
    const volumeSlider = React.useRef()
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

    // TODO the slider should not appear on small screens, anyway on a phone users manage volume through the hardware buttons, iPhone even disallows setting it through software
    return <div className='audioControl'>
        <span className='muteButtonon' onClick={toggleMute}>{muted ? '🔇' : '🔈'}</span>
        <input className='volumeSlider' ref={volumeSlider} onChange={adjustVolume} type='range' min='0' step='0.01' max='1'></input>
    </div>
}

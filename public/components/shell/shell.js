'use strict'

Gorilla.Shell = function (props) {
    // REVISE move styling to css
    // TODO adjust font
    const contentClass = props.fullScreenContent ? 'shell-content-fullscreen' : 'shell-content-fit'

    return <div className='shell'>
        <div className={contentClass}>
            {props.children}
        </div>
        <div className='shell-header'>
            <div style={{ marginLeft: '1vw' }}>{props.info}</div>
            <div style={{ marginLeft: 'auto' }}>{props.header}</div>
            <div style={{ marginLeft: 'auto', marginRight: '1vw' }}><Gorilla.Shell.AudioControl onVolume={props.onVolume} /></div>
        </div>
        <div className='shell-footer'>
            <div className='shell-footer-left'></div>
            <div className='shell-footer-right'></div>
        </div>
    </div>
}

Gorilla.Shell.AudioControl = function (props) {
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

    // TODO the slider should not appear on small screens, anyway on a phone users manage volume through the hardware buttons, iPhone even disallows setting it through software
    // REVISE move styling to css
    return <div style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '1em' }} onClick={toggleMute}>{muted ? '🔇' : '🔈'}</span>
        <input style={{ cursor: 'pointer' }} ref={volumeSlider} onChange={adjustVolume} type='range' min='0' step='0.01' max='1'></input>
    </div>
}

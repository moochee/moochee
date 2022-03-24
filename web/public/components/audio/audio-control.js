'use strict'

import { html, useState, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/audio/audio-control.css')

export default function AudioControl(props) {
    const volumeSlider = useRef()
    const [muted, setMuted] = useState(false)

    useEffect(() => {
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

    return html`<div class=audioControl>
        <span class=muteButtonon onClick=${toggleMute}>${muted ? '🔇' : '🔈'}</span>
        <input class=volumeSlider ref=${volumeSlider} onChange=${adjustVolume} type=range min=0 step=0.01 max=1></input>
    </div>`
}

'use strict'

import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'

loadCss('components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    const img = `components/sticky/sticky-${props.color}.svg`

    return html`<div onAnimationEnd=${props.onClick} onClick=${click} className=${stickyClass} >
        <img src=${img}></img>
        <div className='textField'>
            ${props.text}
        </div>
    </div>`
}

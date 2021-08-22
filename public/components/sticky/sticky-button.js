'use strict'

import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'

loadCss('components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    return html`<div onAnimationEnd=${props.onClick} onClick=${click} class=${stickyClass}>
        <img src=components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>
            ${props.text}
        </div>
    </div>`
}

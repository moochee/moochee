'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    return html`<div onAnimationEnd=${props.onClick} onClick=${click} class=${stickyClass}>
        <img src=/public/components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>
            ${props.text}
        </div>
    </div>`
}

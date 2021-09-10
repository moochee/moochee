'use strict'

import { html } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'

loadCss('/components/sticky/sticky-card.css')

export default function StickyCard(props) {
    const countBlock = props.count != undefined ? html`<div class=count>${props.count}</div>` : ''
    const cssClasses = props.wrong ? 'stickyCard wrongAnswer' : 'stickyCard rightAnswer'

    return html`<div>
        <div class=${cssClasses}>
            <img src=components/sticky/sticky-${props.color}.svg></img>
            <div class=textField>${props.text}</div>
        </div>
        ${countBlock}
    </div>`
}

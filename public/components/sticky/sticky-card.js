'use strict'

import { html } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'

loadCss('/components/sticky/sticky-card.css')

export default function StickyCard(props) {
    return html`<div class=stickyCard>
        <img src=components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>${props.text}</div>
    </div>`
}

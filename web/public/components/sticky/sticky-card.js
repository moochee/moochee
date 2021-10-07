'use strict'

import { html } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/sticky/sticky-card.css')

export default function StickyCard(props) {
    return html`<div class=stickyCard>
        <img src=/public/components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>${props.text}</div>
    </div>`
}

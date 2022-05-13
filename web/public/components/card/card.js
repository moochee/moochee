'use strict'

import { html } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/card/card.css')

export default function Card(props) {
    return html`<button class=card style='background:${props.color}'>
        ${props.text}
        <div class=count>
            ${props.count}
        </div>
    </button>`
}

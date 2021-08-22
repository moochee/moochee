'use strict'

import { html } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'

loadCss('components/sticky/sticky-card.css')

export default function StickyCard(props) {
    return html`<div class=stickyCard>
        <img src=components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>
            ${props.text}
        </div>
    </div>`
}

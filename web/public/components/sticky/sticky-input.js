'use strict'

import { html, useState } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/sticky/sticky-card.css')

export default function StickyInput(props) {
    const [initialText] = useState(props.text)
    return html`<div class=stickyCard>
        <img src=/public/components/sticky/sticky-${props.color}.svg></img>
        <div class=textField contenteditable=true oninput=${props.oninput}
            dangerouslySetInnerHTML=${{ __html: initialText }} />
    </div>`
}

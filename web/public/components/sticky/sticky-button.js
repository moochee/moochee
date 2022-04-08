'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    const tags = props.tags
        .map(tag => html`<div class='tag ${props.color}' title=${tag}>${tag}</div>`)
        .slice(0, 4)

    if (props.tags.length > 4) {
        const tooltip = props.tags.slice(4).join(', ')
        tags.push(html`<div class='tag ${props.color}' title=${tooltip}>...</div>`)
    }

    return html`<div onAnimationEnd=${props.onClick} onClick=${click} class=${stickyClass}>
        <img src=/public/components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>
            ${props.text}
        </div>
        <div class=tags>
            ${tags}
        </div>
    </div>`
}

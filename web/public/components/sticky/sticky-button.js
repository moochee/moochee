'use strict'

import { html, useState } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'

loadCss('/public/components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = useState('stickyButton')
    const [showMore, setShowMore] = useState(false)

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    const tags = props.tags
        .map(tag => html`<div class='tag ${props.color}'>${tag}</div>`)

    const more = showMore ? html`<div>more tags here</div>` : '...'
    if (props.tags.length > 2) {
        tags.push(html`<div class='tag ${props.color}'>${more}</div>`)
    }
    // ${showMore ? tags : tags.slice(0, 2)}
    // onMouseLeave=${setShowMore(false)}
    
    return html`<div onAnimationEnd=${props.onClick} onClick=${click} class=${stickyClass}>
        <img src=/public/components/sticky/sticky-${props.color}.svg></img>
        <div class=textField>
            ${props.text}
        </div>
        <div class=tags onMouseEnter=${setShowMore(true)}>
            ${tags}
        </div>
    </div>`
}

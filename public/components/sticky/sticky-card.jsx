'use strict'

import loadCss from '../../load-css.js'

loadCss('components/sticky/sticky-card.css')

export default function StickyCard(props) {
    const img = `components/sticky/sticky-${props.color}.svg`

    return <div className='stickyCard' >
        <img src={img}></img>
        <div className='textField'>
            {props.text}
        </div>
    </div>
}
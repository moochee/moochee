'use strict'

import loadCss from '../../load-css.js'

loadCss('components/sticky/sticky-button.css')

export default function StickyButton(props) {
    const [stickyClass, setStickyClass] = React.useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
    }

    const img = `components/sticky/sticky-${props.color}.svg`

    return <div onAnimationEnd={props.onClick} onClick={click} className={stickyClass} >
        <img src={img}></img>
        <div className='textField'>
            {props.text}
        </div>
    </div>
}

'use strict'

Gorilla.StickyCard = function (props) {
    const img = `components/sticky/sticky-${props.color}.svg`

    return <div className='stickyCard' >
        <img src={img}></img>
        <div className='textField'>
            {props.text}
        </div>
    </div>
}
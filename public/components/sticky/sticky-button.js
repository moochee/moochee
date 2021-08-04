'use strict'

Gorilla.StickyButton = function (props) {
    const [stickyClass, setStickyClass] = React.useState('stickyButton')

    const click = () => {
        setStickyClass('stickyButton stickyThrowAway')
        props.onClick()
    }

    const img = `components/sticky/sticky-${props.color}.svg`

    return <div onClick={click} className={stickyClass} >
        <img src={img}></img>
        <div className='textField'>
            {props.text}
        </div>
    </div>
}

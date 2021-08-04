'use strict'

Gorilla.StickyCard = function (props) {
    const [stickyClass, setStickyClass] = React.useState('stickyCard')

    const click = () => {
        setStickyClass('stickyCard stickyThrowAway')
    }

    const img = `components/sticky/sticky-${props.color}.svg`

    return <div onAnimationEnd={props.onClick} onClick={click} className={stickyClass} >
        <img src={img}></img>
        <div className='textField'>
            {props.text}
        </div>
    </div>
}

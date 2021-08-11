'use strict'

Gorilla.Shell = function (props) {
    // REVISE move styling to css
    // TODO adjust font
    const contentClass = props.fullScreenContent ? 'shell-content-fullscreen' : 'shell-content-fit'

    return <div className='shell'>
        <div className={contentClass}>
            {props.children}
        </div>
        <div className='shell-header'>
            <div style={{ marginLeft: '1vw' }}>{props.info}</div>
            <div style={{ marginLeft: 'auto' }}>{props.header}</div>
            <div style={{ marginLeft: 'auto', marginRight: '1vw' }}>{props.headerRight}</div>
        </div>
        <div className='shell-footer'>
            <div className='shell-footer-left'></div>
            <div className='shell-footer-right'></div>
        </div>
    </div>
}

'use strict'

Gorilla.Shell = function (props) {
    return <div className='shell'>
        <div className='shell-header'>
            {props.header}
        </div>
        <div className='shell-content'>
            {props.children}
        </div>
        <div className='shell-footer'>
            <div className='shell-footer-left'></div>
            <div className='shell-footer-right'></div>
        </div>
    </div>
}

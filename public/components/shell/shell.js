'use strict'

Gorilla.Shell = function (props) {
    const contentClass = props.fullScreenContent ? 'shellContentFullscreen' : 'shellContentFit'
    const footerLeftClass = props.footerLeft ? 'shellFooterLeft' : 'shellFooterLeft shellLogo'
    const footerRightClass = props.footerRight ? 'shellFooterRight' : 'shellFooterRight shellLogo'
    
    return <div className='shell'>
        <div className={contentClass}>
            {props.children}
        </div>
        <div className='shellHeader'>
            <div className='shellHeaderLeft'>{props.headerLeft}</div>
            <div className='shellHeaderCenter'>{props.headerCenter}</div>
            <div className='shellHeaderRight'>{props.headerRight}</div>
        </div>
        <div className='shellFooter'>
            <div className={footerLeftClass}>{props.footerLeft}</div>
            <div className={footerRightClass}>{props.footerRight}</div>
        </div>
    </div>
}

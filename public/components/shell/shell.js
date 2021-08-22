'use strict'

import { html } from 'https://unpkg.com/htm/preact/standalone.module.js'
import loadCss from '../../load-css.js'

loadCss('components/shell/shell.css')

export default function Shell(props) {
    const contentClass = props.fullScreenContent ? 'shellContentFullscreen' : 'shellContentFit'
    const footerLeftClass = props.footerLeft ? 'shellFooterLeft' : 'shellFooterLeft shellLogo'
    const footerRightClass = props.footerRight ? 'shellFooterRight' : 'shellFooterRight shellLogo'

    return html`<div class=shell>
        <div class=${contentClass}>
            ${props.children}
        </div>
        <div class=shellHeader>
            <div class=shellHeaderLeft>${props.headerLeft}</div>
            <div class=shellHeaderCenter>${props.headerCenter}</div>
            <div class=shellHeaderRight>${props.headerRight}</div>
        </div>
        <div class=shellFooter>
            <div class=${footerLeftClass}>${props.footerLeft}</div>
            <div class=${footerRightClass}>${props.footerRight}</div>
        </div>
    </div>`
}

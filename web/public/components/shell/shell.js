'use strict'

import { html } from '../../../../node_modules/htm/preact/standalone.mjs'

window.loadCss('/web/public/components/shell/shell.css')

export default function Shell(props) {
    const contentClass = props.fullScreenContent ? 'contentFullscreen' : 'contentFit'
    const headerSeparator = (props.headerLeft || props.headerCenter || props.headerRight)
        ? html`<hr class=headerSeparator />`
        : ''
    const footerSeparator = (props.footerLeft || props.footerRight)
        ? html`<hr class=footerSeparator />`
        : ''

    return html`<div class=shell>
        <div class=header>
            <div class=headerLeft>${props.headerLeft}</div>
            <div class=headerCenter>${props.headerCenter}</div>
            <div class=headerRight>${props.headerRight}</div>
        </div>
        ${headerSeparator}
        <div class=${contentClass}>${props.children}</div>
        ${footerSeparator}
        <div class=footer>
            <div class=footerLeft>${props.footerLeft}</div>
            <div class=footerRight>${props.footerRight}</div>
        </div>
    </div>`
}

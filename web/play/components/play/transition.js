'use strict'

import { html, useState } from '../../../../node_modules/htm/preact/standalone.mjs'
import Scoreboard from '../../../public/components/scoreboard/scoreboard.js'
import Distribution from '../../../public/components/distribution/distribution.js'
import Podium from '../../../public/components/podium/podium.js'

window.loadCss('/web/play/components/play/transition.css')

const DistributionPage = function (props) {
    const buttonText = props.isFinal ? 'Podium' : 'Next'
    return html`<div class=transition>
        <${Distribution} distribution=${props.distribution} />
        <div class=transitionButton>
            <button onClick=${props.onShowNext}>${buttonText}</button>
        </div>
    </div>`
}

export default function Transition(props) {
    const [showDistribution, setShowDistribution] = useState(true)

    if (showDistribution) {
        return html`<${DistributionPage} isFinal=${props.isFinal} distribution=${props.distribution} onShowNext=${() => setShowDistribution(false)} />`
    } else if (props.isFinal) {
        return html`<${Podium} scoreboard=${props.scoreboard} volume=0/>`
    } else {
        return html`<${Scoreboard} scoreboard=${props.scoreboard} />`
    }
}
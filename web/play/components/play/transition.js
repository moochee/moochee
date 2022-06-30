'use strict'

import { html, useState } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import Scoreboard from '/public/components/scoreboard/scoreboard.js'
import Distribution from '/public/components/distribution/distribution.js'
import Podium from '/public/components/podium/podium.js'

loadCss('/play/components/play/transition.css')

const DistributionPage = function (props) {
    const buttonText = props.isFinal ? 'Podium' : 'Scoreboard'
    return html`<div class=transition>
        <${Distribution} distribution=${props.distribution} />
        <div class=transitionButton>
            <button onclick=${props.onShowNext}>${buttonText}</button>
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
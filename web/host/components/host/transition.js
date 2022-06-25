'use strict'

import { html, useState, useEffect } from '../../../../node_modules/htm/preact/standalone.mjs'
import Scoreboard from '../../../public/components/scoreboard/scoreboard.js'
import Distribution from '../../../public/components/distribution/distribution.js'
import Podium from '../../../public/components/podium/podium.js'

window.loadCss('/web/host/components/host/transition.css')

const DistributionPage = function (props) {
    const buttonText = props.isFinal ? 'Podium' : 'Next'
    return html`<div class=transition>
        <${Distribution} distribution=${props.distribution} />
        <button onClick=${props.onShowNext}>${buttonText}</button>
    </div>`
}

const ScoreboardPage = function (props) {
    return html`<div class=transition>
        <${Scoreboard} scoreboard=${props.scoreboard} />
        <button onClick=${props.onNextRound}>Next Round</button>
    </div>`
}

const PodiumPage = function (props) {
    const [canBackHome, setCanBackHome] = useState(false)
    useEffect(() => {
        props.onStopMusic()
        setTimeout(() => setCanBackHome(true), 20000)
    })
    const backHomeButton = canBackHome ? html`<button onClick=${props.onBackHome}>Home 🔥</button>` : ''
    return html`<div class=transition>
        <${Podium} scoreboard=${props.scoreboard} volume=${props.volume} />
        ${backHomeButton}
    </div>`
}

export default function Transition(props) {
    const [showDistribution, setShowDistribution] = useState(true)

    if (showDistribution) {
        return html`<${DistributionPage} isFinal=${props.isFinal} distribution=${props.distribution} onShowNext=${() => setShowDistribution(false)} />`
    } else if (!props.isFinal) {
        return html`<${ScoreboardPage} scoreboard=${props.scoreboard} onNextRound=${props.onNextRound} volume=${props.volume} onStopMusic=${props.onStopMusic} />`
    } else {
        return html`<${PodiumPage} scoreboard=${props.scoreboard} onBackHome=${props.onBackHome} volume=${props.volume} onStopMusic=${props.onStopMusic} />`
    }
}

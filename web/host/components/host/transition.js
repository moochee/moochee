'use strict'

import { html, useState, useEffect } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import Scoreboard from '/public/components/scoreboard/scoreboard.js'
import Distribution from '/public/components/distribution/distribution.js'
import Podium from '/public/components/podium/podium.js'

loadCss('/components/host/transition.css')

const DistributionPage = function (props) {
    const buttonText = props.isFinal ? 'Show Podium' : 'Show Scoreboard'
    return html`<div class=transition>
        <${Distribution} distribution=${props.distribution} />
        <div class=transitionButton>
            <button onclick=${props.onShowNext}>${buttonText}</button>
        </div>
    </div>`
}

const PodiumPage = function (props) {
    const [canBackHome, setCanBackHome] = useState(false)
    useEffect(() => {
        props.onStopMusic()
        setTimeout(() => setCanBackHome(true), 20000)
    })
    const backHomeButton = canBackHome ? html`<div class=transitionButton>
        <button onclick=${props.onBackHome}>Home 🔥</button>
    </div>` : ''
    return html`<div class=transition>
        <${Podium} scoreboard=${props.scoreboard} volume=${props.volume} />
        ${backHomeButton}
    </div>`
}

const ScoreboardPage = function (props) {
    return html`<div class=transition>
        <${Scoreboard} scoreboard=${props.scoreboard} />
        <div class=transitionButton>
            <button onclick=${props.onNextRound}>Next Round</button>
        </div>
    </div>`
}

export default function Transition(props) {
    const [showDistribution, setShowDistribution] = useState(true)

    if (showDistribution) {
        return html`<${DistributionPage} isFinal=${props.isFinal} distribution=${props.distribution} onShowNext=${() => setShowDistribution(false)} />`
    } else if (props.isFinal) {
        return html`<${PodiumPage} scoreboard=${props.scoreboard} onBackHome=${props.onBackHome} volume=${props.volume} onStopMusic=${props.onStopMusic} />`
    } else {
        return html`<${ScoreboardPage} scoreboard=${props.scoreboard} onNextRound=${props.onNextRound} volume=${props.volume} onStopMusic=${props.onStopMusic} />`
    }
}

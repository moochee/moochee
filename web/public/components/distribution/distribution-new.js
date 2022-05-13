'use strict'

import { html, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import Card from '/public/components/card/card.js'

loadCss('/public/components/distribution/distribution-new.css')

export default function Distribution(props) {

    const distribution = useRef()
    const setDimensions = () => {
        const height = Math.min(window.innerHeight, window.innerWidth * 9 / 16) / 100
        distribution.current.style.setProperty('--height', height)
        distribution.current.style.setProperty('--width', height * 16 / 9)
    }
    useEffect(() => {
        setDimensions()
        window.addEventListener('resize', setDimensions)
        return () => window.removeEventListener('resize', setDimensions)
    }, [])

    // const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']
    const colors = ['#D8BB5F', '#6FD294', '#EB855B', '#588EEB']

    const answersBlock = props.distribution.answers.map((answer, index) => {
        const className = answer.correct ? 'correctAnswerAppear' : 'wrongAnswerAppear'
        return html`<div class=${className}>
            <${Card} key=${index} color=${colors[index]} text=${answer.text} count=${answer.count}/>
        </div>`
    })

    return html`<div ref=${distribution} class=distributionQuestionAndAnswers>
        <div class=distributionQuestion>${props.distribution.text}</div>
        <div class=distributionAnswers>
            ${answersBlock}
        </div>
    </div>`
}

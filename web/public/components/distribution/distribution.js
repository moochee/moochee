'use strict'

import { html, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import StickyCard from '/public/components/sticky/sticky-card.js'

loadCss('/public/components/distribution/distribution.css')

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

    const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']

    const answersBlock = props.distribution.answers.map((answer, index) => {
        const className = answer.correct ? 'correctAnswerAppear' : 'wrongAnswerAppear'
        const countStyle = 'position: relative; bottom: 30%; right: 15%; font-size: min(5vw, 5vh); color: white; text-align: right;'
        return html`<div class=${className}>
            <${StickyCard} key=${index} color=${colors[index]} text=${answer.text} info=${answer.count}/>
            <div style=${countStyle}>${answer.count}</div>
        </div>`
    })

    return html`<div ref=${distribution} class=distributionQuestionAndAnswers>
        <h1 class=distributionQuestion>${props.distribution.text}</h1>
        <div class=distributionAnswers>
            ${answersBlock}
        </div>
    </div>`
}

'use strict'

import { html } from '/lib/preact-3.1.0.standalone.module.js'

import loadCss from '/load-css.js'
import StickyCard from '/components/sticky/sticky-card.js'

loadCss('components/distribution/distribution.css')

export default function Distribution(props) {
    const colors = ['green', 'purple', 'blue', 'orange']

    const answersBlock = props.distribution.answers.map((answer, index) => {
        const style = (answer.id === props.distribution.rightAnswerId) ? '' : 'opacity: 40%; transform: scale(.8);'
        const countStyle ='position: relative; bottom: 30%; right: 15%; font-size: min(5vw, 5vh); color: white; text-align: right;'
        return html`<div style=${style}>
            <${StickyCard} key=${index} color=${colors[index]} text=${answer.text} info=${answer.count}/>
            <div style=${countStyle}>${answer.count}</div>
        </div>`
    })

    return html`<div class=distributionQuestionAndAnswers>
        <h1 class=distributionQuestion>${props.distribution.questionText}</h1>
        <div class=distributionAnswers>
            ${answersBlock}
        </div>
    </div>`
}
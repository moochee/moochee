import { html } from '../../../../node_modules/htm/preact/standalone.mjs'

window.loadCss('/web/public/components/distribution/distribution.css')

const Answer = function (props) {
    return html`<div class='answer ${props.class}'>
        ${props.text}
        <div class=count>${props.count}</div>
        <div class=correct>${props.correct ? '✓' : ''}</div>
    </div>`
}

export default function Distribution(props) {
    const answersBlock = props.distribution.answers.map((answer, index) => {
        const className = answer.correct ? 'correctAnswer' : 'wrongAnswer'
        const bg = `background${index % 4}`
        return html`<div class=${className}>
            <${Answer} key=${index} class=${bg} text=${answer.text} count=${answer.count} correct=${answer.correct} />
        </div>`
    })

    return html`<div class=distribution>
        <div class=question>${props.distribution.text}</div>
        <div class=answers>${answersBlock}</div>
    </div>`
}

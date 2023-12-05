import { html } from '../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../public/shell/shell.js'

window.loadCss('/web/host/admin/admin.css')

const Tile = function (props) {
    return html`<button class='tile ${props.backgroundClass}' onClick=${props.onClick}>
        ${props.title}
    </button>`
}

export default function Admin() {
    const tiles = [{
        id: 0,
        title: 'My Quizzes',
        href: '#/my-quizzes'
    }, {
        id: 1,
        title: 'History',
        href: '#/history'
    }]

    const tileList = tiles.map((t, i) => {
        const bg = `background${i}`
        const click = () => window.location.href = t.href
        return html`<${Tile} key=${t.id} title=${t.title} backgroundClass=${bg} onClick=${click} />`
    })
    
    const back=html`<a class=adminBack href='#/'>${'<'}</a>`

    return html`<${Shell} headerLeft=${back} headerCenter='Admin'>
        <div class=admin><div class=tiles>${tileList}</div></div>
    <//>`
}

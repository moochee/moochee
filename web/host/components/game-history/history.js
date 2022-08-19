import { html, useEffect, useState } from '../../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../../public/components/shell/shell.js'

window.loadCss('/web/host/components/game-history/history.css')

const Item = function (props) {
    return html`<button class='quiz ${props.backgroundClass}'>
        ${props.title}
    </button>`
}

export default function History() {
    const [items, setItems] = useState([])

    const colors = ['green', 'blue', 'orange', 'purple', 'red', 'yellow', 'petrol']

    useEffect(() => {
        const getItems = async () => {
            const itemList = await (await fetch('/api/v1/history')).json()
            itemList.forEach((entry, index) => entry.color = colors[index % 7])
            setItems(itemList)
        }
        getItems()
    }, [])

    const itemList = items.map((t, i) => {
        const bg = `background${i % 4}`
        return html`<${Item} key=${t.id} title=${t.title} backgroundClass=${bg} />`
    })
    
    const back=html`<a class=historyBack href='#/'>${'<'}</a>`
    return html`<${Shell} headerLeft=${back} headerCenter='Past Games'>
        <div class=history><div class=items>${itemList}</div></div>
    <//>`
}

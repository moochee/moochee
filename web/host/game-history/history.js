import { html, useEffect, useState } from '../../../node_modules/htm/preact/standalone.mjs'
import Shell from '../../public/shell/shell.js'

window.loadCss('/web/host/game-history/history.css')

const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const formatter = new Intl.RelativeTimeFormat('en')
    const ranges = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1
    }
    const secondsElapsed = (date.getTime() - Date.now()) / 1000
    for (let key in ranges) {
        if (ranges[key] < Math.abs(secondsElapsed)) {
            const delta = secondsElapsed / ranges[key]
            return formatter.format(Math.round(delta), key)
        }
    }
}

const Item = function (props) {
    return html`<button class='item ${props.backgroundClass}' onClick=${props.onClick}>
        ${props.title}
        <div class='numberOfPlayers ${props.backgroundClass}Secondary'>${props.numberOfPlayers}p</div>
        <div class='playedTimeAgo'>${props.playedAtTimeAgo}</div>
    </button>`
}

const ItemList = function (props) {
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

    const itemList = items.map((item, i) => {
        const click = () => props.onClick(item)
        const bg = `background${i % 4}`
        return html`<${Item} key=${item.id} title=${item.title} 
            numberOfPlayers=${item.scoreboard.length} playedAtTimeAgo=${timeAgo(item.playedAt)}
            backgroundClass=${bg} onClick=${click} />`
    })
    
    const back=html`<a class=historyBack href='#/'>${'<'}</a>`
    return html`<${Shell} headerLeft=${back} headerCenter='History'>
        <div class=history><div class=items>${itemList}</div></div>
    <//>`
}

const ItemDetail = function (props) {
    const back=html`<div class=quizInfoBack onclick=${() => props.onBack()}>${'<'}</div>`

    const scoreboardBlock = props.item.scoreboard.map((s, i) => {
        return html`
            <li key=${i} class=score>${s.name} - ${s.score}</li>
        `
    })
    return html`<${Shell} headerLeft=${back} headerCenter=${props.item.title}>
        <div class=history>
            <ol>${scoreboardBlock}</ol>
        </div>
    <//>`
}

export default function History() {
    const [inOverview, setInOverview] = useState(true)
    const [item, setItem] = useState(null)

    const click = (item) => {
        setItem(item)
        setInOverview(false)
    }
    const back = () => {
        setItem(null)
        setInOverview(true)
    }

    return inOverview ? html`<${ItemList} onClick=${click} />` : html`<${ItemDetail} item=${item} onBack=${back} />` 
}

'use strict'

import { html, useState, useEffect } from '/lib/preact-3.1.0.standalone.module.js'

export default function Countdown(props) {
    const [secondsLeft, setSecondsLeft] = useState(props.seconds)

    const tick = () => {
        setSecondsLeft(seconds => (seconds === 0) ? seconds : seconds - 1)
    }

    // REVISE this caused a bit of trouble / introduced temporal coupling: e.g. if the component gets mounted too early and the countdown is still zero at this point, then it won't work
    //        - solution idea 1: do it based on server event, e.g. subscribe to the client's 'newRound' event and init the interval then - clear it when the round finishes or the component gets unmounted
    //        - solution idea 2: accept it / make sure we don't mount too early (current solution), since the added complexity of solution idea 1 is maybe not justified
    //        - right now I prefer idea 2 - any other solutions?
    useEffect(() => {
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [])

    return html`${secondsLeft}`
}

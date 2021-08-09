'use strict'

// REVISE depending on network delay this can get a bit out of sync, i.e. the server has already started ticking 5 seconds earlier, so the round might finish although the player still sees 5 seconds remaining
//        - solution idea 1: periodically sync time with server (probably does bear problems as also here there can be network delay)
//        - solution idea 2: the server always gives 5 extra seconds max, during which it waits for the clients to confirm they have timed out (or still send a response)
//        - right now I prefer idea 2 - any other solutions?
Gorilla.Countdown = function (props) {
    const [secondsLeft, setSecondsLeft] = React.useState(props.seconds)

    const tick = () => {
        setSecondsLeft(seconds => (seconds === 0) ? seconds : seconds - 1)
    }

    // REVISE this caused a bit of trouble/introduced temporal coupling: e.g. if the component gets mounted too early and the countdown is still zero at this point, then it won't work
    //        - solution idea 1: do it based on server event, e.g. subscribe to the adapter's "newRound" event and init the interval then - clear it when the round finishes or the component gets unmounted
    //        - solution idea 2: accept it / make sure we don't mount too early (current solution), since the added complexity of solution idea 1 is maybe not justified
    //        - right now I prefer idea 2 - any other solutions?
    React.useEffect(() => {
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [])

    return <h2>{secondsLeft}</h2>
}

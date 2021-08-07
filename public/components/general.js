'use strict'

Gorilla.Countdown = function (props) {
    const [secondsLeft, setSecondsLeft] = React.useState(props.seconds)

    React.useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(seconds => {
                if (seconds === 0) {
                    clearInterval(interval)
                    return seconds
                } else {
                    return seconds - 1
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return <h2>Counting down {secondsLeft}</h2>
}

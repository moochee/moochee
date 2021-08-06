'use strict'

Gorilla.HostGame = function (props) {
    Gorilla.HostGame.QRCode = function (props) {
        const canvas = React.useRef(null)
        React.useEffect(() => {
            if (canvas != null && canvas.current != null) {
                new QRious({ element: canvas.current, value: props.text, size: props.size })
            }
        })
        return (<canvas ref={canvas}></canvas>)
    }

    Gorilla.HostGame.Answer = function (props) {
        return <Gorilla.StickyButton color={props.color} onClick={() => null} text={props.answer.text} />
    }

    Gorilla.HostGame.Answers = function (props) {
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row' }}>
                <Gorilla.HostGame.Answer color='green' answer={props.answers[0]} />
                <Gorilla.HostGame.Answer color='purple' answer={props.answers[1]} />
            </div>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row' }}>
                <Gorilla.HostGame.Answer color='blue' answer={props.answers[2]} />
                <Gorilla.HostGame.Answer color='orange' answer={props.answers[3]} />
            </div>
        </div>
    }

    Gorilla.HostGame.QuestionAndAnswers = function (props) {
        return <div style={{ width: '60%', marginLeft: '20%' }}>
            <Gorilla.Countdown seconds={countDown} />
            <h1 style={{ textAlign: 'center', fontFamily: 'komika_textregular', fontSize: '3em', color: '#0070c0' }}>{props.question}</h1>
            <Gorilla.HostGame.Answers answers={props.answers} />
            <div id='footer' style={{ background: 'black', display: 'flex', justifyContent: 'center', flexDirection: 'row', width: '100%' }}>
                <img style={{ width: '25%' }} src='ACDC-Logo_Neg.png' />
                <img style={{ width: '25%' }} src='Cloud-Curriculum_Logo-with-Tagline_Neg.png' />
            </div>
        </div>
    }

    Gorilla.HostGame.Players = function (props) {
        const players = props.players.length > 0
            ? <div style={{ fontSize: '4em' }}>{props.players.map(p => p.avatar)}</div>
            : <ui5-label>No players yet - invite people by sending them the join URL above</ui5-label>

        return players
    }

    Gorilla.HostGame.WaitingToStart = function (props) {
        const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
        const urlCopiedToast = React.useRef(null)

        const copyToClipboard = () => {
            navigator.clipboard.writeText(joinUrl)
            urlCopiedToast.current.show()
        }

        return <div>
            <ui5-title level='H1'>Game {props.gameId}</ui5-title>
            <p />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <ui5-input style={{ 'width': '100%' }} readonly value={joinUrl}></ui5-input>
                <ui5-button icon='copy' onClick={copyToClipboard}></ui5-button>
            </div>
            <Gorilla.HostGame.QRCode text={joinUrl} size='200' />
            <p />
            <ui5-title level='H2'>Players:</ui5-title>
            <Gorilla.HostGame.Players players={props.players} />
            <ui5-toast ref={urlCopiedToast}>Join URL has been copied to clipboard!</ui5-toast>
        </div>
    }

    Gorilla.HostGame.PodiumPage = function (props) {
        return <div style={{ height: '100%' }}>
            <Gorilla.Podium players={props.players} />
            <ui5-button onClick={props.onNext} style={{ width: '100%' }}>Next</ui5-button>
        </div>
    }

    Gorilla.HostGame.PodiumFinalPage = function (props) {
        const [volume, setVolume] = React.useState(1)
        return <div style={{ height: '100%' }}>
            <Gorilla.PodiumFinal players={props.players} volume={volume} />
            <Gorilla.AudioControl onVolume={setVolume} />
        </div>
    }

    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(0)

    const onPlayerJoined = (gameId, player) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => {
                if (oldPlayers.length >= 1) {
                    setCanStart(true)
                }
                return [...oldPlayers, player]
            })
        }
    }

    const onPlayerDisconnected = (gameId, player) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => {
                if (oldPlayers.length <= 2) {
                    setCanStart(false)
                }
                return oldPlayers.filter(p => p.name != player)
            })
        }
    }

    const onRoundStarted = (gameId, newQuestion, secondsToGuess) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setResult(null)
            setCountDown(secondsToGuess)
        }
    }

    const onRoundFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
        }
    }

    const onGameFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
            setIsFinal(true)
        }
    }

    const start = () => {
        props.adapter.start(props.gameId)
        setCanStart(false)
    }

    const next = () => {
        props.adapter.start(props.gameId)
    }

    React.useEffect(() => {
        // REVISE Right now my feeling is, it is maybe better to just have one subscriber and in the subscriber, switch along the event id, instead of having all the different subscribers.
        //        On the server the event name is part of the message and not a separate 'channel', so anyway it got sent over the network already, so we don't significantly shrink performance/networking overhead here.
        //        Furthermore, separating the channels along the gameId is the better choice anyway, cause games scale infinitely, while the events will probably always be limited to <10 per game, so the 'eventing overhead' is absolutely acceptable, the 'coding overhead' with all those registrations is a much bigger concern...

        props.adapter.subscribe('playerJoined', onPlayerJoined)
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        props.adapter.subscribe('playerDisconnected', onPlayerDisconnected)
        return () => {
            props.adapter.unsubscribe('playerJoined', onPlayerJoined)
            props.adapter.unsubscribe('roundStarted', onRoundStarted)
            props.adapter.unsubscribe('roundFinished', onRoundFinished)
            props.adapter.unsubscribe('gameFinished', onGameFinished)
            props.adapter.unsubscribe('playerDisconnected', onPlayerDisconnected)
        }
    }, [])

    const waitingToStartBlock = !question && !result ? <Gorilla.HostGame.WaitingToStart gameId={props.gameId} players={players} /> : ''
    const questionBlock = question ? <Gorilla.HostGame.QuestionAndAnswers question={question.text} imageUrl='' answers={question.answers} /> : ''
    const startButton = canStart ? <ui5-button onClick={start} style={{ width: '100%' }}>Start</ui5-button> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.HostGame.PodiumPage players={result} onNext={next} /> : ''
    const podiumFinalBlock = result && isFinal ? <Gorilla.HostGame.PodiumFinalPage players={result} /> : ''

    return <Gorilla.Shell>
        {waitingToStartBlock}
        {startButton}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Gorilla.Shell>
}

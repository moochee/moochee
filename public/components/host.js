'use strict'

Gorilla.HostGame = function (props) {
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(0)
    const [volume, setVolume] = React.useState(1)

    const onPlayerJoined = (gameId, player) => {
        // REVISE do we even need all these 'IFs' (also in the other handlers below)? I thought socket.io already uses the right 'channel'...
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

    const waitingToStartBlock = !question && !result ? <Gorilla.HostGame.WaitingToStart gameId={props.gameId} players={players} volume={volume}/> : ''
    const questionBlock = question ? <Gorilla.HostGame.QuestionAndAnswers countDown={countDown} question={question.text} imageUrl='' answers={question.answers} /> : ''
    const startButton = canStart ? <ui5-button onClick={start} style={{ width: '100%' }}>Start</ui5-button> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.HostGame.PodiumPage players={result} onNext={next} /> : ''
    const podiumFinalBlock = result && isFinal ? <Gorilla.HostGame.PodiumFinalPage players={result} volume={volume}/> : ''

    return <Gorilla.Shell onVolume={setVolume}>
        {waitingToStartBlock}
        {startButton}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Gorilla.Shell>
}

Gorilla.HostGame.QRCode = function (props) {
    const canvas = React.useRef(null)
    React.useEffect(() => {
        // REVISE is this "if" even needed? Is the "useEffect" even needed? I think the QR code is nothing which has a global stat/side effect, and anyway React won't re-render as long as its properties don't change, which should not happen
        if (canvas != null && canvas.current != null) {
            new QRious({ element: canvas.current, value: props.text, size: props.size })
        }
    }) // REVISE usually it closes with argument [], so that it only happens on enter, any particular reason why it's not the case here?
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
        <Gorilla.Countdown seconds={props.countDown} />
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
    const music = React.useRef({})
    React.useEffect(() => music.current.play(), [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinUrl)
        urlCopiedToast.current.show()
    }

    music.current.volume = props.volume

    return <div>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
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
    // REVISE can probably remove the surrounding div
    return <div style={{ height: '100%' }}>
        <Gorilla.PodiumFinal players={props.players} volume={props.volume} />
    </div>
}

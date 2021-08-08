'use strict'

Gorilla.HostGame = function (props) {
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(null)
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
            setCountDown(null)
        }
    }

    const onGameFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
            setIsFinal(true)
        }
    }

    // REVISE I think in backend we always say 'next', here we always say 'start' - feels confusing
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

    const waitingToStart = !question && !result
    const waitingToStartBlock = waitingToStart ? <Gorilla.HostGame.WaitingToStart gameId={props.gameId} players={players} volume={volume} canStart={canStart} adapter={props.adapter} /> : ''
    const questionBlock = question && (countDown !== null) ? <Gorilla.HostGame.QuestionAndAnswers countDown={countDown} question={question.text} imageUrl='' answers={question.answers} /> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.HostGame.PodiumPage players={result} onNext={next} /> : ''
    const podiumFinalBlock = result && isFinal ? <Gorilla.HostGame.PodiumFinalPage players={result} volume={volume} /> : ''

    return <Gorilla.Shell info={`Game ${props.gameId}`} header='Passionate Product Ownership' onVolume={setVolume}>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Gorilla.Shell>
}

Gorilla.HostGame.Answer = function (props) {
    // FIXME for host the buttons should not be clickable and also have no hover effect
    return <Gorilla.StickyButton color={props.color} onClick={() => null} text={props.answer.text} />
}

// FIXME the stickies should be rendered dynamically, we have questions with less than 4 choices...
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
    </div>
}

Gorilla.HostGame.QRCode = function (props) {
    const canvas = React.useRef(null)
    React.useEffect(() => {
        // REVISE is this "if" even needed? Is the "useEffect" even needed? I think the QR code is nothing which has a global stat/side effect, and anyway React won't re-render as long as its properties don't change, which should not happen
        if (canvas != null && canvas.current != null) {
            new QRious({ element: canvas.current, value: props.text, size: 200 })
        }
    }) // REVISE usually it closes with argument [], so that it only happens on enter, any particular reason why it's not the case here?
    return (<canvas style={{ height: '100%' }} ref={canvas}></canvas>)
}

// TODO make page look bit nicer / layout responsive (esp. phone in portrait mode)
// TODO font
Gorilla.HostGame.WaitingToStart = function (props) {
    const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
    const music = React.useRef({})
    const [copied, setCopied] = React.useState('')
    React.useEffect(() => music.current.play(), [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinUrl)
        setCopied('copied!')
    }

    const start = () => {
        props.adapter.start(props.gameId)
    }

    const players = props.players.length > 0
        ? <div style={{ fontSize: '8em' }}>{props.players.map(p => p.avatar)}</div>
        : <div style={{ fontSize: '3em' }}>No players yet - let people scan the QR code or send them the join URL</div>

    music.current.volume = props.volume

    const startButton = props.canStart ? <Gorilla.StickyCard onClick={start} color='blue' text='Start' /> : ''

    return <div style={{ height: '100%' }}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
            <Gorilla.HostGame.QRCode text={joinUrl} />
            <div style={{ 'width': '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <input style={{ 'width': '100%', 'marginRight': 'auto' }} readOnly value={joinUrl}></input>
                    <span onClick={copyToClipboard} style={{ fontSize: '1.7em', cursor: 'pointer' }}>📋</span>
                    <div>{copied}</div>
                </div>
                <h1 level='H2'>Players:</h1>
                {players}
                {startButton}
            </div>
        </div>
    </div>
}

Gorilla.HostGame.PodiumPage = function (props) {
    return <div style={{ height: '100%' }}>
        <Gorilla.Podium players={props.players} />
        <button onClick={props.onNext} style={{ width: '100%' }}>Next</button>
    </div>
}

Gorilla.HostGame.PodiumFinalPage = function (props) {
    // REVISE can probably remove the surrounding div
    return <div style={{ height: '100%' }}>
        <Gorilla.PodiumFinal players={props.players} volume={props.volume} />
    </div>
}

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

    // TODO display quiz title from server
    return <Gorilla.Shell info={`Game ${props.gameId}`} header={props.quizTitle} onVolume={setVolume} fullScreenContent={Boolean(result)}>
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
        <div style={{ position: 'fixed', top: '7vh', right: '4vw', fontSize: '3em' }}>
            <Gorilla.Countdown seconds={props.countDown} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '3em', color: '#0070c0' }}>{props.question}</h1>
        <Gorilla.HostGame.Answers answers={props.answers} />
    </div>
}

Gorilla.HostGame.QRCode = function (props) {
    const appendQr = (el) => new QRious({ element: el, value: props.url, size: 1024 })
    return <canvas className='hostWaitingQrCode' ref={appendQr} />
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
        ? <div className='hostWaitingPlayerInfo'>{props.players.map(p => p.avatar)}</div>
        : <div className='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>No players yet - let people scan the QR code or send them the join URL</div>

    music.current.volume = props.volume

    const startButton = props.canStart ? <Gorilla.StickyCard onClick={start} color='blue' text='Start' /> : ''

    return <div className='hostWaiting'>
        <audio ref={music} loop src='components/host/positive-funny-background-music-for-video-games.mp3'></audio>
        <div className='hostWaitingJoinUrl'>
            <input readOnly value={joinUrl} onClick={copyToClipboard}></input>
            <button onClick={copyToClipboard}>📋</button>
            <div>{copied}</div>
        </div>
        <div className='hostWaitingSplitContainer'>
            <Gorilla.HostGame.QRCode url={joinUrl} />
            {players}
        </div>
        <div className='hostWaitingStart'>{startButton}</div>
    </div>
}

Gorilla.HostGame.PodiumPage = function (props) {
    return <div style={{ height: '100%' }}>
        <Gorilla.Podium players={props.players} />
        <div style={{ position: 'absolute', top: '50vh', transform: 'translateY(-50%)', right: '5vw' }}>
            <Gorilla.StickyCard onClick={props.onNext} color='blue' text='Next Question ➡' />
        </div>
    </div>
}

Gorilla.HostGame.PodiumFinalPage = function (props) {
    return <Gorilla.PodiumFinal players={props.players} volume={props.volume} />
}

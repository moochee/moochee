'use strict'

Gorilla.HostGame = function (props) {
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(null)
    const [volume, setVolume] = React.useState(1)

    const music = React.useRef({})
    music.current.volume = volume

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
                return oldPlayers.filter(p => p != player)
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
        music.current.play()
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
    const podiumFinalBlock = result && isFinal ? <Gorilla.HostGame.PodiumFinalPage players={result} volume={volume} onReplay={props.onReplay} /> : ''
    const audioControl = <Gorilla.AudioControl onVolume={setVolume} />

    return <Gorilla.Shell headerLeft={`Game ${props.gameId}`} headerCenter={props.quizTitle} headerRight={audioControl} fullScreenContent={Boolean(result)}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Gorilla.Shell>
}

Gorilla.HostGame.Answer = function (props) {
    return <Gorilla.StickyCard color={props.color} text={props.answer.text} />
}

Gorilla.HostGame.Answers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']
    const answersBlock = props.answers.map((answer, index) => {
        return <Gorilla.HostGame.Answer key={index} color={colors[index]} answer={answer} />
    })
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        {answersBlock}
    </div>
}

Gorilla.HostGame.QuestionAndAnswers = function (props) {
    return <div style={{ width: '50%', marginLeft: '25%' }}>
        <div style={{ position: 'absolute', top: '6vh', right: '6vh', fontSize: '4vh' }}>
            <Gorilla.Countdown seconds={props.countDown} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '4vh', color: '#0070c0' }}>{props.question}</h1>
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
    const [copied, setCopied] = React.useState('')

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinUrl)
        setCopied('copied!')
    }

    const start = () => {
        props.adapter.start(props.gameId)
    }

    const players = props.players.length > 0
        ? <div className='hostWaitingPlayerInfo'>{props.players.map(p => <div key={p} className='hostWaitingBounceIn'>{p}</div>)}</div>
        : <div className='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>No players yet - let people scan the QR code or send them the join URL</div>

    const startButton = props.canStart ? <Gorilla.StickyButton onClick={start} color='blue' text='Start' /> : ''

    return <div className='hostWaiting'>
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

// REVISE move all styling to css file
Gorilla.HostGame.PodiumPage = function (props) {
    return <div style={{ height: '100%' }}>
        <Gorilla.Podium players={props.players} />
        <div style={{ position: 'absolute', bottom: '0vh', transform: 'translateY(-50%)', right: '5vw' }}>
            <Gorilla.StickyButton onClick={props.onNext} color='blue' text='Next Question ➡' />
        </div>
    </div>
}

Gorilla.HostGame.PodiumFinalPage = function (props) {
    const [canReplay, setCanReplay] = React.useState(false)

    React.useEffect(() => {
        setTimeout(() => setCanReplay(true), 20000)
    }, [])

    const replayButton = canReplay ? <div style={{ position: 'absolute', top: '50vh', transform: 'translateY(-50%)', right: '5vw' }}>
        <Gorilla.StickyButton onClick={props.onReplay} color='blue' text='Replay 🔥' />
    </div> : ''

    return <div style={{ height: '100%' }}>
        <Gorilla.PodiumFinal players={props.players} volume={props.volume} />
        {replayButton}
    </div>
}

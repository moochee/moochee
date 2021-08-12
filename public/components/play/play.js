'use strict'

Gorilla.PlayGame = function (props) {
    const [question, setQuestion] = React.useState(null)
    const [result, setResult] = React.useState(null)
    const [waitingForOtherResponses, setWaitingForOtherResponses] = React.useState(false)
    const [waitingToStart, setWaitingToStart] = React.useState(true)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(null)
    const [volume, setVolume] = React.useState(1)
    const [score, setScore] = React.useState(0)

    const music = React.useRef({})
    music.current.volume = volume

    const onPlayerJoined = (gameId, player) => {
        // REVISE do we even need all these 'IFs' (also in the other handlers below)? I thought socket.io already uses the right 'channel'...
        if (gameId === props.gameId) {
            props.onPlayerJoined(player)
        }
    }

    const onPlayerDisconnected = (gameId, player) => {
        if (gameId === props.gameId) {
            props.onPlayerDisconnected(player)
        }
    }

    const onRoundStarted = (gameId, newQuestion, secondsToGuess) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setWaitingForOtherResponses(false)
            setResult(null)
            setWaitingToStart(false)
            setCountDown(secondsToGuess)
        }
    }

    const onRoundFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setWaitingForOtherResponses(false)
            setResult(result)
            setCountDown(null)
            setScore(result.find(r => r.avatar === props.playerAvatar).score)
        }
    }

    const onGameFinished = (gameId, result) => {
        onRoundFinished(gameId, result)
        setIsFinal(true)
    }

    const guess = (answerId) => {
        props.adapter.guess(props.gameId, question.id, props.playerName, answerId)
        setQuestion(null)
        setWaitingForOtherResponses(true)
        setResult(null)
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

    const showPodium = Boolean(result) && !isFinal
    const waitingToStartBlock = waitingToStart ? <Gorilla.PlayGame.WaitingToStart otherPlayers={props.otherPlayers} /> : ''
    const questionBlock = question && (countDown !== null) ? <Gorilla.PlayGame.QuestionAndAnswers countDown={countDown} question={question.text} answers={question.answers} onGuess={guess} /> : ''
    const podiumBlock = showPodium ? <Gorilla.Podium players={result} /> : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : <Gorilla.AudioControl onVolume={setVolume} />

    return <Gorilla.Shell headerLeft={props.quizTitle} headerRight={audioControl} footerLeft={`${props.playerAvatar} ${props.playerName}`} footerRight={`Score: ${score}`} fullScreenContent={showPodium}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {waitingBlockForOtherResponses}
        {gameOverBlock}
    </Gorilla.Shell>
}

Gorilla.PlayGame.WaitingToStart = function (props) {
    const label = props.otherPlayers.length === 0 ? <h2>Waiting for other players...</h2> : <h2>You are up against:</h2>

    const otherPlayers = props.otherPlayers.map(p => <div key={p} className='playWaitingBounceIn'>{p}</div>)
    return <div>
        {label}
        <div className='hostWaitingPlayerInfo'>{otherPlayers}</div>
    </div>
}

Gorilla.PlayGame.Answer = function (props) {
    return <Gorilla.StickyButton color={props.color} onClick={() => props.onGuess(props.answer.id)} text={props.answer.text} />
}

Gorilla.PlayGame.Answers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']
    const answersBlock = props.answers.map((answer, index) => {
        return <Gorilla.PlayGame.Answer key={index} color={colors[index]} answer={answer} onGuess={props.onGuess} />
    })
    return <div className='playAnswers'>
        {answersBlock}
    </div>
}

Gorilla.PlayGame.QuestionAndAnswers = function (props) {
    return <div>
        <h1 className='playQuestion'>{props.question}</h1>
        <Gorilla.PlayGame.Answers answers={props.answers} onGuess={props.onGuess} />
    
        <div className='playCountdown'>
            <Gorilla.Countdown seconds={props.countDown} />
        </div>
    </div>
}

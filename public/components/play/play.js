'use strict'

Gorilla.PlayGame = function (props) {
    const [question, setQuestion] = React.useState(null)
    const [result, setResult] = React.useState(null)
    const [waitingForOtherResponses, setWaitingForOtherResponses] = React.useState(false)
    const [waitingToStart, setWaitingToStart] = React.useState(true)
    const [isFinal, setIsFinal] = React.useState(false)
    const [volume, setVolume] = React.useState(1)

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

    const onRoundStarted = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setWaitingForOtherResponses(false)
            setResult(null)
            setWaitingToStart(false)
        }
    }

    const onRoundFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setWaitingForOtherResponses(false)
            setResult(result)
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

    const waitingToStartBlock = waitingToStart ? <Gorilla.PlayGame.WaitingToStart otherPlayers={props.otherPlayers} volume={volume} /> : ''
    const questionBlock = question ? <Gorilla.PlayGame.QuestionAndAnswers question={question.text} imageUrl='' answers={question.answers} onGuess={guess} /> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.Podium players={result} /> : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''

    return <Gorilla.Shell onVolume={setVolume} info={`${props.playerAvatar} ${props.playerName}`} fullScreenContent={Boolean(result && !isFinal)}>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {waitingBlockForOtherResponses}
        {gameOverBlock}
    </Gorilla.Shell>
}

Gorilla.PlayGame.WaitingToStart = function(props) {
    const music = React.useRef({})

    const label = props.otherPlayers.length === 0 ? <h2>Waiting for other players...</h2> : <h2>You are up against:</h2>
    music.current.volume = props.volume

    const otherPlayers = props.otherPlayers.map(p => <div key={p} className='playWaitingBounceIn'>{p}</div>)
    return <div>
        <audio ref={music} loop src='components/host/positive-funny-background-music-for-video-games.mp3'></audio>
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
        return < Gorilla.PlayGame.Answer key={index} color={colors[index]} answer={answer} onGuess={props.onGuess} />
    })
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        {answersBlock}
    </div>
}

Gorilla.PlayGame.QuestionAndAnswers = function (props) {
    return <div className='playQuestionAnswers'>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ textAlign: 'center', fontSize: '4vh', color: '#0070c0' }}>{props.question}</h1>
            <img width='80%' src={props.imageUrl} />
        </div>

        <Gorilla.PlayGame.Answers answers={props.answers} onGuess={props.onGuess} />
    </div>
}

'use strict'

Gorilla.PlayGame = function (props) {
    const [question, setQuestion] = React.useState(null)
    const [result, setResult] = React.useState(null)
    const [waiting, setWaiting] = React.useState(false)
    const [isFinal, setIsFinal] = React.useState(false)
    const [volume, setVolume] = React.useState(1)

    console.log(volume)

    const onRoundStarted = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setWaiting(false)
            setResult(null)
        }
    }

    const onRoundFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setWaiting(false)
            setResult(result)
        }
    }

    const onGameFinished = (gameId, result) => {
        onRoundFinished(gameId, result)
        setIsFinal(true)
    }

    const guess = (answerId) => {
        props.adapter.guess(props.gameId, question.id, props.playerName, answerId)
        // REVISE I am not sure if it is even right to reset this things. Shouldn't it only be done on event from the server?
        setQuestion(null)
        setWaiting(true)
        setResult(null)
    }

    React.useEffect(() => {
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        return () => {
            props.adapter.unsubscribe('roundStarted', onRoundStarted)
            props.adapter.unsubscribe('roundFinished', onRoundFinished)
            props.adapter.unsubscribe('gameFinished', onGameFinished)
        }
    }, [])

    const questionBlock = question ? <Gorilla.PlayGame.QuestionAndAnswers question={question.text} imageUrl='' answers={question.answers} onGuess={guess} /> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.Podium players={result} /> : ''
    const waitingBlock = waiting ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''

    return <Gorilla.Shell onVolume={setVolume} info={`${props.playerAvatar} ${props.playerName}`} fullScreenContent={Boolean(result)}>
        {questionBlock}
        {podiumBlock}
        {waitingBlock}
        {gameOverBlock}
    </Gorilla.Shell>
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
            <h1 style={{ textAlign: 'center', fontFamily: 'komika_textregular', fontSize: '4vh', color: '#0070c0' }}>{props.question}</h1>
            <img width='80%' src={props.imageUrl} />
        </div>

        <Gorilla.PlayGame.Answers answers={props.answers} onGuess={props.onGuess} />
    </div>
}

'use strict'

Gorilla.PlayGame = function (props) {
    Gorilla.PlayGame.Answer = function (props) {
        return <Gorilla.StickyButton color={props.color} onClick={() => guess(props.answer.id)} text={props.answer.text} />
    }

    Gorilla.PlayGame.Answers = function (props) {
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row' }}>
                <Gorilla.PlayGame.Answer color='green' answer={props.answers[0]} />
                <Gorilla.PlayGame.Answer color='purple' answer={props.answers[1]} />
            </div>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row' }}>
                <Gorilla.PlayGame.Answer color='blue' answer={props.answers[2]} />
                <Gorilla.PlayGame.Answer color='orange' answer={props.answers[3]} />
            </div>
        </div>
    }

    Gorilla.PlayGame.QuestionAndAnswers = function (props) {
        return <div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ui5-label>{props.question}</ui5-label>
                <img width='80%' src={props.imageUrl} />
            </div>

            <Gorilla.PlayGame.Answers answers={props.answers} />
        </div>
    }

    const [question, setQuestion] = React.useState(null)
    const [result, setResult] = React.useState(null)
    const [waiting, setWaiting] = React.useState(false)
    const [isFinal, setIsFinal] = React.useState(false)

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

    const questionBlock = question ? <Gorilla.PlayGame.QuestionAndAnswers question={question.text} imageUrl='' answers={question.answers} /> : ''
    const podiumBlock = result && !isFinal ? <Gorilla.Podium players={result} /> : ''
    const waitingBlock = waiting ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''

    return <div>
        <ui5-title level='H1'>Game {props.gameId}</ui5-title>
        <ui5-title level='H2'>Playing as {props.playerName}</ui5-title>
        {questionBlock}
        {podiumBlock}
        {waitingBlock}
        {gameOverBlock}
    </div>
}

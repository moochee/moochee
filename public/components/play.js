'use strict'

function PlayGame(props) {
    function Answer(props) {
        return <StickyButton color={props.color} onClick={() => guess(props.text)} text={props.text} />
    }

    function Answers(props) {
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "center", display: "flex", flexDirection: "row" }}>
                <Answer color="green" text={props.answers[0]} />
                <Answer color="purple" text={props.answers[1]} />
            </div>
            <div style={{ justifyContent: "center", display: "flex", flexDirection: "row" }}>
                <Answer color="blue" text={props.answers[2]} />
                <Answer color="orange" text={props.answers[3]} />
            </div>
        </div>
    }

    function QuestionAndAnswers(props) {
        return <div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <ui5-label>{props.question}</ui5-label>
                <img width="80%" src={props.imageUrl} />
            </div>

            <Answers answers={props.answers} />
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

    const guess = (answer) => {
        props.adapter.guess(props.gameId, question.text, props.playerName, answer)
        setQuestion(null)
        setWaiting(true)
        setResult(null)
    }

    React.useEffect(() => {
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        return () => {
            props.adapter.unsubscribe(onRoundStarted)
            props.adapter.unsubscribe(onRoundFinished)
            props.adapter.unsubscribe(onGameFinished)
        }
    }, [])

    const questionBlock = question ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const podiumBlock = result && !isFinal ? <Podium players={result} /> : ''
    const waitingBlock = waiting ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <ui5-title level="H2">Playing as {props.playerName}</ui5-title>
        {questionBlock}
        {podiumBlock}
        {waitingBlock}
        {gameOverBlock}
    </div>
}

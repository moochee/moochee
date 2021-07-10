'use strict'

function PlayGame(props) {
    function Answer(props) {
        return <ui5-button design="Default" onClick={e => guess(e.target.innerText)} style={{ width: "50%" }}>{props.text}</ui5-button>
    }

    function Answers(props) {
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Answer text={props.answers[0]} />
                <Answer text={props.answers[1]} />
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Answer text={props.answers[2]} />
                <Answer text={props.answers[3]} />
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

    const onNewQuestion = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setResult(null)
        }
    }

    const onRoundFinished = (gameId, result) => {
        console.log('onRoundFinished')
        console.log(gameId)
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
        }
    }

    const guess = (answer) => {
        props.adapter.guess(props.gameId, question, props.playerName, answer)
    }

    React.useEffect(() => {
        props.adapter.subscribe('newQuestion', onNewQuestion)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        return () => {
            props.adapter.unsubscribe(onNewQuestion)
            props.adapter.unsubscribe(onRoundFinished)
        }
    }, [])

    const questionBlock = question ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const podiumBlock = result ? <Podium players={[result[0], result[1], result[2], result[3]]} /> : ''
    console.log(podiumBlock)

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <ui5-title level="H2">Playing as {props.playerName}</ui5-title>
        {questionBlock}
        {podiumBlock}
    </div>
}

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
    const [playerScores, setPlayerScores] = React.useState([])
    const [state, setState] = React.useState(null)

    const onNewQuestion = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setState('question')
        }
    }

    const onEvaluate = (gameId, players) => {
        if (gameId === props.gameId) {
            setPlayerScores(() => {
                return [...players]
            })
            setState('podium')
        }
    }
    const guess = (answer) => {
        props.adapter.guess(props.gameId, question.sequence, props.playerName, answer)
    }

    // REVISE it seems there is some redundancy between Host/Player wrt displaying the question / responding to new question being presented
    //          maybe it is ok since we Host and Player to deal with this slightly differently in future, so we don't refactor to a re-use component right now - revisit later!
    React.useEffect(() => {
        props.adapter.subscribeNewQuestion(onNewQuestion)
        props.adapter.subscribeEvaluate(onEvaluate)
        return () => {
            props.adapter.unsubscribeNewQuestion(onNewQuestion)
            props.adapter.unsubscribeEvaluate(onEvaluate)
        }
    }, [])

    const questionBlock = question && state === 'question' ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const podiumBlock = state === 'podium' ? <Podium players={playerScores} /> : ''

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <ui5-title level="H2">Playing as {props.playerName}</ui5-title>
        {questionBlock}
        {podiumBlock}
    </div>
}
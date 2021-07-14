'use strict'

function HostGame(props) {
    function Answer(props) {
        return <StickyButton color={props.color} onClick={() => null} text={props.text} />
    }

    function Answers(props) {
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Answer color="green" text={props.answers[0]} />
                <Answer color="purple" text={props.answers[1]} />
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
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

    function Player(props) {
        return <ui5-card heading={props.name}>
            <div style={{ fontSize: '4em' }} slot="avatar">{props.avatar}</div>
        </ui5-card>
    }

    function Players(props) {
        const players = props.players.length > 0
            ? props.players.map((p) => <Player key={p.name} name={p.name} avatar={p.avatar} />)
            : <ui5-label>No players yet - invite people by sending them the join URL above</ui5-label>

        return <div>{players}</div>
    }

    let joinUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [canNext, setCanNext] = React.useState(false)
    const [result, setResult] = React.useState(null)

    const urlCopiedToast = React.createRef()

    const onPlayerJoined = (gameId, player) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => {
                if (oldPlayers.length >= 1) {
                    setCanStart(true)
                }
                return [...oldPlayers, player]
            })
        }
    }

    const onRoundStarted = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
            setResult(null)
        }
    }

    const onRoundFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            console.log(result)
            setResult(result)
            setCanNext(true)
        }
    }
    
    const onGameFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
            setCanNext(false)
        }
    }

    const start = () => {
        props.adapter.start(props.gameId)
        setCanStart(false)
    }

    const next = () => {
        props.adapter.start(props.gameId)
        setCanNext(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinUrl)
        urlCopiedToast.current.show()
    }

    React.useEffect(() => {
        props.adapter.subscribe('playerJoined', onPlayerJoined)
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        return () => {
            props.adapter.unsubscribe(onPlayerJoined)
            props.adapter.unsubscribe(onRoundStarted)
            props.adapter.unsubscribe(onRoundFinished)
            props.adapter.unsubscribe(onGameFinished)
        }
    }, [])

    console.log(result)
    console.log(canNext)

    const questionBlock = question ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const startButton = canStart ? <ui5-button onClick={start} style={{ width: "100%" }}>Start</ui5-button> : ''
    const podiumBlock = result ? <Podium players={result} /> : ''
    const nextButton = canNext ? <ui5-button onClick={next} style={{ width: "100%" }}>Next</ui5-button> : ''

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <p />
        <div style={{ display: "flex", flexDirection: "row" }}>
            <ui5-input style={{ "width": "100%" }} readonly value={joinUrl}></ui5-input>
            <ui5-button icon="copy" onClick={copyToClipboard}></ui5-button>
        </div>
        <p />
        <ui5-title level="H2">Players:</ui5-title>
        <Players players={players} />
        <ui5-toast ref={urlCopiedToast}>Join URL has been copied to clipboard!</ui5-toast>
        {startButton}
        {questionBlock}
        {podiumBlock}
        {nextButton}
    </div>
}

'use strict'

function HostGame(props) {
    function Answer(props) {
        return <ui5-button design="Default" style={{ width: "50%" }}>{props.text}</ui5-button>
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

    let playerUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)

    const onPlayerJoined = (gameId, name, avatar) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => {
                if (oldPlayers.length >= 1) {
                    setCanStart(true)
                }
                return [...oldPlayers, { name, avatar }]
            })
        }
    }

    const onNewQuestion = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
        }
    }

    const start = () => {
        props.adapter.start(props.gameId)
        setCanStart(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(playerUrl)
        document.getElementById("playerUrlCopied").show()
    }

    React.useEffect(() => {
        props.adapter.subscribeJoin(onPlayerJoined)
        props.adapter.subscribeNewQuestion(onNewQuestion)
        return () => {
            props.adapter.unsubscribeJoin(onPlayerJoined)
            props.adapter.unsubscribeNewQuestion(onNewQuestion)
        }
    }, [])

    const questionBlock = question ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const startButton = canStart ? <ui5-button onClick={start} style={{ width: "100%" }}>Start</ui5-button> : ''

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <p />
        <div style={{ display: "flex", flexDirection: "row" }}>
            <ui5-input style={{ "width": "100%" }} readonly value={playerUrl}></ui5-input>
            <ui5-button icon="copy" onClick={copyToClipboard}></ui5-button>
        </div>
        <p />
        <ui5-title level="H2">Players:</ui5-title>
        <Players players={players} />
        <ui5-toast id="playerUrlCopied">Player's URL has been copied to clipboard!</ui5-toast>
        {startButton}
        {questionBlock}
    </div>
}

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
            <img src={props.avatar} slot="avatar" />
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
    const [isStarted, setIsStarted] = React.useState(false)

    const onPlayerJoined = (gameId, playerName) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => [...oldPlayers, { name: playerName, avatar: null }])
        }
    }

    const onNewQuestion = (gameId, newQuestion) => {
        if (gameId === props.gameId) {
            setQuestion(newQuestion)
        }
    }

    const start = () => {
        setIsStarted(true)
        props.adapter.start(props.gameId)
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
        FIXME disabled does not work as mentioned in docu
        <ui5-button disabled="false" onClick={start} style={{ width: "100%" }}>Start</ui5-button>
        {questionBlock}
    </div>
}

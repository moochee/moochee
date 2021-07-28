'use strict'

function HostGame(props) {
    function QRCode(props) {
        const canvas = React.useRef(null)
        React.useEffect(() => {
            if (canvas != null && canvas.current != null) {
                // REVISE I don't understand why we have to assign a variable that is then not used. I am guessing the constructor invocation has a side effect (*puke*), so the variable assignment is not needed...
                let qr = new QRious({
                    element: canvas.current,
                        value: props.text,
                        size: props.size
                })
            }
        })
        return(<canvas ref={canvas}></canvas>)
    }

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

    function Players(props) {
        const players = props.players.length > 0
            ? <div style={{fontSize: "4em"}}>{props.players.map(p => p.avatar)}</div>
            : <ui5-label>No players yet - invite people by sending them the join URL above</ui5-label>

        return players
    }

    function WaitingToStart(props) {
        const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
        const urlCopiedToast = React.useRef(null)
        
        const copyToClipboard = () => {
            navigator.clipboard.writeText(joinUrl)
            urlCopiedToast.current.show()
        }
        
        return <div>
            <p />
            <div style={{ display: "flex", flexDirection: "row" }}>
                <ui5-input style={{ "width": "100%" }} readonly value={joinUrl}></ui5-input>
                <ui5-button icon="copy" onClick={copyToClipboard}></ui5-button>
            </div>
            <QRCode text={joinUrl} size="200"/>
            <p />
            <ui5-title level="H2">Players:</ui5-title>
            <Players players={props.players} />
            <ui5-toast ref={urlCopiedToast}>Join URL has been copied to clipboard!</ui5-toast>
        </div>
    }

    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)

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

    const onPlayerDisconnected = (gameId, player) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => {
                if (oldPlayers.length <= 2) {
                    setCanStart(false)
                }
                return oldPlayers.filter(p => p.name != player)
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
            setResult(result)
        }
    }
    
    const onGameFinished = (gameId, result) => {
        if (gameId === props.gameId) {
            setQuestion(null)
            setResult(result)
        }
    }

    const start = () => {
        props.adapter.start(props.gameId)
        setCanStart(false)
    }

    const next = () => {
        props.adapter.start(props.gameId)
    }

    React.useEffect(() => {
        props.adapter.subscribe('playerJoined', onPlayerJoined)
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        props.adapter.subscribe('playerDisconnected', onPlayerDisconnected)
        return () => {
            props.adapter.unsubscribe(onPlayerJoined)
            props.adapter.unsubscribe(onRoundStarted)
            props.adapter.unsubscribe(onRoundFinished)
            props.adapter.unsubscribe(onGameFinished)
            props.adapter.unsubscribe(onPlayerDisconnected)
        }
    }, [])

    const waitingToStartBlock = !question && !result ? <WaitingToStart gameId={props.gameId} players={players}/> : ''
    const questionBlock = question ? <QuestionAndAnswers question={question.text} imageUrl="" answers={question.answers} /> : ''
    const startButton = canStart ? <ui5-button onClick={start} style={{ width: "100%" }}>Start</ui5-button> : ''
    const podiumBlock = result ? <Podium players={result} onNext={next} /> : ''

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        {waitingToStartBlock}
        {startButton}
        {questionBlock}
        {podiumBlock}
    </div>
}

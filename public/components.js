'use strict'

function Podium() {
    return <div>
    </div>
}

function Question(props) {
    return <div style={{ display: "flex", flexDirection: "column" }}>
        <ui5-label>{props.text}</ui5-label>
        <img width="80%" src={props.imageUrl} />
    </div>
}

function AnswerBlock(props) {
    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <Answer text={props.answer1} />
            <Answer text={props.answer2} />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <Answer text={props.answer3} />
            <Answer text={props.answer4} />
        </div>
    </div>
}

function Entrance(props) {
    // TODO enable join button only when correct game id (e.g. exactly 6 numbers)
    const [gameId, setGameId] = React.useState('')
    const updateGameId = (event) => setGameId(event.target.value)
    const [playerName, setPlayerName] = React.useState('')
    const updatePlayerName = (event) => setPlayerName(event.target.value)

    const join = async () => {
        // TODO do we get avatar back? and if yes, what to do with it?
        await props.adapter.join(gameId, playerName)
        props.onJoin(gameId, playerName)
    }

    const host = async () => {
        const gameId = await props.adapter.host()
        props.onHost(gameId)
    }

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <ui5-title level="H1">Welcome to the Gorilla Quiz App!</ui5-title>
        <ui5-title level="H4">Host a new game or joing an existing one</ui5-title>
        <p />
        <ui5-button onClick={host}>Host Game</ui5-button>
        <ui5-panel header-text="Join Game">
            <ui5-label for="gameId" required>Game id</ui5-label>
            <ui5-input style={{ width: "100%" }} id="gameId" placeholder="Enter game id" value={gameId} onInput={updateGameId}></ui5-input>
            <p />
            <ui5-label for="playerName" required>Name</ui5-label>
            <ui5-input style={{ width: "100%" }} id="playerName" placeholder="Enter your name" value={playerName} onInput={updatePlayerName}></ui5-input>
            <p />
            <ui5-button style={{ width: "100%" }} onClick={join}>Join</ui5-button>
        </ui5-panel>
    </div>
}

function Answer(props) {
    return <ui5-button design="Default" onClick={props.onClick}>{props.text}</ui5-button>
}

// TODO make it a countdown
function Clock() {
    const [date, setDate] = React.useState(new Date())

    React.useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return <div>
        <h2>It is {date.toLocaleTimeString()}</h2>
    </div>
}

function PlayGame(props) {
    let [isClockShown, setIsClockShown] = React.useState(true)
    const toggleClock = () => setIsClockShown(!isClockShown)
    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <ui5-title level="H2">Playing as {props.playerName}</ui5-title>
        <Question text="Test question" imageUrl="" />
        <AnswerBlock answer1="sample answer 1" answer2="sample answer 2" answer3="sample answer 3" answer4="sample answer 4" />
    </div>
}

function Player(props) {
    return <ui5-card heading={props.name}>
        <img src={props.avatar} slot="avatar" />
    </ui5-card>
}

function Players(props) {
    const players = props.players.map((p) => <Player key={p.name} name={p.name} avatar={p.avatar} />)
    return <div>{players}</div>
}

function HostGame(props) {
    let playerUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [players, setPlayers] = React.useState([])

    const onJoin = (gameId, playerName) => {
        if (gameId === props.gameId) {
            setPlayers((oldPlayers) => [...oldPlayers, { name: playerName, avatar: null }])
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(playerUrl)
        document.getElementById("playerUrlCopied").show()
    }

    React.useEffect(() => {
        props.adapter.subscribeJoin(onJoin)
        return () => props.adapter.unsubscribeJoin(onJoin)
    }, [])

    return <div>
        <ui5-title level="H1">Game {props.gameId}</ui5-title>
        <p />
        <div style={{ display: "flex", flexDirection: "row" }}>
            <ui5-input style={{ "width": "100%" }} readonly value={playerUrl}></ui5-input>
            <ui5-button icon="copy" onClick={copyToClipboard}></ui5-button>
        </div>
        <p />
        <ui5-title level="H2">Players:</ui5-title>
        <ui5-toast id="playerUrlCopied">Player's URL has been copied to clipboard!</ui5-toast>
        <Players players={players} />
    </div>
}

function Music() {
    const audio = React.useRef(null)
    const [muted, setMuted] = React.useState(true)
    const toggleMute = () => setMuted(!muted)

    React.useEffect(() => audio.current.play(), [])

    // FIXME currently we run into errors if autop-playing before user interacted with page - fix e.g. by playing only after clicking host/join
    return <div>
        <audio id="audio" ref={audio} loop muted={muted} src="positive-funny-background-music-for-video-games.mp3"></audio>
        <ui5-button onClick={toggleMute} icon={muted ? 'sound' : 'sound-off'} aria-labelledby="mute"></ui5-button>
        <ui5-label style={{ display: "none" }} id="mute" aria-hidden="true">{muted ? 'Unmute' : 'Mute'} Sound</ui5-label>
    </div>
}

function References() {
    return <ui5-label>
        <ui5-link target="_blank" href="https://icons8.com/icon/58842/harambe-the-gorilla">Harambe the Gorilla</ui5-link> favicon by <ui5-link target="_blank" href="https://icons8.com">Icons8</ui5-link>
    </ui5-label>
}

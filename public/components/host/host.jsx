'use strict'

import AudioControl from '../audio/audio-control.jsx'
import Shell from '../shell/shell.jsx'

const Answer = function (props) {
    return <Gorilla.StickyCard color={props.color} text={props.answer.text} />
}

const Answers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']
    const answersBlock = props.answers.map((answer, index) => {
        return <Answer key={index} color={colors[index]} answer={answer} />
    })
    return <div className='hostAnswers'>
        {answersBlock}
    </div>
}

const QuestionAndAnswers = function (props) {
    return <div>
        <h1 className='hostQuestion'>{props.question}</h1>
        <Answers answers={props.answers} />

        <div className='hostCountdown'>
            <Gorilla.Countdown seconds={props.countDown} />
        </div>
    </div>
}

const QRCode = function (props) {
    const appendQr = (el) => new QRious({ element: el, value: props.url, size: 1024 })
    return <canvas className='hostWaitingQrCode' ref={appendQr} />
}

const WaitingToStart = function (props) {
    const joinUrl = `${window.location.origin}/#/play/${props.gameId}`
    const [copied, setCopied] = React.useState('')
    const joinUrlInput = React.useRef()

    function iosCopyToClipboard(el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const s = window.getSelection()
        s.removeAllRanges()
        s.addRange(range)
        el.setSelectionRange(0, el.value.length)
        document.execCommand('copy')
        el.setSelectionRange(-1, -1)
    }

    const copyToClipboard = () => {
        if (navigator.userAgent.match(/ipad|iphone/i)) {
            iosCopyToClipboard(joinUrlInput.current)
        } else {
            navigator.clipboard.writeText(joinUrl)
        }
        setCopied('copied!')
    }

    const start = () => {
        props.adapter.start(props.gameId)
    }

    const players = props.players.length > 0
        ? <div className='hostWaitingPlayerInfo'>{props.players.map(p => <div key={p} className='hostWaitingBounceIn'>{p}</div>)}</div>
        : <div className='hostWaitingPlayerInfo hostWaitingNoPlayersYet'>Let people scan the QR code or send them the join URL</div>

    const startButton = props.canStart ? <Gorilla.StickyButton onClick={start} color='blue' text='Start' /> : ''

    return <div className='hostWaiting'>
        <div className='hostWaitingJoinUrl'>
            <input ref={joinUrlInput} readOnly value={joinUrl} onClick={copyToClipboard}></input>
            <button onClick={copyToClipboard}>📋</button>
            <div>{copied}</div>
        </div>
        <div className='hostWaitingSplitContainer'>
            <QRCode url={joinUrl} />
            {players}
        </div>
        <div className='hostStartButton'>{startButton}</div>
    </div>
}

const PodiumPage = function (props) {
    return <div className='hostPodium'>
        <Gorilla.Podium players={props.players} />
        <div className='hostNextQuestionButton'>
            <Gorilla.StickyButton onClick={props.onNext} color='blue' text='Next Question' />
        </div>
    </div>
}

const PodiumFinalPage = function (props) {
    const [canBackHome, setCanBackHome] = React.useState(false)

    React.useEffect(() => {
        setTimeout(() => setCanBackHome(true), 20000)
    }, [])

    const backHomeButton = canBackHome ? <div className='hostBackHomeButton'>
        <Gorilla.StickyButton onClick={props.onBackHome} color='blue' text='Back Home 🔥' />
    </div> : ''

    return <div className='hostPodium'>
        <Gorilla.PodiumFinal players={props.players} volume={props.volume} />
        {backHomeButton}
    </div>
}

export default function Host (props) {
    const [players, setPlayers] = React.useState([])
    const [question, setQuestion] = React.useState(null)
    const [canStart, setCanStart] = React.useState(false)
    const [result, setResult] = React.useState(null)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(null)
    const [volume, setVolume] = React.useState(1)

    const music = React.useRef({})
    music.current.volume = volume

    const onPlayerJoined = (gameId, player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length >= 1) {
                setCanStart(true)
            }
            return [...oldPlayers, player]
        })
    }

    const onPlayerDisconnected = (gameId, player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length <= 2) {
                setCanStart(false)
            }
            return oldPlayers.filter(p => p != player)
        })
    }

    const onRoundStarted = (gameId, newQuestion, secondsToGuess) => {
        setQuestion(newQuestion)
        setResult(null)
        setCountDown(secondsToGuess)
    }

    const onRoundFinished = (gameId, result) => {
        setQuestion(null)
        setResult(result)
        setCountDown(null)
    }

    const onGameFinished = (gameId, result) => {
        setQuestion(null)
        setResult(result)
        setIsFinal(true)
    }

    const next = () => {
        // REVISE I think in backend we always say 'next', here we always say 'start' - feels confusing
        props.adapter.start(props.gameId)
    }

    React.useEffect(() => {
        music.current.play()
        props.adapter.subscribe('playerJoined', onPlayerJoined)
        props.adapter.subscribe('roundStarted', onRoundStarted)
        props.adapter.subscribe('roundFinished', onRoundFinished)
        props.adapter.subscribe('gameFinished', onGameFinished)
        props.adapter.subscribe('playerDisconnected', onPlayerDisconnected)
        return () => {
            props.adapter.unsubscribe('playerJoined', onPlayerJoined)
            props.adapter.unsubscribe('roundStarted', onRoundStarted)
            props.adapter.unsubscribe('roundFinished', onRoundFinished)
            props.adapter.unsubscribe('gameFinished', onGameFinished)
            props.adapter.unsubscribe('playerDisconnected', onPlayerDisconnected)
        }
    }, [])

    const showPodium = Boolean(result)
    const waitingToStart = !question && !result
    const waitingToStartBlock = waitingToStart ? <WaitingToStart gameId={props.gameId} players={players} volume={volume} canStart={canStart} adapter={props.adapter} /> : ''
    const questionBlock = question && (countDown !== null) ? <QuestionAndAnswers countDown={countDown} question={question.text} answers={question.answers} /> : ''
    const podiumBlock = showPodium && !isFinal ? <PodiumPage players={result} onNext={next} /> : ''
    const podiumFinalBlock = showPodium && isFinal ? <PodiumFinalPage players={result} volume={volume} onBackHome={props.onBackHome} /> : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : <AudioControl onVolume={setVolume} />

    return <Shell headerLeft={props.quizTitle} headerRight={audioControl} footerLeft={`#${props.gameId}`} fullScreenContent={showPodium}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Shell>
}

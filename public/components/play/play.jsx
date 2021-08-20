'use strict'

import loadCss from '../../load-css.js'
import AudioControl from '../audio/audio-control.jsx'
import Shell from '../shell/shell.jsx'
import Countdown from '../countdown.jsx'
import Podium from '../podium/podium.jsx'
import StickyButton from '../sticky/sticky-button.jsx'

loadCss('components/play/play.css')

const WaitingToStart = function (props) {
    const otherPlayers = props.otherPlayers.map(p => <div key={p} className='playWaitingAvatar playWaitingBounceIn'>{p}</div>)
    const waitingLabel = props.otherPlayers.length > 0
        ? <div className='playWaitingLabel'>You are up against:</div>
        : <div className='playWaitingLabel'>Waiting for other players...</div>
    const otherPlayersInfo = props.otherPlayers.length > 0 ? otherPlayers : null

    return <div className='playWaiting'>
        <div className='playWaitingLabel'>You are playing as:</div>
        <div className='playWaitingAvatar'>{props.avatar}</div>
        <div className='playWaitingLabel'>{waitingLabel}</div>
        <div className='playWaitingOtherPlayers'>{otherPlayersInfo}</div>
    </div>
}

const QuestionAndAnswers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']

    const answersBlock = props.answers.map((answer, index) => {
        return <StickyButton key={answer.id} color={colors[index]} onClick={() => props.onGuess(answer.id)} text={answer.text} />
    })

    return <div>
        <h1 className='playQuestion'>{props.question}</h1>
        <div className='playAnswers'>
            {answersBlock}
        </div>

        <div className='playCountdown'>
            <Countdown seconds={props.countDown} />
        </div>
    </div>
}

export default function Play(props) {
    const [question, setQuestion] = React.useState(null)
    const [result, setResult] = React.useState(null)
    const [waitingForOtherResponses, setWaitingForOtherResponses] = React.useState(false)
    const [waitingToStart, setWaitingToStart] = React.useState(true)
    const [isFinal, setIsFinal] = React.useState(false)
    const [countDown, setCountDown] = React.useState(null)
    const [volume, setVolume] = React.useState(1)
    const [score, setScore] = React.useState(0)

    const music = React.useRef({})
    music.current.volume = volume

    const onPlayerJoined = (gameId, player) => {
        props.onPlayerJoined(player)
    }

    const onPlayerDisconnected = (gameId, player) => {
        props.onPlayerDisconnected(player)
    }

    const onRoundStarted = (gameId, newQuestion, secondsToGuess) => {
        setQuestion(newQuestion)
        setWaitingForOtherResponses(false)
        setResult(null)
        setWaitingToStart(false)
        setCountDown(secondsToGuess)
    }

    const onRoundFinished = (gameId, result) => {
        setQuestion(null)
        setWaitingForOtherResponses(false)
        setResult(result)
        setCountDown(null)
        setScore(result.find(r => r.avatar === props.playerAvatar).score)
    }

    const onGameFinished = (gameId, result) => {
        onRoundFinished(gameId, result)
        setIsFinal(true)
    }

    const guess = (answerId) => {
        props.adapter.guess(props.gameId, question.id, props.playerName, answerId)
        setQuestion(null)
        setWaitingForOtherResponses(true)
        setResult(null)
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

    const showPodium = Boolean(result) && !isFinal
    const waitingToStartBlock = waitingToStart ? <WaitingToStart avatar={props.playerAvatar} otherPlayers={props.otherPlayers} /> : ''
    const questionBlock = question && (countDown !== null) ? <QuestionAndAnswers countDown={countDown} question={question.text} answers={question.answers} onGuess={guess} /> : ''
    const podiumBlock = showPodium ? <Podium players={result} /> : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? <h2>Waiting for other players...</h2> : ''
    const gameOverBlock = isFinal ? <h2>Game is over!</h2> : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : <AudioControl onVolume={setVolume} />

    return <Shell headerLeft={props.quizTitle} headerRight={audioControl} footerLeft={`${props.playerAvatar} ${props.playerName}`} footerRight={`Score: ${score}`} fullScreenContent={showPodium}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {waitingBlockForOtherResponses}
        {gameOverBlock}
    </Shell>
}

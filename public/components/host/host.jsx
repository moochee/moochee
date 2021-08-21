'use strict'

import loadCss from '../../load-css.js'
import AudioControl from '../audio/audio-control.jsx'
import Shell from '../shell/shell.jsx'
import Countdown from '../countdown.jsx'
import Podium from '../podium/podium.jsx'
import PodiumFinal from '../podium/podium-final.jsx'
import StickyCard from '../sticky/sticky-card.jsx'
import StickyButton from '../sticky/sticky-button.jsx'
import Waiting from './waiting.jsx'

loadCss('components/host/host.css')

const Answer = function (props) {
    return <StickyCard color={props.color} text={props.answer.text} />
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
            <Countdown seconds={props.countDown} />
        </div>
    </div>
}

const PodiumPage = function (props) {
    return <div className='hostPodium'>
        <Podium players={props.players} />
        <div className='hostNextQuestionButton'>
            <StickyButton onClick={props.onNext} color='blue' text='Next Question' />
        </div>
    </div>
}

const PodiumFinalPage = function (props) {
    const [canBackHome, setCanBackHome] = React.useState(false)

    React.useEffect(() => {
        props.stopMusic()
        setTimeout(() => setCanBackHome(true), 20000)
    }, [])

    const backHomeButton = canBackHome ? <div className='hostBackHomeButton'>
        <StickyButton onClick={props.onBackHome} color='blue' text='Back Home 🔥' />
    </div> : ''

    return <div className='hostPodium'>
        <PodiumFinal players={props.players} volume={props.volume} />
        {backHomeButton}
    </div>
}

export default function Host(props) {
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

    const stopMusic = () => {
        music.current.pause()
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
    const waitingToStartBlock = waitingToStart ? <Waiting gameId={props.gameId} players={players} volume={volume} canStart={canStart} adapter={props.adapter} /> : ''
    const questionBlock = question && (countDown !== null) ? <QuestionAndAnswers countDown={countDown} question={question.text} answers={question.answers} /> : ''
    const podiumBlock = showPodium && !isFinal ? <PodiumPage players={result} onNext={next} /> : ''
    const podiumFinalBlock = showPodium && isFinal ? <PodiumFinalPage players={result} volume={volume} onBackHome={props.onBackHome} stopMusic={stopMusic}/> : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : <AudioControl onVolume={setVolume} />

    return <Shell headerLeft={props.quizTitle} headerRight={audioControl} footerLeft={`#${props.gameId}`} footerRight={`${players.length} Players`} fullScreenContent={showPodium}>
        <audio ref={music} loop src='components/positive-funny-background-music-for-video-games.mp3'></audio>
        {waitingToStartBlock}
        {questionBlock}
        {podiumBlock}
        {podiumFinalBlock}
    </Shell>
}

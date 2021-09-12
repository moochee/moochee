'use strict'

import { html, useState, useEffect, useRef } from '/lib/preact-3.1.0.standalone.module.js'

import loadCss from '/load-css.js'
import AudioControl from '/components/audio/audio-control.js'
import Shell from '/components/shell/shell.js'
import Countdown from '/components/countdown.js'
import Podium from '/components/podium/podium.js'
import PodiumFinal from '/components/podium/podium-final.js'
import StickyCard from '/components/sticky/sticky-card.js'
import StickyButton from '/components/sticky/sticky-button.js'
import Waiting from './waiting.js'

loadCss('components/host/host.css')

const QuestionAndAnswers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']

    const answersBlock = props.question.answers.map((answer, index) => {
        return html`<${StickyCard} key=${index} color=${colors[index]} text=${answer.text} />`
    })

    const progress = `(${props.question.id}/${props.question.totalQuestions})`

    return html`<div class=hostQuestionAndAnswers>
        <h1 class=hostQuestion>${progress} ${props.question.text}</h1>
        <div class=hostAnswers>
            ${answersBlock}
        </div>

        <div class=hostCountdown>
            <${Countdown} seconds=${props.countDown} />
        </div>
    </div>`
}

const PodiumPage = function (props) {
    return html`<div class=hostPodium>
        <${Podium} players=${props.players} />
        <div class=hostNextQuestionButton>
            <${StickyButton} onClick=${props.onNext} color=blue text='Next Question' />
        </div>
    </div>`
}

const PodiumFinalPage = function (props) {
    const [canBackHome, setCanBackHome] = useState(false)

    useEffect(() => {
        props.stopMusic()
        setTimeout(() => setCanBackHome(true), 20000)
    }, [])

    const backHomeButton = canBackHome ? html`<div class=hostBackHomeButton>
        <${StickyButton} onClick=${props.onBackHome} color=blue text='Back Home 🔥' />
    </div>` : ''

    return html`<div class=hostPodium>
        <${PodiumFinal} players=${props.players} volume=${props.volume} />
        ${backHomeButton}
    </div>`
}

export default function Host(props) {
    const [players, setPlayers] = useState([])
    const [question, setQuestion] = useState(null)
    const [canStart, setCanStart] = useState(false)
    const [result, setResult] = useState(null)
    const [isFinal, setIsFinal] = useState(false)
    const [countDown, setCountDown] = useState(null)
    const [volume, setVolume] = useState(1)

    const music = useRef({})

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

    const nextRound = () => {
        props.client.nextRound(props.gameId)
    }

    const stopMusic = () => {
        music.current.pause()
    }

    useEffect(() => {
        music.current.play()
        props.client.subscribe('playerJoined', onPlayerJoined)
        props.client.subscribe('roundStarted', onRoundStarted)
        props.client.subscribe('roundFinished', onRoundFinished)
        props.client.subscribe('gameFinished', onGameFinished)
        props.client.subscribe('playerDisconnected', onPlayerDisconnected)
        return () => {
            props.client.unsubscribe('playerJoined', onPlayerJoined)
            props.client.unsubscribe('roundStarted', onRoundStarted)
            props.client.unsubscribe('roundFinished', onRoundFinished)
            props.client.unsubscribe('gameFinished', onGameFinished)
            props.client.unsubscribe('playerDisconnected', onPlayerDisconnected)
        }
    }, [])

    const showPodium = Boolean(result)
    const waitingToStart = !question && !result
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} players=${players} canStart=${canStart} client=${props.client} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} />` : ''
    const podiumBlock = showPodium && !isFinal ? html`<${PodiumPage} players=${result} onNext=${nextRound} />` : ''
    const podiumFinalBlock = showPodium && isFinal ? html`<${PodiumFinalPage} players=${result} volume=${volume} onBackHome=${props.onBackHome} stopMusic=${stopMusic}/>` : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`

    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft=#${props.gameId} footerRight='${players.length} Players' fullScreenContent=${showPodium}>
        <audio ref=${music} volume=${volume} loop src=components/positive-funny-background-music-for-video-games.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${podiumFinalBlock}
    <//>`
}

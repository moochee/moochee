'use strict'

import { html, useState, useEffect, useRef } from 'https://unpkg.com/htm/preact/standalone.module.js'

import loadCss from '../../load-css.js'
import AudioControl from '../audio/audio-control.js'
import Shell from '../shell/shell.js'
import Countdown from '../countdown.js'
import Podium from '../podium/podium.js'
import PodiumFinal from '../podium/podium-final.js'
import StickyCard from '../sticky/sticky-card.js'
import StickyButton from '../sticky/sticky-button.js'
import Waiting from './waiting.js'

loadCss('components/host/host.css')

const QuestionAndAnswers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']

    const answersBlock = props.answers.map((answer, index) => {
        return html`<${StickyCard} key=${index} color=${colors[index]} text=${answer.text} />`
    })

    return html`<div>
        <h1 class=hostQuestion>${props.question}</h1>
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

    useEffect(() => {
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
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} players=${players} volume=${volume} canStart=${canStart} adapter=${props.adapter} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question.text} answers=${question.answers} />`: ''
    const podiumBlock = showPodium && !isFinal ? html`<${PodiumPage} players=${result} onNext=${next} />` : ''
    const podiumFinalBlock = showPodium && isFinal ? html`<${PodiumFinalPage} players=${result} volume=${volume} onBackHome=${props.onBackHome} stopMusic=${stopMusic}/>` : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`

    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft='#${props.gameId}' footerRight='${players.length} Players' fullScreenContent=${showPodium}>
        <audio ref=${music} loop src=components/positive-funny-background-music-for-video-games.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${podiumFinalBlock}
    <//>`
}

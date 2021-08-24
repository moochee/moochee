'use strict'

import { html, useState, useEffect, useRef } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
import AudioControl from '/components/audio/audio-control.js'
import Shell from '/components/shell/shell.js'
import Countdown from '/components/countdown.js'
import Podium from '/components/podium/podium.js'
import StickyButton from '/components/sticky/sticky-button.js'

loadCss('components/play/play.css')

const WaitingToStart = function (props) {
    const otherPlayers = props.otherPlayers.map(p => html`<div key=${p} class='playWaitingAvatar playWaitingBounceIn'>${p}</div>`)
    const waitingLabel = props.otherPlayers.length > 0
        ? html`<div class=playWaitingLabel>You are up against:</div>`
        : html`<div class=playWaitingLabel>Waiting for other players...</div>`
    const otherPlayersInfo = props.otherPlayers.length > 0 ? otherPlayers : null

    return html`<div class=playWaiting>
        <div class=playWaitingLabel>You are playing as:</div>
        <div class=playWaitingAvatar>${props.avatar}</div>
        <div class=playWaitingLabel>${waitingLabel}</div>
        <div class=playWaitingOtherPlayers>${otherPlayersInfo}</div>
    </div>`
}

const QuestionAndAnswers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange']

    const answersBlock = props.answers.map((answer, index) => {
        return html`<${StickyButton} key=${index} color=${colors[index]} onClick=${() => props.onGuess(answer.id)} text=${answer.text} />`
    })

    return html`<div>
        <h1 class=playQuestion>${props.question}</h1>
        <div class=playAnswers>
            ${answersBlock}
        </div>

        <div class=playCountdown>
            <${Countdown} seconds=${props.countDown} />
        </div>
    </div>`
}

export default function Play(props) {
    const [question, setQuestion] = useState(null)
    const [result, setResult] = useState(null)
    const [waitingForOtherResponses, setWaitingForOtherResponses] = useState(false)
    const [waitingToStart, setWaitingToStart] = useState(true)
    const [isFinal, setIsFinal] = useState(false)
    const [countDown, setCountDown] = useState(null)
    const [volume, setVolume] = useState(1)
    const [score, setScore] = useState(0)

    const music = useRef({})
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

    const showPodium = Boolean(result) && !isFinal
    const waitingToStartBlock = waitingToStart ? html`<${WaitingToStart} avatar=${props.playerAvatar} otherPlayers=${props.otherPlayers} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question.text} answers=${question.answers} onGuess=${guess} />` : ''
    const podiumBlock = showPodium ? html`<${Podium} players=${result} />` : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? html`<h2>Waiting for other players...</h2>` : ''
    const gameOverBlock = isFinal ? html`<h2>Game is over!</h2>` : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`

    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft='${props.playerAvatar} ${props.playerName}' footerRight='Score: ${score}' fullScreenContent=${showPodium}>
        <audio ref=${music} loop src=components/positive-funny-background-music-for-video-games.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${waitingBlockForOtherResponses}
        ${gameOverBlock}
    <//>`
}

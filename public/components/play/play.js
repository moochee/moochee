'use strict'

import { html, useState, useEffect } from '/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/load-css.js'
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

    const answersBlock = props.question.answers.map((answer, index) => {
        return html`<${StickyButton} key=${index} color=${colors[index]} onClick=${() => props.onGuess(answer.id)} text=${answer.text} />`
    })

    const progress = `(${props.question.id}/${props.question.totalQuestions})`

    return html`<div class=playQuestionAndAnswers>
        <h1 class=playQuestion>${progress} ${props.question.text}</h1>
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
    const [score, setScore] = useState(0)

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
        props.client.guess(props.gameId, question.id, props.playerName, answerId)
        setQuestion(null)
        setWaitingForOtherResponses(true)
        setResult(null)
    }

    useEffect(() => {
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

    const showPodium = Boolean(result) && !isFinal
    const waitingToStartBlock = waitingToStart ? html`<${WaitingToStart} avatar=${props.playerAvatar} otherPlayers=${props.otherPlayers} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} onGuess=${guess} />` : ''
    const podiumBlock = showPodium ? html`<${Podium} players=${result} />` : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? html`<h2>Waiting for other players...</h2>` : ''
    const gameOverBlock = isFinal ? html`<h2>Game is over!</h2>` : ''

    return html`<${Shell} headerLeft=${props.quizTitle} footerLeft='${props.playerAvatar} ${props.playerName}' footerRight='Score: ${score}' fullScreenContent=${showPodium}>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${waitingBlockForOtherResponses}
        ${gameOverBlock}
    <//>`
}

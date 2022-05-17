'use strict'

import { html, useState, useEffect } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import Shell from '/public/components/shell/shell.js'
import Countdown from '/public/components/countdown.js'
import StickyButton from '/public/components/sticky/sticky-button.js'
import Transition from './transition.js'

loadCss('/play/components/play/play.css')

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
    const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']

    const answersBlock = props.question.answers.map((answer, index) => {
        return html`<${StickyButton} key=${index} color=${colors[index]} onClick=${() => props.onGuess(index)} text=${answer.text} />`
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
    const [isRoundFinished, setIsRoundFinished] = useState(false)
    const [status, setStatus] = useState({ scoreboard: [] })
    const [waitingForOtherResponses, setWaitingForOtherResponses] = useState(false)
    const [isFinal, setIsFinal] = useState(false)
    const [countDown, setCountDown] = useState(null)
    const [score, setScore] = useState(0)

    const onPlayerJoined = (player) => {
        props.onPlayerJoined(player)
    }

    const onPlayerDisconnected = (player) => {
        props.onPlayerDisconnected(player)
    }

    const onRoundStarted = (newQuestion, secondsToGuess) => {
        setQuestion(newQuestion)
        setWaitingForOtherResponses(false)
        setCountDown(secondsToGuess)
        setIsRoundFinished(false)
    }

    const updateScoreboard = (oldScoreboard, newScoreboard) => {
        const updatedScoreboard = newScoreboard.map((entry, index) => {
            const oldEntry = oldScoreboard.find(e => e.avatar === entry.avatar) || {}
            return { ...entry, rank: index + 1, oldScore: oldEntry.score, oldRank: oldEntry.rank }
        })
        updatedScoreboard.sort((a, b) => a.oldRank - b.oldRank)
        return updatedScoreboard
    }

    const onRoundFinished = (status) => {
        setIsRoundFinished(true)
        setQuestion(null)
        setWaitingForOtherResponses(false)
        setStatus(oldStatus => {
            setScore(status.scoreboard.find(r => r.avatar === props.playerAvatar).score)
            return { result: status.result, scoreboard: updateScoreboard(oldStatus.scoreboard, status.scoreboard) }
        })
        setCountDown(null)
    }

    const onGameFinished = (status) => {
        onRoundFinished(status)
        setIsFinal(true)
    }

    const guess = (answerIndex) => {
        props.client.guess(props.gameId, props.playerName, answerIndex)
        setQuestion(null)
        setWaitingForOtherResponses(true)
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

    const waitingToStart = !question && !isRoundFinished && !waitingForOtherResponses
    const waitingToStartBlock = waitingToStart ? html`<${WaitingToStart} avatar=${props.playerAvatar} otherPlayers=${props.otherPlayers} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} onGuess=${guess} />` : ''
    const waitingBlockForOtherResponses = waitingForOtherResponses ? html`<h2>Waiting for other players...</h2>` : ''

    const transitionBlock = isRoundFinished ? html`<${Transition}
        isFinal=${isFinal}
        distribution=${status.result}
        scoreboard=${status.scoreboard} />` : ''

    return html`<${Shell} headerLeft=${props.quizTitle} footerLeft='${props.playerAvatar} ${props.playerName}' footerRight='Score: ${score}' fullScreenContent=${isRoundFinished}>
        ${waitingToStartBlock}
        ${questionBlock}
        ${transitionBlock}
        ${waitingBlockForOtherResponses}
    <//>`
}

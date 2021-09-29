'use strict'

import { html, useState, useEffect, useRef } from '/lib/preact-3.1.0.standalone.module.js'

import loadCss from '/load-css.js'
import AudioControl from '/components/audio/audio-control.js'
import Shell from '/components/shell/shell.js'
import Countdown from '/components/countdown.js'
import Scoreboard from '/components/scoreboard/scoreboard.js'
import Distribution from '/components/distribution/distribution.js'
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
    const [showDistribution, setShowDistribution] = useState(true)

    useEffect(() => {
        const timeoutId = setTimeout(() => setShowDistribution(false), 6000)
        return () => clearTimeout(timeoutId)
    }, [])

    const distributionBlock = showDistribution ? html`<${Distribution} distribution=${props.result} />` : ''
    const scoreboardBlock = !showDistribution ? html`<${Scoreboard} ranking=${props.players} />` : ''

    return html`<div class=hostPodium>
        ${distributionBlock}
        ${scoreboardBlock}
        <div class=hostSwitch
            onmouseover=${() => setShowDistribution(true)}
            onmouseout=${() => setShowDistribution(false)}>Distribution</div>
        <div class=hostNextQuestionButton>
            <${StickyButton} onClick=${props.onNext} color=blue text='Next Question' />
        </div>
    </div>`
}

const PodiumFinalPage = function (props) {
    const [canBackHome, setCanBackHome] = useState(false)
    const [showDistribution, setShowDistribution] = useState(true)

    useEffect(() => {
        const finalPodiumTimeoutId = setTimeout(() => {
            props.stopMusic()
            setShowDistribution(false)
        }, 6000)
        const backHomeTimeoutId = setTimeout(() => setCanBackHome(true), 26000)
        return () => {
            clearTimeout(finalPodiumTimeoutId)
            clearTimeout(backHomeTimeoutId)
        }
    }, [])

    const distributionBlock = showDistribution ? html`<${Distribution} distribution=${props.result} />` : ''
    const podiumFinalBlack = !showDistribution ? html`<${PodiumFinal} players=${props.players} volume=${props.volume} />` : ''
    const backHomeButton = canBackHome ? html`<div class=hostBackHomeButton>
        <${StickyButton} onClick=${props.onBackHome} color=blue text='Back Home 🔥' />
    </div>` : ''

    return html`<div class=hostPodium>
        ${distributionBlock}
        ${podiumFinalBlack}
        ${backHomeButton}
    </div>`
}

export default function Host(props) {
    const [players, setPlayers] = useState([])
    const [question, setQuestion] = useState(null)
    const [canStart, setCanStart] = useState(false)
    const [isRoundFinished, setIsRoundFinished] = useState(false)
    const [status, setStatus] = useState({ scoreboard: [] })
    const [isFinal, setIsFinal] = useState(false)
    const [countDown, setCountDown] = useState(null)
    const [volume, setVolume] = useState(1)

    const music = useRef({})

    const onPlayerJoined = (player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length >= 1) {
                setCanStart(true)
            }
            return [player, ...oldPlayers]
        })
    }

    const onPlayerDisconnected = (player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length <= 2) {
                setCanStart(false)
            }
            return oldPlayers.filter(p => p != player)
        })
    }

    const onRoundStarted = (newQuestion, secondsToGuess) => {
        setQuestion(newQuestion)
        setCountDown(secondsToGuess)
        setIsRoundFinished(false)
    }

    const updateScoreboard = (oldScoreboard, newScoreboard) => {
        const updatedScoreboard = newScoreboard.map((entry, index) => {
            const oldEntry = oldScoreboard.find(e => e.avatar === entry.avatar) || {}
            return { ...entry, rank: index + 1, oldScore: oldEntry.score, oldRank: oldEntry.rank }
        })
        // FIXME: didn't get it, shouldn't be sorting on old score instead?
        updatedScoreboard.sort((a, b) => a.oldRank - b.oldRank)
        return updatedScoreboard
    }

    const onRoundFinished = (status) => {
        setIsRoundFinished(true)
        setQuestion(null)
        setStatus(oldStatus => ({
            result: status.result, scoreboard: updateScoreboard(oldStatus.scoreboard, status.scoreboard)
        }))
        setCountDown(null)
    }

    const onGameFinished = (status) => {
        onRoundFinished(status)
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

    const waitingToStart = !question && !isRoundFinished
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} players=${players} canStart=${canStart} client=${props.client} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} />` : ''
    const podiumBlock = isRoundFinished && !isFinal ? html`<${PodiumPage} players=${status.scoreboard} result=${status.result} onNext=${nextRound} />` : ''
    const podiumFinalBlock = isRoundFinished && isFinal ? html`<${PodiumFinalPage} players=${status.scoreboard} result=${status.result} volume=${volume} onBackHome=${props.onBackHome} stopMusic=${stopMusic}/>` : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`

    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft=#${props.gameId} footerRight='${players.length} Players' fullScreenContent=${isRoundFinished}>
        <audio ref=${music} volume=${volume} loop src=components/positive-funny-background-music-for-video-games.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${podiumFinalBlock}
    <//>`
}

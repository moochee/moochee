'use strict'

import { html, useState, useEffect, useRef } from '/public/lib/preact-3.1.0.standalone.module.js'
import loadCss from '/public/load-css.js'
import AudioControl from '/public/components/audio/audio-control.js'
import Shell from '/public/components/shell/shell.js'
import Countdown from '/public/components/countdown.js'
import Scoreboard from '/public/components/scoreboard/scoreboard.js'
import Distribution from '/public/components/distribution/distribution.js'
import PodiumFinal from '/public/components/podium-final/podium-final.js'
import StickyCard from '/public/components/sticky/sticky-card.js'
import StickyButton from '/public/components/sticky/sticky-button.js'
import Waiting from './waiting-v2.js'

loadCss('/components/host/host.css')

const QuestionAndAnswers = function (props) {
    const colors = ['green', 'purple', 'blue', 'orange', 'red', 'yellow', 'petrol']

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

    const click = () => showDistribution ? setShowDistribution(false) : setShowDistribution(true)

    const distributionBlock = showDistribution ? html`<${Distribution} distribution=${props.result} />` : ''
    const scoreboardBlock = !showDistribution ? html`<${Scoreboard} ranking=${props.players} />` : ''

    return html`<div class=hostPodium>
        ${distributionBlock}
        ${scoreboardBlock}
        <div class=hostSwitch onclick=${click}>Switch</div>
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
        <${StickyButton} onClick=${props.onBackHome} color=blue text='Home 🔥' />
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
    const [statistics, setStatistics] = useState({ answerResults: [] })

    const music = useRef({})
    const tap = useRef({})

    const onPlayerJoined = (player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length >= 0) {
                setCanStart(true)
            }
            return [player, ...oldPlayers]
        })
    }

    const onPlayerDisconnected = (player) => {
        setPlayers((oldPlayers) => {
            if (oldPlayers.length <= 1) {
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
        updatedScoreboard.sort((a, b) => a.oldRank - b.oldRank)
        return updatedScoreboard
    }

    const updateAnswerResults = (oldAnswerResults, newAnswerResults) => {
        console.log(oldAnswerResults)
        console.log(newAnswerResults)
        const updatedAnswerResults = [oldAnswerResults, newAnswerResults]
        console.log(updatedAnswerResults)
        return updatedAnswerResults.flat()
    }

    const onPlayerGuessed = () => {
        tap.current.play()
    }

    const onRoundFinished = (status) => {
        setIsRoundFinished(true)
        setQuestion(null)
        setStatus(oldStatus => ({
            result: status.result, scoreboard: updateScoreboard(oldStatus.scoreboard, status.scoreboard)
        }))
        setStatistics(oldStatistics => ({
            result: status.result, answerResults: updateAnswerResults(oldStatistics.answerResults, status.result)
        }))
        setCountDown(null)
    }

    const onGameFinished = (status) => {
        console.log(statistics)
        console.log(status)
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
        props.client.subscribe('playerGuessed', onPlayerGuessed)
        props.client.subscribe('roundFinished', onRoundFinished)
        props.client.subscribe('gameFinished', onGameFinished)
        props.client.subscribe('playerDisconnected', onPlayerDisconnected)
        return () => {
            props.client.unsubscribe('playerJoined', onPlayerJoined)
            props.client.unsubscribe('roundStarted', onRoundStarted)
            props.client.unsubscribe('playerGuessed', onPlayerGuessed)
            props.client.unsubscribe('roundFinished', onRoundFinished)
            props.client.unsubscribe('gameFinished', onGameFinished)
            props.client.unsubscribe('playerDisconnected', onPlayerDisconnected)
        }
    }, [])

    const waitingToStart = !question && !isRoundFinished
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} origin=${props.origin} players=${players} canStart=${canStart} client=${props.client} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} />` : ''
    const podiumBlock = isRoundFinished && !isFinal ? html`<${PodiumPage} players=${status.scoreboard} result=${status.result} onNext=${nextRound} />` : ''
    const podiumFinalBlock = isRoundFinished && isFinal ? html`<${PodiumFinalPage} players=${status.scoreboard} result=${status.result} volume=${volume} onBackHome=${props.onBackHome} stopMusic=${stopMusic}/>` : ''
    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`
    const blankFooterRight = html`<div></div>`

    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft='${players.length} Players' footerRight=${blankFooterRight} fullScreenContent=${isRoundFinished}>
        <audio ref=${music} volume=${volume} loop src=/public/components/positive-funny-background-music-for-video-games.mp3></audio>
        <audio ref=${tap} volume=${volume} src=/public/components/tap.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${podiumBlock}
        ${podiumFinalBlock}
    <//>`
}

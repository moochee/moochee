'use strict'

// REVISE maybe an entire 'Game' should be split out which can also host the transition, so this class only orchestrates waiting/game
import { html, useState, useEffect, useRef } from '/lib/htm/preact/standalone.module.js'
import loadCss from '/public/load-css.js'
import AudioControl from '/public/components/audio/audio-control.js'
import Shell from '/public/components/shell/shell.js'
import Countdown from '/public/components/countdown.js'
import Waiting from './waiting-new.js'
import Transition from './transition-new.js'

loadCss('/components/host/host-new.css')

const QuestionAndAnswers = function (props) {
    const progress = `(${props.question.id}/${props.question.totalQuestions})`

    const answersBlock = props.question.answers.map((answer, index) => {
        return html`<div key=${index} class='answer background${index}'>${answer.text}</div>`
    })

    return html`<div class=round>
        <div class=question>${progress} ${props.question.text}</div>
        <div class=answers>${answersBlock}</div>
        <div class=countdown><${Countdown} seconds=${props.countDown} /></div>
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

    const entranceMusic = useRef({})
    const quizMusic = useRef({})
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
        entranceMusic.current.pause()
        quizMusic.current.play()
        setQuestion(newQuestion)
        setCountDown(secondsToGuess)
        setIsRoundFinished(false)
    }

    // REVISE better do the previous state / ranking calculation on the server, otherwise at least have a unit test for this here
    const updateScoreboard = (oldScoreboard, newScoreboard) => {
        const updatedScoreboard = newScoreboard.map((entry, index) => {
            const oldEntry = oldScoreboard.find(e => e.avatar === entry.avatar) || {}
            return { ...entry, rank: index + 1, oldScore: oldEntry.score, oldRank: oldEntry.rank }
        })
        // REVISE the sorting smells like spaghetti - coupling to the scoreboard view which relies on a particular order
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
        quizMusic.current.pause()
    }

    useEffect(() => {
        entranceMusic.current.play()
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
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} players=${players} canStart=${canStart} client=${props.client} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} />` : ''
    // REVISE need to get terminology straight wrt result vs. distribution
    const transitionBlock = isRoundFinished
        ? html`<${Transition}
            isFinal=${isFinal}
            distribution=${status.result}
            scoreboard=${status.scoreboard}
            onNextRound=${nextRound}
            onBackHome=${props.onBackHome}
            onStopMusic=${stopMusic}
            volume=${volume} />`
        : ''

    const isIos = navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${setVolume} />`
    const blank = html`<div></div>`

    // REVISE right now it seems more and more obvious that the shell should be included in the pages, and not be surrounding the pages
    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft='${players.length} Players' footerRight=${blank} fullScreenContent=${isRoundFinished}>
        <audio ref=${entranceMusic} volume=${volume} loop src=/public/21st_century.mp3></audio>
        <audio ref=${quizMusic} volume=${volume} loop src=/public/Attracting_drama.mp3></audio>
        <audio ref=${tap} volume=${volume} src=/public/components/tap.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${transitionBlock}
    <//>`
}

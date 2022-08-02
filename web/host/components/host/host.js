// REVISE maybe an entire 'Game' should be split out which can also host the transition, so this class only orchestrates waiting/game
import { html, useState, useEffect, useRef } from '../../../../node_modules/htm/preact/standalone.mjs'
import AudioControl from '../../../public/components/audio/audio-control.js'
import Shell from '../../../public/components/shell/shell.js'
import Countdown from '../../../public/components/countdown.js'
import Waiting from './waiting.js'
import Transition from './transition.js'

window.loadCss('/web/host/components/host/host.css')

const QuestionAndAnswers = function (props) {
    const progress = `(${props.question.id}/${props.question.totalQuestions})`

    const answersBlock = props.question.answers.map((answer, i) => {
        return html`<button key=${i} class='answer background${i % 4}' onClick=${() => props.onGuess(i)}>${answer.text}</button>`
    })

    return html`<div class=hostRound>
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
    const [waitingForOtherResponses, setWaitingForOtherResponses] = useState(false)
    // REVISE This whole handling is clunky: used to lower volume during transition and restore original volume later.
    //        The solution is hacky and incomplete. Extract a clean game.js including transition to fix cleanly.
    const [volume, setVolume] = useState({current: .2, previous: .2})

    const entranceMusic = useRef({})
    const quizMusic = useRef({})
    const tap = useRef({})

    const onPlayerJoined = (quizTitle, name, player) => {
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
        setVolume(volume => ({ ...volume, current: volume.previous }))
        entranceMusic.current.pause()
        quizMusic.current.play()
        setQuestion(newQuestion)
        setCountDown(secondsToGuess)
        setIsRoundFinished(false)
        setWaitingForOtherResponses(false)
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

    const onPlayerGuessed = () => {
        tap.current.play()
    }

    const onRoundFinished = (status) => {
        setVolume(volume => ({ previous: volume.current, current: volume.current / 3 }))
        setIsRoundFinished(true)
        setQuestion(null)
        setStatus(oldStatus => ({
            result: status.result, scoreboard: updateScoreboard(oldStatus.scoreboard, status.scoreboard)
        }))
        setCountDown(null)
        setWaitingForOtherResponses(false)
    }

    const onGameFinished = (status) => {
        onRoundFinished(status)
        setIsFinal(true)
        setVolume(volume => ({ ...volume, current: volume.previous }))
    }

    const nextRound = () => {
        props.client.nextRound(props.gameId)
    }

    const stopMusic = () => {
        quizMusic.current.pause()
    }

    const updateVolume = (newVolume) => {
        setVolume({ current: newVolume, previous: newVolume })
    }

    // FIXME: hard code for now, should be changed to current user name
    const HOST_NAME = 'guest'

    const guess = (answerIndex) => {
        props.client.guess(props.gameId, HOST_NAME, answerIndex)
        setQuestion(null)
        setWaitingForOtherResponses(true)
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

    useEffect(() => {
        if (props.hostIsPlayer) props.client.join(props.gameId, HOST_NAME)
        return () => { if (props.hostIsPlayer) props.client.disconnect() }
    }, [props.gameId, props.hostIsPlayer])

    const waitingToStart = !question && !isRoundFinished && !waitingForOtherResponses
    const waitingToStartBlock = waitingToStart ? html`<${Waiting} gameId=${props.gameId} players=${players} canStart=${canStart} client=${props.client} />` : ''
    const questionBlock = question && (countDown !== null) ? html`<${QuestionAndAnswers} countDown=${countDown} question=${question} onGuess=${guess} />` : ''
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
    const waitingBlockForOtherResponses = waitingForOtherResponses ? html`<h2>Waiting for other players...</h2>` : ''


    const isIos = window.navigator.userAgent.match(/ipad|iphone/i)
    const audioControl = isIos ? '' : html`<${AudioControl} onVolume=${updateVolume} />`

    // REVISE right now it seems more and more obvious that the shell should be included in the pages, and not be surrounding the pages
    return html`<${Shell} headerLeft=${props.quizTitle} headerRight=${audioControl} footerLeft='${players.length} ${players.length < 2 ? 'Player' : 'Players'}' fullScreenContent=${isRoundFinished}>
        <audio ref=${entranceMusic} volume=${volume.current} loop src=/web/public/sounds/21st_century.mp3></audio>
        <audio ref=${quizMusic} volume=${volume.current} loop src=/web/public/sounds/Attracting_drama.mp3></audio>
        <audio ref=${tap} volume=${volume.current} src=/web/public/sounds/Tap.mp3></audio>
        ${waitingToStartBlock}
        ${questionBlock}
        ${transitionBlock}
        ${waitingBlockForOtherResponses}
    <//>`
}

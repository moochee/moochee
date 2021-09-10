'use strict'

export default function QuizSocketClient() {
    // eslint-disable-next-line no-undef
    const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`)
    const ready = new Promise((resolve) => socket.onopen = resolve)

    const subscribers = {}

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const subscriber = subscribers[message.event]
        if (subscriber) subscriber(...message.args)
    }

    this.subscribe = (event, subscriber) => {
        subscribers[event] = subscriber
    }

    this.unsubscribe = (event) => {
        delete subscribers[event]
    }

    const send = (msg) => {
        ready.then(() => socket.send(JSON.stringify(msg)))
    }

    this.getQuizzes = () => {
        send({ event: 'getQuizzes', args: [] })
    }

    this.host = (quizId) => {
        send({ event: 'host', args: [quizId] })
    }

    this.join = (gameId, playerName) => {
        send({ event: 'join', args: [gameId, playerName] })
    }

    this.nextRound = (gameId) => {
        send({ event: 'nextRound', args: [gameId] })
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        send({ event: 'guess', args: [gameId, questionId, playerName, answerId] })
    }
}

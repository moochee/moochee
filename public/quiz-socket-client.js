'use strict'

export default function QuizSocketClient(createWebSocket) {
    const socket = createWebSocket()
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

    // REVISE should we better call those things 'command' rather than 'event'?
    //        event is rather what gets emitted by the server when the command finished successfully (DDD terminology)
    this.host = (quizId) => {
        send({ event: 'host', args: [quizId] })
    }

    this.join = (gameId, playerName) => {
        send({ event: 'join', args: [gameId, playerName] })
    }

    this.nextRound = (gameId) => {
        send({ event: 'nextRound', args: [gameId] })
    }

    this.guess = (gameId, playerName, answerIndex) => {
        send({ event: 'guess', args: [gameId, playerName, answerIndex] })
    }
}

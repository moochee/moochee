'use strict'

export default function QuizSocketClient(socket) {
    const subscribers = {}
    const ready = new Promise((resolve) => socket.onopen = resolve)

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

    this.getQuizzes = async () => {
        await ready
        const msg = { event: 'getQuizzes', args: [] }
        socket.send(JSON.stringify(msg))
    }

    this.host = async (quizId) => {
        await ready
        const msg = { event: 'host', args: [quizId] }
        socket.send(JSON.stringify(msg))
    }

    this.join = async (gameId, playerName) => {
        await ready
        const msg = { event: 'join', args: [gameId, playerName] }
        socket.send(JSON.stringify(msg))
    }

    this.nextRound = async (gameId) => {
        await ready
        const msg = { event: 'nextRound', args: [gameId] }
        socket.send(JSON.stringify(msg))
    }

    this.guess = async (gameId, questionId, playerName, answerId) => {
        await ready
        const msg = { event: 'guess', args: [gameId, questionId, playerName, answerId] }
        socket.send(JSON.stringify(msg))
    }
}

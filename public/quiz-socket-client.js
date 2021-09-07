'use strict'

export default function QuizSocketClient(socket) {
    const subscribers = new Map()

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const subscriber = subscribers.get(message.event)
        if (subscriber) subscriber(...message.args)
    }

    this.subscribe = (event, subscriber) => {
        subscribers.set(event, subscriber)
    }

    this.unsubscribe = (event) => {
        subscribers.delete(event)
    }

    this.getQuizzes = async () => {
        const msg = { event: 'getQuizzes', args: [] }
        socket.send(JSON.stringify(msg))
    }

    this.host = (quizId) => {
        const msg = { event: 'host', args: [quizId] }
        socket.send(JSON.stringify(msg))
    }

    this.join = (gameId, playerName) => {
        const msg = { event: 'join', args: [gameId, playerName] }
        socket.send(JSON.stringify(msg))
    }

    this.nextRound = (gameId) => {
        const msg = { event: 'nextRound', args: [gameId] }
        socket.send(JSON.stringify(msg))
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        const msg = { event: 'guess', args: [gameId, questionId, playerName, answerId] }
        socket.send(JSON.stringify(msg))
    }
}
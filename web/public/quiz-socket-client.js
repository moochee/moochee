'use strict'

export default function QuizSocketClient(createWebSocket, createGame) {
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

    this.host = async (quizId, quizTitle) => {
        const gameId = await createGame(quizId)
        send({ command: 'joinAsHost', args: [gameId, quizTitle, false] })
    }

    this.play = async (quizId, quizTitle) => {
        const gameId = await createGame(quizId)
        send({ command: 'joinAsHost', args: [gameId, quizTitle, true] })
    }

    this.join = (gameId, playerName) => {
        send({ command: 'join', args: [gameId, playerName] })
    }

    this.nextRound = (gameId) => {
        send({ command: 'nextRound', args: [gameId] })
    }

    this.guess = (gameId, playerName, answerIndex) => {
        send({ command: 'guess', args: [gameId, playerName, answerIndex] })
    }

    this.disconnect = () => socket.close()
}

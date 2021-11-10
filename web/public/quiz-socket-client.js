'use strict'

export default function QuizSocketClient(createWebSocket, isNewGameCreate) {
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
        send({ command: 'getQuizzes', args: [] })
    }

    this.host = async (quizId, quizTitle) => {
        if (isNewGameCreate) {
            const response = await fetch('/api/v1/games', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ quizId })
            })
            const targetUrl = new URL(response.headers.get('location'))
            const gameId = targetUrl.pathname.substr(1)
            subscribers['gameCreated'](targetUrl.host, gameId, quizTitle)
            return
        }
        send({ command: 'host', args: [quizId] })
    }

    this.join = (gameId, playerName) => {
        send({ command: 'join', args: [gameId, playerName] })
    }

    this.joinAsHost = (gameId) => {
        send({ command: 'joinAsHost', args: [gameId] })
    }

    this.nextRound = (gameId) => {
        send({ command: 'nextRound', args: [gameId] })
    }

    this.guess = (gameId, playerName, answerIndex) => {
        send({ command: 'guess', args: [gameId, playerName, answerIndex] })
    }

    this.disconnect = () => socket.close()
}

'use strict'

export default function WsClientAdapter(socket) {

    this.subscribe = (event, subscriber) => {
        socket.on(event, subscriber)
    }

    // FIXME this somehow looks broken or incomplete (unused function argument 'subscriber')
    this.unsubscribe = (subscriber) => {
        socket.removeAllListeners();
    }

    this.getQuizzes = () => {
        return new Promise(resolve => {
            socket.emit('getQuizzes', (quizzes) => resolve(quizzes))
        })
    }

    this.host = (quizId) => {
        return new Promise(resolve => {
            socket.emit('host', quizId, (gameId) => resolve(gameId))
        })
    }

    this.join = (gameId, name) => {
        return new Promise((resolve, reject) => {
            socket.emit('join', gameId, name, (errorMessage) => {
                if (errorMessage) {
                    reject(new Error(errorMessage))
                } else {
                    resolve()
                }
            })
        })
    }

    this.nextRound = (gameId) => {
        socket.emit('nextRound', gameId)
    }

    this.start = (gameId) => {
        this.nextRound(gameId)
    }

    this.guess = (gameId, questionText, playerName, answer) => {
        socket.emit('guess', gameId, questionText, playerName, answer)
    }
}
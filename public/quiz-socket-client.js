'use strict'

export default function QuizSocketClient(socket) {

    this.subscribe = (event, subscriber) => {
        socket.on(event, subscriber)
    }

    this.unsubscribe = (event, subscriber) => {
        socket.off(event, subscriber)
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

    this.join = (gameId, playerName) => {
        return new Promise((resolve, reject) => {
            socket.emit('join', gameId, playerName, (result) => {
                if (result.errorMessage) {
                    reject(new Error(result.errorMessage))
                } else {
                    resolve(result.avatar)
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

    this.guess = (gameId, questionId, playerName, answerId) => {
        socket.emit('guess', gameId, questionId, playerName, answerId)
    }
}
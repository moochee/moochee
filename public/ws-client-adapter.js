'use strict'

export default function WsClientAdapter(socket) {
    
    this.subscribe = (event, subscriber) => {
        socket.on(event, subscriber)
    }

    this.unsubscribe = (subscriber) => {
        socket.removeAllListeners();
    }

    this.getQuizzes = async () => {
        return new Promise(resolve => {
            socket.emit('getQuizzes', (quizzes) => resolve(quizzes))
        })
    }

    this.host = async (quizId) => {
        return new Promise(resolve => {
            socket.emit('host', quizId, (gameId) => resolve(gameId))
        })
    }

    this.join = async (gameId, name) => {
        return new Promise(resolve => {
            socket.emit('join', gameId, name, (errorMessage) => resolve(errorMessage))
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
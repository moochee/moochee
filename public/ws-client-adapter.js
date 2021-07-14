'use strict'

export default function WsClientAdapter() {
    
    this.subscribe = (event, subscriber) => {
        socket.on(event, subscriber)
    }

    this.unsubscribe = (subscriber) => {
        socket.off(event, subscriber)
    }

    this.join = async (gameId, name) => {
        socket.emit('join', gameId, name)
    }

    this.host = async () => {
        return new Promise(resolve => {
            socket.emit('host', (gameId) => resolve(gameId))
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

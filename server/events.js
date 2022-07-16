'use strict'

import WebSocket from 'ws'

export default function Events(webSocketServer, historyService) {
    this.publish = (gameId, message) => {
        const messageString = JSON.stringify(message)
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && c.readyState === WebSocket.OPEN) {
                c.send(messageString)
            }
        })
        if (message.event === 'gameFinished') {
            const historyItem = { gameId, title: message.args[1], scoreboard: message.args[0].scoreboard.map(({name, score}) => ({name, score})) }
            historyService.create(historyItem, message.args[2])
        }
    }

    this.notifyHost = (gameId, message) => {
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && !c.playerName && c.readyState === WebSocket.OPEN) {
                c.send(JSON.stringify(message))
            }
        })
    }
}

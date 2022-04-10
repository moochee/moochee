'use strict'

import WebSocket from 'ws'

export default function Events(webSocketServer) {
    this.publish = (gameId, message) => {
        const messageString = JSON.stringify(message)
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && c.readyState === WebSocket.OPEN) {
                c.send(messageString)
            }
        })
    }

    this.notifyHost = (gameId, message) => {
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && !c.playerName && c.readyState === WebSocket.OPEN) {
                c.send(JSON.stringify(message))
            }
        })
    }
}

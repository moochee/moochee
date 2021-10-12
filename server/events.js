'use strict'

import WebSocket from 'ws'
import update from './leaderboard-updater.js'

export default function Events(webSocketServer, webSocket) {
    this.publish = (gameId, message) => {
        const messageString = JSON.stringify(message)
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && c.readyState === WebSocket.OPEN) {
                c.send(messageString)
            }
        })
        process.env.UPDATE_LEADERBOARD ? update(message) : null
    }

    this.reply = (message) => {
        webSocket.send(JSON.stringify(message))
    }

    this.notifyHost = (gameId, message) => {
        webSocketServer.clients.forEach(c => {
            if (c.gameId === gameId && !c.playerName && c.readyState === WebSocket.OPEN) {
                c.send(JSON.stringify(message))
            }
        })
    }
}

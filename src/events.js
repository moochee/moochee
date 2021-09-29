'use strict'

import WebSocket from 'ws'
import update from './leaderboard-updater.js'

export default function Events(webSocketServer, webSocket) {
    this.publish = (gameId, message) => {
        const messageString = JSON.stringify(message)
        webSocketServer.clients.forEach(client => {
            if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
                client.send(messageString)
            }
        })
        process.env.UPDATE_LEADERBOARD ? update(message) : null
    }

    this.reply = (message) => {
        webSocket.send(JSON.stringify(message))
    }
}

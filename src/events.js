'use strict'

import WebSocket from 'ws'
import update from './leaderboard-updater.js'

export default function Events(webSocketServer, webSocket) {
    this.publish = (message) => {
        const [gameId] = message.args.splice(0, 1)
        webSocketServer.clients.forEach(client => {
            if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        })
        process.env.UPDATE_LEADERBOARD ? update(message) : null
    }

    this.reply = (message) => {
        webSocket.send(JSON.stringify(message))
    }
}

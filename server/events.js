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

    // REVISE This design causes trouble since it introduces a dependency on a single 'webSocket' instance
    //        Due to this, this class, which is supposed to be a global event service, becomes rather a client-specific event service.
    //        Result: this class cannot be passed at construction-time into 'games' and 'game', and needs to be passed as method argument for all methods like 'host', 'join', etc.
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

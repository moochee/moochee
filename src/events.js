'use strict'

import WebSocket from 'ws'
import update from './leaderboard-updater.js'

export default function Events(webSocketServer) {
    this.publish = (eventName, gameId, ...args) => {
        const message = JSON.stringify({ event: eventName, args: [...args] })
        webSocketServer.clients.forEach(webSocket => {
            if (webSocket.gameId === gameId && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(message)
            }
        })

        process.env.UPDATE_LEADERBOARD ? update(eventName, args[0]) : null
    }
}

'use strict'

import WebSocket from 'ws'
import update from './leaderboard-updater.js'

export default function Events(wss) {
    this.publish = (eventName, gameId, ...args) => {
        // REVISE if we already publish to the right gameId 'channel', then do we really need to pass the gameId again in the event args?
        const message = JSON.stringify({ event: eventName, args: [gameId, ...args] })
        wss.clients.forEach((ws) => {
            if (ws.gameId === gameId && ws.readyState === WebSocket.OPEN) {
                ws.send(message)
            }
        })

        process.env.UPDATE_LEADERBOARD ? update(eventName, args[0]) : null
    }
}

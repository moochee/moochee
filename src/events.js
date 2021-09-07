'use strict'

import update from './leaderboard-updater.js'

export default function Events(uWS) {
    this.publish = (eventName, gameId, ...args) => {
        // REVISE if we already go to the gameId 'channel' using io.to(channel), then do we really need to pass the gameId again in the event args?
        //io.to(gameId).emit(eventName, gameId, ...args)
        const msg = { event: eventName, args: [gameId, ...args] }
        uWS.publish(gameId, JSON.stringify(msg), false, true)

        process.env.UPDATE_LEADERBOARD ? update(eventName, args[0]) : null
    }
}

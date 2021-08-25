'use strict'

export default function Events(io) {
    this.publish = (eventName, gameId, ...args) => {
        // REVISE if we already go to the gameId 'channel' using io.to(channel), then do we really need to pass the gameId again in the event args?
        io.to(gameId).emit(eventName, gameId, ...args)
    }
}
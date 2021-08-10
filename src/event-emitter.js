'use strict'

// REVISE if we call it eventEmitter, the method should be called 'emit', not 'publish' -> however I rather prefer we call the class 'EventPublisher' instead (seems more typically used in DDD context :-P)
export default function EventEmitter(io) {
    this.publish = (eventName, gameId, ...args) => {
        // REVISE if we already go to the gameId 'channel' using io.to(channel), then do we really need to pass the gameId again in the event args?
        io.to(gameId).emit(eventName, gameId, ...args)
    }
}
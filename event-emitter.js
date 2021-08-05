'use strict'

// REVISE if we call it eventEmitter, the method should be called 'emit', not 'publish' -> however I rather prefer we call the class 'EventPublisher' instead (seems more typically used in DDD context :-P)
export default function EventEmitter(io) {
    this.publish = (eventName, gameId, ...args) => {
        io.to(gameId).emit(eventName, gameId, ...args)
    }
}
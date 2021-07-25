'use strict'

export default function EventEmitter(io) {
  
  this.publish = (eventName, gameId, ...args) => {
    io.to(gameId).emit(eventName, gameId, ...args)
  }

}
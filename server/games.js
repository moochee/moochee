'use strict'

import Game from './game.js'

export default function Games(quizService, events, expiryTimer) {
    let games = []
    let shutdownCallback = null

    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }

    this.host = async (quizId) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, timer, events)
        games.push(game)
        expiryTimer.onTimeout(() => {
            games.splice(games.indexOf(game), 1)
            if (shutdownCallback && games.length === 0) {
                shutdownCallback()
            }
        })
        return game
    }

    this.get = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) {
            throw new Error(`can't find game with id ${id}`)
        }
        return game
    }

    // REVISE inappropriate name, better alternatives might be 'onAllGamesFinished' or 'whenAllGamesFinished'.
    //        shutdown logic belongs to the server/application layer, related terminology should not leak in the domain layer
    this.requestShutdown = (callback) => {
        if (games.length === 0) {
            callback()
        } else {
            shutdownCallback = callback
        }
    }

    // REVISE consider clean this up, unless we want to use it for the status endpoint (fair enough)
    this.getNumberOfRunningGames = () => {
        return games.length
    }
}

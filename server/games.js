'use strict'

import Game from './game.js'
import Players from './players.js'
import Avatars from './avatars.js'

export default function Games(quizService) {
    let games = []
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }

    this.getQuizzes = async (events) => {
        const quizzes = await quizService.getAll()
        // REVISE Is events sometimes null? Optional arguments are usually discouraged.
        events?.reply({ event: 'quizzesReceived', args: [quizzes] })
    }

    // REVISE Why do we have to provide a players list? We host a new game in this method, so it's anyway empty,
    //        so why don't we just initialize it in here? I think it should even be pushed yet another level done and be initialized in game.
    // REVISE 'events' seems rather like a dependency that belongs to the constructor
    this.host = async (quizId, events) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, new Players(new Avatars()), timer)
        games.push(game)
        // REVISE Is events sometimes null? Optional arguments are usually discouraged.
        events?.reply({ event: 'gameStarted', args: [game.id, quiz.title] })
        setTimeout(function deleteGameAfterTwoDays(game) {
            games.splice(games.indexOf(game), 1)
        }, 1000 * 60 * 60 * 3)
        return game
    }

    // REVISE this method looks superfluous - socket server should call games.find and then game.join directly
    this.join = (gameId, name, events) => {
        let joinedOk = true
        try {
            const game = this.find(gameId)
            game.join(name, events)
        } catch (error) {
            // REVISE Is events sometimes null? Optional arguments are usually discouraged.
            events?.reply({ event: 'joiningFailed', args: [error.message] })
            joinedOk = false
        }
        return joinedOk
    }

    // REVISE the name is confusing, cause it works just opposite from Array.find (throws exception if not found instead of returning undefined)
    this.find = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) throw new Error(`can't find game with id ${id}`)
        return game
    }

    // REVISE The name suggests we are returning the running games, but we're returning the number of running games
    this.getRunningGames = () => {
        return games.length
    }
}

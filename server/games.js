'use strict'

import Game from './game.js'
import Players from './players.js'
import Avatars from './avatars.js'

export default function Games(quizService, events) {
    let games = []
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }

    // REVISE Why do we have to provide a players list? We host a new game in this method, so it's anyway empty,
    //        so why don't we just initialize it in here? I think it should even be pushed yet another level done and be initialized in game.
    this.host = async (quizId) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, new Players(new Avatars()), timer, events)
        games.push(game)
        setTimeout(function deleteGameAfterTwoDays(game) {
            games.splice(games.indexOf(game), 1)
        }, 1000 * 60 * 60 * 3)
        return game
    }

    this.get = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) throw new Error(`can't find game with id ${id}`)
        return game
    }

    // REVISE The name suggests we are returning the running games, but we're returning the number of running games
    this.getRunningGames = () => {
        return games.length
    }
}

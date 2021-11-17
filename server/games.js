'use strict'

import Game from './game.js'

export default function Games(quizService, events) {
    let games = []
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }

    this.host = async (quizId) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, timer, events)
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

    this.getNumberOfRunningGames = () => {
        return games.length
    }
}

'use strict'

import Game from './game.js'
import Events from './events.js'
import Avatars from './avatars.js'
import Players from './players.js'

// REVISE split Games and Game, the complexity became too high
export default function Games(quizService, webSocketServer) {
    const games = []
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }
    const events = new Events(webSocketServer)
    const players = new Players(new Avatars())

    this.getQuizzes = async () => {
        return await quizService.getAll()
    }

    this.host = async (quizId) => {
        const quiz = await quizService.getById(quizId)
        const game = this.create(quiz, events, players, timer)
        return { gameId: game.id, quizTitle: quiz.title }
    }

    this.create = (quiz, events, players, timer) => {
        const game = new Game(quiz, events, players, timer)
        games.push(game)
        return game
    }

    this.find = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) throw new Error(`can't find game with id ${id}`)
        return game
    }
}
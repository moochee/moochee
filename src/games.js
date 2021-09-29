'use strict'

import Game from './game.js'

export default function Games(quizService, timer) {
    const games = []

    this.getQuizzes = async (events) => {
        const quizzes = await quizService.getAll()
        events?.reply({ event: 'quizzesReceived', args: [quizzes] })
    }

    this.host = async (quizId, players, events) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, players, timer)
        games.push(game)
        events?.reply({ event: 'gameStarted', args: [game.id, quiz.title] })
        return game
    }

    this.join = (gameId, name, events) => {
        let joinedOk = true
        try {
            const game = this.find(gameId)
            game.join(name, events)
        } catch (error) {
            events?.reply({ event: 'joiningFailed', args: [error.message] })
            joinedOk = false
        }
        return joinedOk
    }

    this.find = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) throw new Error(`can't find game with id ${id}`)
        return game
    }
}
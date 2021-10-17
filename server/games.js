'use strict'

import Game from './game.js'

export default function Games(quizService, timer) {
    let games = []

    this.getQuizzes = async (events) => {
        const quizzes = await quizService.getAll()
        events?.reply({ event: 'quizzesReceived', args: [quizzes] })
    }

    this.host = async (quizId, players, events) => {
        const quiz = await quizService.get(quizId)
        let game = createGameWithoutCollidingId(quiz, players)
        games.push(game)
        events?.reply({ event: 'gameStarted', args: [game.id, quiz.title] })
        return game
    }

    const createGameWithoutCollidingId = (quiz, players) => {
        let game = new Game(quiz, players, timer)
        while (games.find(g => g.id === game.id)) {
            game = new Game(quiz, players, timer)
        }
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

    this.getRunningGames = () => {
        this.deleteInactiveGames()
        return { runningGames: games.length }
    }

    this.deleteInactiveGames = () => {
        const thirtyMinutes = 1000 * 60 * 30
        games = games.filter(g => (Date.now() - g.getCreatedAt()) <= thirtyMinutes)
    }
}
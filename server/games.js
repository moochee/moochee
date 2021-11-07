'use strict'

import Game from './game.js'

export default function Games(quizService) {
    let games = []
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }

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
        return games.length
    }

    // FIXME name is misleading and this can cause serious trouble
    //       This deletes games not when they were inactive for 30min, it deletes them 30min after they have been created, even if they are "active".
    //       It also feels wrong that this is a public method. There should be something like a timeout event that gets initialized when a game gets created.
    //       The timeout would delete the game if it is reached, and it should get refreshed on each activity on the game.
    this.deleteInactiveGames = () => {
        const thirtyMinutes = 1000 * 60 * 30
        games = games.filter(g => (Date.now() - g.getCreatedAt()) <= thirtyMinutes)
    }
}
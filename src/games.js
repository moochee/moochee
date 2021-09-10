'use strict'

import Avatars from './avatars.js'

export default function Games(timer, quizService, events) {
    let nextGameId = 100000
    const games = []
    const secondsOfNetworkDelay = 2

    this.getQuizzes = async () => {
        return await quizService.getAll()
    }

    this.host = async (quizId) => {
        const gameId = String(nextGameId++)
        const quiz = await quizService.getById(quizId)
        const remainingQuestions = quiz.questions.map((q, index) => {
            return { id: index + 1, text: q.text, answers: q.answers, totalQuestions: quiz.questions.length }
        })
        const questionsAndGuesses = quiz.questions.map((q, index) => {
            return { id: index + 1, rightAnswerId: q.rightAnswerId, guesses: [], totalQuestions: quiz.questions.length }
        })
        games.push({ id: gameId, quizTitle: quiz.title, remainingQuestions, questionsAndGuesses, players: [], avatars: new Avatars() })
        return { gameId, quizTitle: quiz.title }
    }

    this.join = (gameId, name) => {
        const game = games.find(g => g.id === gameId)
        if (!game) {
            throw new Error('Game does not exist!')
        }
        if (!name) {
            throw new Error('Player name is empty!')
        }
        if (game.players.find(p => p.name === name)) {
            throw new Error(`Player ${name} already exists!`)
        }
        if (game.avatars.size() === 0) {
            throw new Error(`Game reached max. number of players(${game.players.length})!`)
        }
        const avatar = game.avatars.pick()
        const newPlayer = { name, avatar, score: 0 }
        game.players.push(newPlayer)
        events.publish('playerJoined', gameId, newPlayer.avatar)
        return { quizTitle: game.quizTitle, name: newPlayer.name, avatar: newPlayer.avatar, otherPlayers: game.players.filter(p => p.name !== name).map(p => p.avatar) }
    }

    this.nextRound = (gameId) => {
        const game = games.find(g => g.id === gameId)
        const question = game.remainingQuestions.shift()
        events.publish('roundStarted', gameId, question, timer.secondsToGuess)

        game.guessTimeoutId = timer.setTimeout(() => finishRound(gameId), (timer.secondsToGuess + secondsOfNetworkDelay) * 1000)
        game.roundStartTime = new Date()
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        const game = games.find(g => g.id === gameId)
        const roundFinished = !game.roundStartTime
        if (roundFinished) return
        const question = game.questionsAndGuesses.find(q => q.id === questionId)
        question.guesses.push({ playerName, answerId })

        const responseTime = (new Date() - game.roundStartTime) - secondsOfNetworkDelay * 1000
        const score = question.rightAnswerId === answerId ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
        game.players.find(p => p.name === playerName).score += score

        if (question.guesses.length === game.players.length) {
            timer.clearTimeout(game.guessTimeoutId)
            finishRound(gameId)
        }
    }

    const finishRound = (gameId) => {
        const game = games.find((g) => g.id === gameId)
        game.roundStartTime = null
        const result = [...game.players]
        result.sort((a, b) => b.score - a.score)
        if (game.remainingQuestions.length > 0) {
            events.publish('roundFinished', gameId, result)
        } else {
            events.publish('gameFinished', gameId, result)
        }
    }

    this.disconnect = (gameId, playerName) => {
        const game = games.find((g) => g.id === gameId)
        if (game && game.players && playerName) {
            const player = game.players.find((p) => p.name === playerName)
            game.players = game.players.filter(p => p.name != playerName)
            events.publish('playerDisconnected', game.id, player.avatar)
        }
    }
}
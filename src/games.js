'use strict'

import Avatars from './avatars.js'
import Game from './game.js'

// REVISE split Games and Game, the complexity became too high
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
        // REVISE find a better name - maybe status or round? (since it is used to track the status of the round)
        const questionsAndGuesses = quiz.questions.map((q, index) => {
            return { id: index + 1, text: q.text, answers: q.answers.map(a => ({ ...a, count: 0 })), rightAnswerId: q.rightAnswerId, guesses: [] }
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
        const questionAndGuesses = game.questionsAndGuesses.find(q => q.id === question.id)
        const timeToGuess = (timer.secondsToGuess + secondsOfNetworkDelay) * 1000
        game.guessTimeoutId = timer.setTimeout(() => finishRound(gameId, questionAndGuesses), timeToGuess)
        game.roundStartTime = new Date()
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        const game = games.find(g => g.id === gameId)
        const roundFinished = !game.roundStartTime
        if (roundFinished) return
        const question = game.questionsAndGuesses.find(q => q.id === questionId)
        question.guesses.push({ playerName, answerId })
        question.answers.filter(a => a.id === answerId).forEach(a => a.count++)

        const responseTime = (new Date() - game.roundStartTime) - secondsOfNetworkDelay * 1000
        const score = question.rightAnswerId === answerId ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
        game.players.find(p => p.name === playerName).score += score

        // FIXME this logic will fail if a player guessed multiple times, or if players drop while the quiz is running (write a test to confirm it)
        //       better do it like in the poker game: have a flag 'hasGuessed' on the player, and just check if all remaining players have p.hasGuessed=true
        if (question.guesses.length === game.players.length) {
            timer.clearTimeout(game.guessTimeoutId)
            finishRound(gameId, question)
        }
    }

    // REVISE make finishRound public method, it will simplify the tests a lot and I feel it's a valid business case
    const finishRound = (gameId, result) => {
        const game = games.find((g) => g.id === gameId)
        game.roundStartTime = null
        const scoreboard = [...game.players]
        scoreboard.sort((a, b) => b.score - a.score)
        if (game.remainingQuestions.length > 0) {
            events.publish('roundFinished', gameId, { result, scoreboard })
        } else {
            events.publish('gameFinished', gameId, { result, scoreboard })
        }
    }

    this.disconnect = (gameId, playerName) => {
        const game = games.find(g => g.id === gameId)
        if (game && game.players && playerName) {
            const player = game.players.find(p => p.name === playerName)
            game.players = game.players.filter(p => p.name != playerName)
            events.publish('playerDisconnected', game.id, player.avatar)
        }
    }

    this.create = (quiz, events, avatars, timer) => {
        const game = new Game(quiz, events, avatars, timer)
        games.push(game)
        return game
    }

    this.find = (id) => {
        const game = games.find((game) => game.id === id)
        if (!game) throw new Error(`can't find game with id ${id}`)
        return game
    }
}
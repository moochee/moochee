'use strict'

export default function Games(timer, quizRepo, eventEmitter) {
    let nextGameId = 100000
    const games = []

    this.avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')

    this.getQuizzes = async () => {
        return await quizRepo.getAll()
    }

    this.host = async (quizId) => {
        const gameId = String(nextGameId++)
        const questions = (await quizRepo.getById(quizId)).questions
        const remainingQuestions = questions.map((q, index) => {
            return { id: index + 1, text: q.text, answers: q.answers }
        })
        const questionsAndGuesses = questions.map((q, index) => {
            return { id: index + 1, rightAnswerId: q.rightAnswerId, guesses: [] }
        })
        games.push({ id: gameId, remainingQuestions, questionsAndGuesses, players: [] })
        // REVISE only use async eventing, not sync returning
        return gameId
    }

    this.join = (gameId, name, socketId) => {
        const game = games.find(g => g.id === gameId)
        if (!name) {
            throw new Error('Player name is empty!')
        }
        if (game.players.find(p => p.name === name)) {
            throw new Error(`Player ${name} already exists!`)
        }
        const avatar = this.avatars.splice(Math.random() * this.avatars.length, 1)[0]
        const newPlayer = { name, avatar, score: 0, socketId }
        game.players.push(newPlayer)
        eventEmitter.publish('playerJoined', gameId, newPlayer)
        // REVISE only use async eventing, not sync returning
        return avatar
    }

    this.nextRound = (gameId) => {
        const game = games.find(g => g.id === gameId)
        const question = game.remainingQuestions.shift()
        eventEmitter.publish('roundStarted', gameId, question, timer.secondsToGuess)
        this.guessTimeoutId = timer.setTimeout(() => finishRound(gameId), timer.secondsToGuess * 1000)
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        const game = games.find(g => g.id === gameId)
        const question = game.questionsAndGuesses.find(q => q.id === questionId)
        question.guesses.push({ playerName, answerId })

        const score = question.rightAnswerId === answerId ? 100 : 0
        game.players.find(p => p.name === playerName).score += score

        if (question.guesses.length === game.players.length) {
            timer.clearTimeout(this.guessTimeoutId)
            finishRound(gameId)
        }
    }

    const finishRound = (gameId) => {
        const game = games.find((g) => g.id === gameId)
        // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
        const result = [...game.players]
        result.sort((a, b) => b.score - a.score)
        if (game.remainingQuestions.length > 0) {
            eventEmitter.publish('roundFinished', gameId, result)
        } else {
            eventEmitter.publish('gameFinished', gameId, result)
        }
    }

    this.disconnect = (socketId) => {
        let game, player
        for (let g of games) {
            player = g.players.find(p => p.socketId === socketId)
            if (player) {
                game = g
                break
            }
        }
        if (game && game.players) {
            game.players = game.players.filter(p => p.socketId != socketId)
            eventEmitter.publish('playerDisconnected', game.id, player.name)
        }
    }
}
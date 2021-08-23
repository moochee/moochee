'use strict'

export default function Games(timer, quizRepo, eventEmitter) {
    let nextGameId = 100000
    const games = []
    const avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🐙🐲🦉🦋🐴🦄🐿🐝🐌🐢🦀🐠🐬🐳🐍🦎🦖🦭🐊🦧🦣🦏🐫🦒🦔🦡🦩🦢🦥🦜🦣🐘')
    this.getQuizzes = async () => {
        return await quizRepo.getAll()
    }

    this.host = async (quizId) => {
        const gameId = String(nextGameId++)
        const quiz = await quizRepo.getById(quizId)
        const questions = quiz.questions
        const remainingQuestions = questions.map((q, index) => {
            return { id: index + 1, text: q.text, answers: q.answers }
        })
        const questionsAndGuesses = questions.map((q, index) => {
            return { id: index + 1, rightAnswerId: q.rightAnswerId, guesses: [] }
        })
        games.push({ id: gameId, quizTitle: quiz.text, remainingQuestions, questionsAndGuesses, players: [], avatars: [...avatars] })
        return gameId
    }

    this.join = (gameId, name, socketId) => {
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
        if (game.avatars.length === 0) {
            throw new Error(`Game reached max. number of players(${game.players.length})!`)
        }
        const avatar = game.avatars.splice(Math.random() * game.avatars.length, 1)[0]
        const newPlayer = { name, avatar, score: 0, socketId }
        game.players.push(newPlayer)
        eventEmitter.publish('playerJoined', gameId, newPlayer.avatar)
        return { quizTitle: game.quizTitle, avatar: newPlayer.avatar, score: newPlayer.score, otherPlayers: game.players.filter(p => p.name !== name).map(p => p.avatar) }
    }

    this.nextRound = (gameId) => {
        const game = games.find(g => g.id === gameId)
        const question = game.remainingQuestions.shift()
        eventEmitter.publish('roundStarted', gameId, question, timer.secondsToGuess)
        game.guessTimeoutId = timer.setTimeout(() => finishRound(gameId), timer.secondsToGuess * 1000)
        game.roundStart = new Date()
    }

    this.guess = (gameId, questionId, playerName, answerId) => {
        const game = games.find(g => g.id === gameId)
        const roundFinished = !game.roundStart
        if (roundFinished) return
        const question = game.questionsAndGuesses.find(q => q.id === questionId)
        question.guesses.push({ playerName, answerId })

        const stickyAnimationTime = 1000
        const networkDelayTime = 1000
        const responseTime = (new Date() - game.roundStart) - stickyAnimationTime - networkDelayTime
        const score = question.rightAnswerId === answerId ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
        game.players.find(p => p.name === playerName).score += score

        if (question.guesses.length === game.players.length) {
            timer.clearTimeout(game.guessTimeoutId)
            finishRound(gameId)
        }
    }

    const finishRound = (gameId) => {
        const game = games.find((g) => g.id === gameId)
        game.roundStart = null
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
            eventEmitter.publish('playerDisconnected', game.id, player.avatar)
        }
    }
}

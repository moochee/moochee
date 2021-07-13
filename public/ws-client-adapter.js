'use strict'

export default function WsClientAdapter() {
    let nextGameId = 100000
    let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
    const subscribers = []
    const games = []

    this.subscribe = (event, subscriber) => {
        socket.on(event, subscriber)
    }

    this.unsubscribe = (subscriber) => {
        socket.off(event, subscriber)
    }

    this.join = async (gameId, name) => {
        socket.emit('join', gameId, name)
    }

    this.host = async () => {
        return new Promise(resolve => {
            socket.emit('host', (gameId) => resolve(gameId))
        })
    }

    const finishRound = (gameId) => {
        const game = games.find((g) => g.id === gameId)
        // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
        const result = [...game.players]
        result.sort((a, b) => b.score - a.score)
        const hasSameScoreAsPrevious = (index) => (index > 0) && (result[index].score === result[index - 1].score)
        result.forEach((p, index) => p.rank = hasSameScoreAsPrevious(index) ? index : index + 1)
        if (questionsWithoutRightAnswer.length > 0) {
            publish('roundFinished', gameId, result)
        } else {
            publish('gameFinished', gameId, result)
        }
    }

    this.nextRound = (gameId) => {
        const question = questionsWithoutRightAnswer.shift()
        const timeToGuess = 20000;
        publish('roundStarted', gameId, question, timeToGuess)
        setTimeout(() => finishRound(gameId), timeToGuess)
    }

    this.start = (gameId) => {
        this.nextRound(gameId)
    }

    this.guess = (gameId, questionText, playerName, answer) => {
        const game = games.find(g => g.id === gameId)

        const question = game.questions.find(q => q.text === questionText)
        //TODO: make sure only 1 answer per player
        question.guesses.push({playerName, answer})

        const score = question.rightAnswer === answer ? 100 : 0
        game.players.find(p => p.name === playerName).score += score

        if (question.guesses.length === game.players.length) {
            finishRound(gameId)
        }
    }
}

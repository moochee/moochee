'use strict'

export default function DemoAdapter(setTimeout, questions) {
    let nextGameId = 100000
    let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
    const subscribers = []
    const games = []

    // const questions = [
    //     { text: 'Fake question 1?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 2?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 3?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 4?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 5?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 6?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 7?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 8?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 9?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
    //     { text: 'Fake question 10?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' }
    // ]

    // REVISE just checking - why do we need to map the whole thing, can't we just do it on the fly in "nextRound"
    const questionsWithoutRightAnswer = questions.map((q, index) => {
        return { sequence: index + 1, text: q.text, answers: q.answers }
    })

    this.subscribe = (event, subscriber) => {
        subscribers.push({ event, subscriber })
    }

    this.unsubscribe = (subscriber) => {
        const index = subscribers.findIndex((entry) => entry.subscriber === subscriber)
        subscribers.splice(index, 1)
    }

    const publish = (event, ...args) => {
        subscribers.filter((entry) => entry.event === event).forEach((entry) => entry.subscriber(...args))
    }

    this.join = (gameId, name) => {
        const avatar = avatars.splice(Math.random() * avatars.length, 1)
        const newPlayer = { name, avatar, score: 0 }
        games.find((g) => g.id === gameId).players.push(newPlayer)
        publish('playerJoined', gameId, newPlayer)
    }

    this.host = () => {
        const gameId = String(nextGameId++)
        const questionsAndGuesses = questions.map(q => {
            return { text: q.text, rightAnswer: q.rightAnswer, guesses: [] }
        })
        games.push({ id: gameId, questions: questionsAndGuesses, players: [] })
        return gameId
    }

    const finishRound = (gameId) => {
        const game = games.find((g) => g.id === gameId)
        // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
        const result = [...game.players]
        result.sort((a, b) => b.score - a.score)
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

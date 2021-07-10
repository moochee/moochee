'use strict'

export default function DemoAdapter() {
    let nextGameId = 100000
    let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
    const subscribers = []
    const games = []

    const questions = [
        { sequence: 1, text: 'Fake question 1?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 2, text: 'Fake question 2?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 3, text: 'Fake question 3?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 4, text: 'Fake question 4?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 5, text: 'Fake question 5?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 6, text: 'Fake question 6?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 7, text: 'Fake question 7?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 8, text: 'Fake question 8?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 9, text: 'Fake question 9?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 10, text: 'Fake question 10?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' }
    ]

    // REVISE just checking - why do we need to map the whole thing, can't we just do it in "newQuestion"
    const questionsWithoutRightAnswer = questions.map(q => {
        return { sequence: q.sequence, text: q.text, answers: q.answers }
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
            return { sequence: q.sequence, rightAnswer: q.rightAnswer, guesses: [] }
        })
        games.push({ id: gameId, questions: questionsAndGuesses, players: [] })
        return gameId
    }

    const evaluate = (gameId) => {
        console.log('evaluate')
        const game = games.find((g) => g.id === gameId)
        // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
        const sampleEvaluationResult = [game.players[0], game.players[1], game.players[2], game.players[3]]
        publish('roundFinished', gameId, sampleEvaluationResult)
        // TODO if no more questions left, game is finished
        // publish('gameFinished', endResult)
    }

    this.newQuestion = (gameId) => {
        const countdown = 1000
        const question = questionsWithoutRightAnswer.shift()
        publish('newQuestion', gameId, question, countdown)
        setTimeout(() => evaluate(gameId), countdown)
    }

    this.start = (gameId) => {
        this.newQuestion(gameId)
    }

    this.guess = (gameId, question, playerName, answer) => {
        games.find(game => game.id === gameId)
            .questions.find(q => q.sequence === question.sequence)
            .guesses.push({ playerName, answer })
    }
}

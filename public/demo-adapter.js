'use strict'

function DemoAdapter() {
    let nextGameId = 100000
    let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
    const joinSubscribers = []
    const newQuestionSubscribers = []
    const evaluateSubscribers = []
    const questions = [
        { sequence: 1, text: 'Fake question 1?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 2, text: 'Fake question 2?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' },
        { sequence: 3, text: 'Fake question 3?', answers: ['answer1', 'answer2', 'answer3', 'answer4'], rightAnswer: 'answer1' }
    ]
    const questionsWithoutRightAnswer = questions.map( q => {
        return { sequence: q.sequence, text: q.text, answers: q.answers }
    })
    const games = []

    this.subscribeJoin = (subscriber) => {
        joinSubscribers.push(subscriber)
    }

    this.unsubscribeJoin = (subscriber) => {
        const index = joinSubscribers.findIndex((s) => s === subscriber)
        joinSubscribers.splice(index, 1)
    }

    this.subscribeNewQuestion = (subscriber) => {
        newQuestionSubscribers.push(subscriber)
    }

    this.unsubscribeNewQuestion = (subscriber) => {
        const index = newQuestionSubscribers.findIndex((s) => s === subscriber)
        newQuestionSubscribers.splice(index, 1)
    }

    this.subscribeEvaluate = (subscriber) => {
        evaluateSubscribers.push(subscriber)
    }

    this.unsubscribeEvaluate = (subscriber) => {
        const index = evaluateSubscribers.findIndex((s) => s === subscriber)
        evaluateSubscribers.splice(index, 1)
    }

    this.join = (gameId, playerName) => {
        const avatar = avatars.splice(Math.random() * avatars.length, 1)
        joinSubscribers.forEach((subscriber) => subscriber(gameId, playerName, avatar))
        games.find(game => game.id === gameId).players.push({name: playerName, score: 0})
    }

    this.host = () => {
        const gameId = String(nextGameId++)
        const questionsAndGuesses = questions.map(q => { 
            return { sequence: q.sequence, rightAnswer: q.rightAnswer, guesses: [] } 
        })
        games.push({id: gameId, questions: questionsAndGuesses, players: []})
        return gameId
    }

    this.start = (gameId) => {
        const nextQuestion = questionsWithoutRightAnswer.shift()
        newQuestionSubscribers.forEach((subscriber) => subscriber(gameId, nextQuestion))
    }

    this.guess = (gameId, questionSequence, playerName, answer) => {
        const game = games.find(g => g.id === gameId)

        const question = game.questions.find(q => q.sequence === questionSequence)
        //TODO: make sure only 1 answer per player
        question.guesses.push({playerName, answer})

        const score = question.rightAnswer === answer ? 100 : 0
        game.players.find(p => p.name === playerName).score += score

        if (question.guesses.length === game.players.length) {
            evaluateSubscribers.forEach((subscriber) => subscriber(gameId, game.players))
        }
    }
}

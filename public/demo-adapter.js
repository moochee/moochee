'use strict'

function DemoAdapter() {
    let nextGameId = 100000
    let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
    const joinSubscribers = []
    const newQuestionSubscribers = []
    const questions = [
        { sequence: 1, text: 'Fake question 1?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 2, text: 'Fake question 2?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 3, text: 'Fake question 3?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 4, text: 'Fake question 4?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 5, text: 'Fake question 5?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 6, text: 'Fake question 6?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 7, text: 'Fake question 7?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 8, text: 'Fake question 8?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 9, text: 'Fake question 9?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] },
        { sequence: 10, text: 'Fake question 10?', answers: ['answer1', 'answer2', 'answer3', 'answer4'] }
    ]

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

    this.join = (gameId, playerName) => {
        const avatar = avatars.splice(Math.random() * avatars.length, 1)
        joinSubscribers.forEach((subscriber) => subscriber(gameId, playerName, avatar))
    }

    this.host = () => {
        return String(nextGameId++)
    }

    this.start = (gameId) => {
        const nextQuestion = questions.shift()
        newQuestionSubscribers.forEach((subscriber) => subscriber(gameId, nextQuestion))
    }
}

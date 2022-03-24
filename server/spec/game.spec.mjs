'use strict'

import Game from '../game.js'

describe('Game', () => {
    let game, quiz, timer, events
    const ALICE = 'Alice', BOB = 'Bob'

    beforeEach(async () => {
        quiz = { title: 'sample quiz', questions: [] }
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        events = {
            publish: function (_, message) { this.publishedMessage = message },
            notifyHost: function () { this.hostNotified = true }
        }
        game = new Game(quiz, timer, events)
    })

    it('sets score, avatar and presents quiz title when player joins a game', () => {
        game.join(ALICE)
        expect(events.publishedMessage).toEqual({ event: 'playerJoined', args: [jasmine.any(String)] })
    })

    it('sends error when player joins with empty name', () => {
        expect(() => game.join('')).toThrowError()
    })

    it('sends error when player name exists', () => {
        game.join(ALICE)
        expect(() => game.join(ALICE)).toThrowError()
    })

    it('presents first question without correct answer and seconds to guess when first round starts', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        const expectedQuestion = { id: 1, text: 'q1', answers: [{ text: 'a1' }], totalQuestions: 1 }
        const expectedMessage = { event: 'roundStarted', args: [expectedQuestion, null] }
        expect(events.publishedMessage).toEqual(expectedMessage)
    })

    it('presents the answer distribution when a round is finished', () => {
        const q1 = { text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }
        const q2 = { text: 'q2', answers: [] }
        quiz.questions = [q1, q2]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 0)
        const expectedMessage = { event: 'roundFinished', args: [jasmine.any(Object)] }
        expect(events.publishedMessage).toEqual(expectedMessage)
        const result = events.publishedMessage.args[0].result
        expect(result.answers[0].count).toEqual(2)
        expect(result.answers[1].count).toEqual(0)
    })

    it('presents the scoreboard when a round is finished', () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0])
        const expectedMessage = { event: 'roundFinished', args: [jasmine.objectContaining({ scoreboard: [] })] }
        expect(events.publishedMessage).toEqual(expectedMessage) // no players, so the scoreboard is empty
    })

    it('presents the second question when the next round is started', () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        timer.secondsToGuess = 10
        game.nextRound()
        game.nextRound()
        const expectedQuestion = { id: 2, text: 'q2', answers: [], totalQuestions: 2 }
        const expectedMessage = { event: 'roundStarted', args: [expectedQuestion, 10] }
        expect(events.publishedMessage).toEqual(expectedMessage)
    })

    it('is finished when there are no more questions', () => {
        quiz.questions = [{ text: 'q1', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0])
        expect(events.publishedMessage).toEqual({ event: 'gameFinished', args: [jasmine.any(Object)] })
    })

    it('notifies host whenever player guessed', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        expect(events.hostNotified).toBe(true)
    })

    it('should fire finishRound only once if all players guessed before timeout', () => {
        let finishRoundCalled = 0
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }], }, { text: 'q2', answers: [] }]
        events.publish = function (_, message) { if (message.event === 'roundFinished') finishRoundCalled++ }
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 1)
        game.finishRound(quiz.questions[0]) // simulate timeout
        expect(finishRoundCalled).toEqual(1)
    })

    it('assigns points if player guessed the right answer', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 1)
        game.finishRound(quiz.questions[0]) // simulate timeout
        expect(events.publishedMessage.args[0].scoreboard[0].score).toBeGreaterThan(0)
        expect(events.publishedMessage.args[0].scoreboard[1].score).toBe(0)
    })

    it('should fire finishRound only once if the last player answered after timeout', () => {
        let finishRoundCalled = 0
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }], }, { text: 'q2', answers: [] }]
        events.publish = function (_, message) { if (message.event === 'roundFinished') finishRoundCalled++ }
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.finishRound(quiz.questions[0]) // simulate timeout
        game.guess(BOB, 0)
        expect(finishRoundCalled).toEqual(1)
    })

    it('should get zero score if the last player answered correctly after timeout', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        events.publish = function (_, message) { this.publishedMessage = message }
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.finishRound(quiz.questions[0])
        game.guess(BOB, 0)
        expect(events.publishedMessage.args[0].scoreboard[0].score).toBeGreaterThan(0)
        expect(events.publishedMessage.args[0].scoreboard[1].score).toBe(0)
    })

    // REVISE shouldn't we have a test for increasing the score based on faster response time?
    // REVISE add a test for the intermediate results - server should NOT present the player names
})

'use strict'

import Games from '../games.js'
import Avatars from '../avatars.js'
import Players from '../players.js'

describe('Game', () => {
    let game, quiz, players, events, avatars, timer
    const ALICE = 'Alice', BOB = 'Bob', JENNY = 'Jenny'

    beforeEach(async () => {
        quiz = { title: 'sample quiz', questions: [] }
        events = {
            publish: function (_, message) { this.publishedMessage = message },
            reply: function (message) { this.repliedMessage = message },
            notifyHost: function () { this.hostNotified = true }
        }
        avatars = new Avatars([['x'], ['y']])
        players = new Players(avatars)
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        const games = new Games({ get: async () => quiz }, timer)
        game = await games.host(null, players, events)
    })

    it('sets score, avatar and presents quiz title when player joins a game', () => {
        game.join(ALICE, events)
        expect(events.repliedMessage).toEqual({ event: 'joiningOk', args: [quiz.title, ALICE, jasmine.any(String), []] })
        expect(events.publishedMessage).toEqual({ event: 'playerJoined', args: [jasmine.any(String)] })
    })

    it('sends error when player joins with empty name', () => {
        expect(() => game.join('', events)).toThrowError()
    })

    it('sends error when player name exists', () => {
        game.join(ALICE)
        expect(() => game.join(ALICE, events)).toThrowError()
    })

    it('send error when reaching max. number of players', () => {
        game.join(ALICE)
        game.join(BOB)
        expect(() => game.join(JENNY, events)).toThrowError()
    })

    it('presents first question without correct answer and seconds to guess when first round starts', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound(events)
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
        game.guess(BOB, 0, events)
        const expectedMessage = { event: 'roundFinished', args: [jasmine.any(Object)] }
        expect(events.publishedMessage).toEqual(expectedMessage)
        const result = events.publishedMessage.args[0].result
        expect(result.answers[0].count).toEqual(2)
        expect(result.answers[1].count).toEqual(0)
    })

    it('presents the scoreboard when a round is finished', () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0], events)
        const expectedMessage = { event: 'roundFinished', args: [jasmine.objectContaining({ scoreboard: [] })] }
        expect(events.publishedMessage).toEqual(expectedMessage) // no players, so the scoreboard is empty
    })

    it('presents the second question when the next round is started', () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        timer.secondsToGuess = 10
        game.nextRound()
        game.nextRound(events)
        const expectedQuestion = { id: 2, text: 'q2', answers: [], totalQuestions: 2 }
        const expectedMessage = { event: 'roundStarted', args: [expectedQuestion, 10] }
        expect(events.publishedMessage).toEqual(expectedMessage)
    })

    it('is finished when there are no more questions', () => {
        quiz.questions = [{ text: 'q1', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0], events)
        expect(events.publishedMessage).toEqual({ event: 'gameFinished', args: [jasmine.any(Object)] })
    })

    it('notifies host whenever player guessed', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0, events)
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
        game.finishRound(quiz.questions[0], events) // simulate timeout
        expect(finishRoundCalled).toEqual(1)
    })

    it('assigns points if player guessed the right answer', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 1, events)
        game.finishRound(quiz.questions[0], events) // simulate timeout
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
        game.finishRound(quiz.questions[0], events) // simulate timeout
        game.guess(BOB, 0, events)
        expect(finishRoundCalled).toEqual(1)
    })

    it('should get zero score if the last player answered correctly after timeout', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        events.publish = function (_, message) { this.publishedMessage = message }
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.finishRound(quiz.questions[0], events)
        game.guess(BOB, 0, events)
        expect(events.publishedMessage.args[0].scoreboard[0].score).toBeGreaterThan(0)
        expect(events.publishedMessage.args[0].scoreboard[1].score).toBe(0)
    })

    // TODO shouldn't we have a test for increasing the score based on faster response time?
    // TODO add a test for the intermediate results - server should NOT present the player names
})

'use strict'

import Games from '../games.js'
import Avatars from '../avatars.js'
import Players from '../players.js'

describe('Game', () => {
    let game, quiz, events, avatars, players, timer
    const ALICE = 'Alice', BOB = 'Bob', JENNY = 'Jenny'

    beforeEach(() => {
        quiz = { title: 'sample quiz', questions: [] }
        events = { publish: function (...args) { this.actualArgs = args } }
        avatars = new Avatars([['x'], ['y']])
        players = new Players(avatars)
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        game = new Games().create(quiz, events, players, timer)
    })

    it('sets score, avatar and presents quiz title when player joins a game', () => {
        game.join(ALICE)
        const expectedArgs = ['playerJoined', game.id, jasmine.any(String)]
        expect(events.actualArgs).toEqual(expectedArgs)
    })

    it('sends error when player joins with empty name', () => {
        expect(() => game.join('')).toThrow()
    })

    it('sends error when player name exists', () => {
        game.join(ALICE)
        expect(() => game.join(ALICE)).toThrow()
    })

    it('send error when reaching max. number of players', () => {
        game.join(ALICE)
        game.join(BOB)
        expect(() => game.join(JENNY)).toThrow()
    })

    it('presents first question without correct answer and seconds to guess when first round starts', () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        const expectedQuestion = { id: 1, text: 'q1', answers: [{ text: 'a1' }], totalQuestions: 1 }
        const expectedArgs = ['roundStarted', game.id, expectedQuestion, null]
        expect(events.actualArgs).toEqual(expectedArgs)
    })

    it('presents the answer distribution when a round is finished', () => {
        const q1 = { text: 'fun?', answers: [{ text: 'yeah', correct: true }, { text: 'nah' }] }
        const q2 = { text: 'sad?', answers: [] }
        quiz.questions = [q1, q2]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 0)
        const expectArgs = ['roundFinished', game.id, jasmine.any(Object)]
        expect(events.actualArgs).toEqual(expectArgs)
        const result = events.actualArgs[2].result
        expect(result.answers[0].count).toEqual(2)
        expect(result.answers[1].count).toEqual(0)
    })

    it('presents the scoreboard when a round is finished', () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0])
        expect(events.actualArgs).toEqual(['roundFinished', game.id, jasmine.objectContaining({ scoreboard: [] })]) // no players, so the scoreboard is empty
    })

    it('presents the second question when the next round is started', async () => {
        quiz.questions = [{ text: 'q1', answers: [] }, { text: 'q2', answers: [] }]
        timer.secondsToGuess = 10
        game.nextRound()
        game.nextRound()
        const expectedQuestion = { id: 2, text: 'q2', answers: [], totalQuestions: 2 }
        expect(events.actualArgs).toEqual(['roundStarted', game.id, expectedQuestion, 10])
    })

    it('is finished when there are no more questions', async () => {
        quiz.questions = [{ text: 'q1', answers: [] }]
        game.nextRound()
        game.finishRound(quiz.questions[0])
        expect(events.actualArgs).toEqual(['gameFinished', game.id, jasmine.any(Object)])
    })

    it('should fire finishRound only once if all players guessed before timeout', async () => {
        let finishRound
        timer.setTimeout = (callback) => finishRound = callback
        timer.clearTimeout = () => finishRound = () => null
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }], }, { text: 'q2', answers: [] }]
        events.publish = function (...args) {
            if (args[0] === 'roundFinished') this.finishRoundCalled = this.finishRoundCalled || 0 + 1
        }

        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 1)
        finishRound()
        expect(events.finishRoundCalled).toEqual(1)
    })

    it('assigns points if player guessed the right answer', async () => {
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        game.guess(BOB, 1)
        game.finishRound(quiz.questions[0])
        expect(events.actualArgs[2].scoreboard[0].score).toBeGreaterThan(0)
        expect(events.actualArgs[2].scoreboard[1].score).toBe(0)
    })

    it('should fire finishRound only once if the last player answered after timeout', async () => {
        let finishRound, finishRoundCalled = 0
        timer.setTimeout = (callback) => finishRound = callback
        timer.clearTimeout = () => finishRound = () => null
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }], }, { text: 'q2', answers: [] }]
        events.publish = function (...args) { if (args[0] === 'roundFinished') finishRoundCalled++ }
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        finishRound()
        game.guess(BOB, 0)
        expect(finishRoundCalled).toEqual(1)
    })

    it('should get zero score if the last player answered correctly after timeout', async () => {
        let finishRound
        timer.setTimeout = (callback) => finishRound = callback
        timer.clearTimeout = () => finishRound = () => null
        quiz.questions = [{ text: 'q1', answers: [{ text: 'a1', correct: true }, { text: 'a2' }] }]
        events.publish = function (...args) { this.actualArgs = args }

        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        game.guess(ALICE, 0)
        finishRound()
        game.guess(BOB, 0)
        expect(events.actualArgs[2].scoreboard[0].score).toBeGreaterThan(0)
        expect(events.actualArgs[2].scoreboard[1].score).toBe(0)
    })

    // TODO shouldn't we have a test for increasing the score based on faster response time?
    // TODO add a test for the intermediate results - server should NOT present the player names
})

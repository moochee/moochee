'use strict'

import Games from '../games.js'
import Avatars from '../avatars.js'

// Game
// - player guess
// - finish round
// - finish game
// - player leave
// - timeout

describe('Game', () => {
    let game, quiz, events, avatars, timer
    const ALICE = 'Alice', BOB = 'Bob', JENNY = 'Jenny'

    beforeEach(() => {
        quiz = { title: 'sample quiz', questions: [] }
        events = { publish: function (...args) { this.actualArgs = args } }
        avatars = new Avatars([['x'], ['y']])
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        game = new Games().create(quiz, events, avatars, timer)
    })

    it('sets score, avatar and presents quiz title when player joins a game', () => {
        game.join(ALICE)
        const expectedArgs = ['playerJoined', game.id, quiz.title, ALICE, jasmine.any(String), []]
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

    it('presents first question without correct answer when first round starts', () => {
        quiz.questions = [{ text: 'fun?', answers: [{ text: 'yeah', correct: true }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        const expectedArgs = ['roundStarted', game.id, { text: 'fun?', answers: [{ text: 'yeah' }] }]
        expect(events.actualArgs).toEqual(expectedArgs)
    })

    describe('check if all players guessed', () => {
        it('return false when no one has guessed', () => {
            const players = [{ name: ALICE, guessed: false }]
            expect(game.allPlayersGuessed(players)).toBe(false)
        })

        it('return false when one player has not guessed', () => {
            const players = [{ name: ALICE, guessed: true }, { name: BOB, guessed: false }]
            expect(game.allPlayersGuessed(players)).toBe(false)
        })

        it('return true when all has guessed', () => {
            const players = [{ name: ALICE, guessed: true }, { name: BOB, guessed: true }]
            expect(game.allPlayersGuessed(players)).toBe(true)
        })
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
        expect(result.answers[1].count).toEqual(undefined)
    })
})

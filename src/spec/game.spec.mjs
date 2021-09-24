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
    let game, quiz, events, avatars
    const ALICE = 'Alice', BOB = 'Bob', JENNY = 'Jenny'

    beforeEach(() => {
        quiz = { title: 'sample quiz', questions: [] }
        events = { publish: function (...args) { this.actualArgs = args } }
        avatars = new Avatars([['x'], ['y']])
        game = new Games().create(quiz, events, avatars)
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

    it('presents first question without correct answer when game starts', () => {
        quiz.questions = [{ text: 'fun?', answers: [{ text: 'yeah', correct: true }] }]
        game.join(ALICE)
        game.join(BOB)
        game.nextRound()
        const expectedArgs = ['roundStarted', game.id, { text: 'fun?', answers: [{ text: 'yeah' }] }]
        expect(events.actualArgs).toEqual(expectedArgs)
    })
})

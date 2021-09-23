'use strict'

import Games from '../games.js'
import Avatars from '../avatars.js'

// Game
// - next round
// - player guess
// - finish round
// - finish game
// - player leave

describe('Game', () => {
    let game, quiz, events, avatars
    const ALICE = 'Alice'

    beforeEach(() => {
        quiz = { title: 'sample quiz', questions: [] }
        events = { publish: function (...args) { this.receivedArgs = args } }
        avatars = new Avatars([['x']])
        game = new Games().create(quiz, events, avatars)
    })

    it('sets score, avatar and presents quiz title when player joins a game', () => {
        game.join(ALICE)
        expect(events.receivedArgs).toEqual(['playerJoined', game.id, quiz.title, ALICE, jasmine.any(String), quiz.questions])
    })

    it('sends error when player joins with empty name', () => {
        expect(() => game.join('')).toThrow()
    })

    it('sends error when player name exists', () => {
        game.join(ALICE)
        expect(() => game.join(ALICE)).toThrow()
    })

    it('send error when reaching max. number of players', () => {
        game = new Games().create(quiz, events, new Avatars([]))
        expect(() => game.join(ALICE)).toThrow()
    })
})

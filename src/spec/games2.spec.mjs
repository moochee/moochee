'use strict'

import Games from '../games.js'

// Games
// - create new game
// - find game by game id
// - delete game - needed later

// Game
// - player join
// - next round
// - player guess
// - finish round
// - finish game
// - player leave

describe('Games 2', () => {
    let games

    beforeEach(() => {
        games = new Games()
    })

    it('should create new game', () => {
        const game = games.create()
        expect(game.getId()).toBeDefined()
    })

    it('should create different game each time', () => {
        const game1 = games.create()
        const game2 = games.create()
        expect(game1.getId()).not.toBe(game2.getId())
    })

    it('should find existing game by id', () => {
        const game = games.create()
        expect(games.find(game.getId())).toEqual(game)
    })

    it('should throw when finding non-exist game by id', () => {
        expect(() => games.find(1)).toThrow()
    })
})
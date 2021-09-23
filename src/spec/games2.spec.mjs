'use strict'

import Games from '../games.js'

// Games
// - delete game - needed later

describe('Games 2', () => {
    let games

    beforeEach(() => games = new Games())

    it('should create new game with id', () => {
        const game = games.create()
        expect(game.id).toBeDefined()
    })

    it('should create games with different ids', () => {
        const game1 = games.create()
        const game2 = games.create()
        expect(game1.id).not.toBe(game2.id)
    })

    it('should find existing game by id', () => {
        const game = games.create()
        expect(games.find(game.id)).toEqual(game)
    })

    it('should throw when finding non-exist game by id', () => {
        expect(() => games.find(1)).toThrow()
    })
})
'use strict'

import Games from '../games.js'

describe('Games 2', () => {
    it('should create new game', () => {
        const games = new Games()
        const game = games.create()
        expect(game.getId()).toBeDefined()
    })
})
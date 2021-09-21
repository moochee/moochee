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
    it('should create new game', () => {
        const games = new Games()
        const game = games.create()
        expect(game.getId()).toBeDefined()
    })
})
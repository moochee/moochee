'use strict'

import Games from '../games.js'

describe('Games', () => {
    let games

    beforeEach(() => {
        const quizService = { get: async () => ({ title: 'sample quiz' }) }
        const expiryTimerSpy = { onTimeout: () => null }
        games = new Games(quizService, null, expiryTimerSpy)
    })

    it('returns game with id when hosting a new game', async () => {
        const game = await games.host()
        expect(game.id).toBeDefined()
    })

    it('hosts games with different ids', async () => {
        const game1 = await games.host()
        const game2 = await games.host()
        expect(game1.id).not.toBe(game2.id)
    })

    it('gets existing game by id', async () => {
        const game = await games.host()
        expect(games.get(game.id)).toEqual(game)
    })

    it('throws error when getting non-exist game by id', () => {
        expect(() => games.get(1)).toThrow()
    })
})

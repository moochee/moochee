'use strict'

import Games from '../games.js'

describe('Games', () => {
    let games, events

    beforeEach(() => {
        const quizService = { get: async () => ({ title: 'sample quiz' }) }
        games = new Games(quizService)
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

    it('returns 0 running games initially', () => {
        expect(games.getRunningGames()).toEqual(0)
    })

    it('returns 1 running games when hosting a game', async () => {
        await games.host(null, events)
        expect(games.getRunningGames()).toEqual(1)
    })

    it('will consider a game as expired after two days and delete it', async () => {
        const clock = jasmine.clock()
        clock.install()
        try {
            await games.host()
            clock.tick(1000 * 60 * 60 * 3 - 1)
            expect(games.getRunningGames()).toEqual(1)
            clock.tick(1)
            expect(games.getRunningGames()).toEqual(0)
        } finally {
            clock.uninstall()
        }
    })
})

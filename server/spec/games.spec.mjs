'use strict'

import Games from '../games.js'

describe('Games', () => {
    let games, events, quiz

    beforeEach(() => {
        quiz = { title: 'sample quiz' }
        games = new Games({ get: async () => quiz }, null)
        events = { reply: function (message) { this.actualMessage = message } }
    })

    it('replies gameStarted event and returns game with id when hosting a new game', async () => {
        const game = await games.host(null, null, events)
        expect(events.actualMessage).toEqual({ event: 'gameStarted', args: [game.id, quiz.title] })
        expect(game.id).toBeDefined()
    })

    it('hosts games with different ids', async () => {
        const game1 = await games.host(null, null, events)
        const game2 = await games.host(null, null, events)
        expect(game1.id).not.toBe(game2.id)
    })

    it('finds existing game by id', async () => {
        const game = await games.host(null, null, events)
        expect(games.find(game.id)).toEqual(game)
    })

    it('throws error when finding non-exist game by id', () => {
        expect(() => games.find(1)).toThrow()
    })

    it('returns 0 running game initially', () => {
        expect(games.runningGames()).toEqual({ runningGames: 0 })
    })

    it('returns 1 running game when hosting a game', async () => {
        await games.host(null, null, events)
        expect(games.runningGames()).toEqual({ runningGames: 1 })
    })
})
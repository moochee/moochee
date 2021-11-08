'use strict'

import update from '../leaderboard-updater.js'

describe('Leaderboard Updater', () => {
    let message, send

    beforeEach(() => {
        message = { event: 'gameFinished', args: [{ scoreboard: [] }] }
        send = function (leaderboard) { send.actualLeaderboard = leaderboard; send.called = true }
    })

    it('does not send when round finished', () => {
        message.event = 'roundFinished'
        update(message, send)
        expect(send.called).toBe(undefined)
    })

    it('sends when game finished', () => {
        update(message, send)
        expect(send.called).toBe(true)
    })

    it('sends leaderboard when game finished', () => {
        update(message, send)
        expect(send.actualLeaderboard).toEqual({ scores: [] })
    })

    it('does not send when game finished without status', () => {
        message.args = []
        update(message, send)
        expect(send.called).toEqual(undefined)
    })

    it('does not send when game finished without scoreboard in status', () => {
        message.args = [{}]
        update(message, send)
        expect(send.called).toEqual(undefined)
    })
})

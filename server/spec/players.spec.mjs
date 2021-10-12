'use strict'

import Players from '../players.js'
import Avatars from '../avatars.js'

describe('Players', () => {
    let players
    const ALICE = 'Alice', BOB = 'Bob', JENNY = 'Jenny'

    beforeEach(() => {
        players = new Players(new Avatars([['x'], ['y']]))
    })

    it('add new player', () => {
        const actual = players.add(ALICE)
        const numberOfPlayers = players.getResult().length
        expect(actual).toEqual([jasmine.any(String), []])
        expect(numberOfPlayers).toBe(1)
    })

    it('send error when player joins with empty name', () => {
        expect(() => players.add('')).toThrow()
    })

    it('send error when player name exists', () => {
        players.add(ALICE)
        expect(() => players.add(ALICE)).toThrow()
    })

    it('send error when reaching max. number of players', () => {
        players.add(ALICE)
        players.add(BOB)
        expect(() => players.add(JENNY)).toThrow()
    })

    it('add initial score to player', () => {
        players.add(ALICE)
        players.addScore(ALICE, 10)
        const aliceScore = players.getResult().find(p => p.name === ALICE).score
        expect(aliceScore).toBe(10)
    })

    it('add score twice to player', () => {
        players.add(ALICE)
        players.addScore(ALICE, 10)
        players.addScore(ALICE, 10)
        const aliceScore = players.getResult().find(p => p.name === ALICE).score
        expect(aliceScore).toBe(20)
    })

    it('add score to non-existence player', () => {
        players.addScore(ALICE, 10)
        const alice = players.getResult().find(p => p.name === ALICE)
        expect(alice).toBe(undefined)
    })

    it('return false when no player has guessed', () => {
        players.add(ALICE)
        expect(players.isAllGuessed()).toBe(false)
    })

    it('return false when one of two players has not guessed', () => {
        players.add(ALICE)
        players.add(BOB)
        players.guessed(ALICE)
        expect(players.isAllGuessed()).toBe(false)
    })

    it('return true when both has guessed', () => {
        players.add(ALICE)
        players.add(BOB)
        players.guessed(ALICE)
        players.guessed(BOB)
        expect(players.isAllGuessed()).toBe(true)
    })

    it('guessed by non-existence player', () => {
        players.add(ALICE)
        players.guessed(BOB)
        expect(players.isAllGuessed()).toBe(false)
    })

    it('remove a player', () => {
        players.add(ALICE)
        players.remove(ALICE)
        const numberOfPlayers = players.getResult().length
        expect(numberOfPlayers).toBe(0)
    })

    it('remove a non-existence player', () => {
        players.remove(ALICE)
        const numberOfPlayers = players.getResult().length
        expect(numberOfPlayers).toBe(0)
    })

    it('reset guessed when starting new round', () => {
        players.add(ALICE)
        players.guessed(ALICE)
        players.resetAllGuesses()
        expect(players.isAllGuessed()).toBe(false)
    })
})
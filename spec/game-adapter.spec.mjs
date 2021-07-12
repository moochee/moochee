'use strict'

import DemoAdapter from '../public/demo-adapter.js'

describe('Game Adapter', () => {

    const dummySetTimeout = () => null
    const dummyQuestions = []

    it('returns a new gameId of when hosting a game', () => {
        const adapter = new DemoAdapter(dummySetTimeout, dummyQuestions)
        const gameId1 = adapter.host()
        const gameId2 = adapter.host()

        expect(gameId1).toBeDefined()
        expect(gameId1).not.toEqual(gameId2)
    })

    it('publishes an event when player joins the game, sets score and avatar', (done) => {
        const adapter = new DemoAdapter(dummySetTimeout, dummyQuestions)
        const gameId = adapter.host()
        adapter.subscribe('playerJoined', (gId, player) => {
            expect(gId).toBe(gameId)
            expect(player.name).toBe('alice')
            expect(player.score).toBe(0)
            expect(player.avatar).toBeDefined()
            done()
        })
        adapter.join(gameId, 'alice')
    })

    it('publishes an event when game is started with first question + time to guess', (done) => {
        const questions = [{ text: 'question1', answers: [] }]
        const adapter = new DemoAdapter(dummySetTimeout, questions)
        const gameId = adapter.host()
        adapter.subscribe('roundStarted', (gId, question, timeToGuess) => {
            expect(gId).toBe(gameId)
            expect(question).toEqual({ sequence: 1, text: 'question1', answers: [] })
            expect(timeToGuess).toBeInstanceOf(Number)
            done()
        })
        adapter.start(gameId)
    })

    it('publishes an event when the round is finished with the ranking', (done) => {
        const questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        const immediatelyTriggeringSetTimeout = (finishRound) => finishRound()
        const adapter = new DemoAdapter(immediatelyTriggeringSetTimeout, questions)
        const gameId = adapter.host()
        adapter.subscribe('roundFinished', (gId, ranking) => {
            expect(gId).toBe(gameId)
            expect(ranking).toBeDefined()
            expect(ranking.length).toBe(0) // no players, so the ranking is empty
            done()
        })
        adapter.start(gameId)
    })

    it('publishes an event when the next round is started', (done) => {
        const questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        const immediatelyTriggeringSetTimeout = (finishRound) => finishRound()
        const adapter = new DemoAdapter(immediatelyTriggeringSetTimeout, questions)
        const gameId = adapter.host()
        let callCount = 0
        adapter.subscribe('roundStarted', (gId, question, timeToGuess) => {
            callCount++
            if (callCount == 2) {
                expect(gId).toBe(gameId)
                expect(question).toEqual({ sequence: 2, text: 'question2', answers: [] })
                expect(timeToGuess).toBeInstanceOf(Number)
                done()
            }
        })
        adapter.start(gameId)
        adapter.nextRound(gameId)
    })

    it('publishes an event when no more questions / the game is finished', (done) => {
        const questions = [{ text: '', answers: [] }, { text: '', answers: [] }]
        const immediatelyTriggeringSetTimeout = (finishRound) => finishRound()
        const adapter = new DemoAdapter(immediatelyTriggeringSetTimeout, questions)
        const gameId = adapter.host()
        adapter.subscribe('gameFinished', (gId, ranking) => {
            expect(gId).toBe(gameId)
            expect(ranking).toBeDefined()
            expect(ranking.length).toBe(0) // no players, so the ranking is empty
            done()
        })
        adapter.start(gameId)
        adapter.nextRound(gameId)
    })

    it('ranks players according to their score', (done) => {
        const questions = [{ text: 'a', answers: ['x', 'y'], rightAnswer: 'x' }]
        let finishRound
        const setTimeoutSpy = (finishRoundCallback) => finishRound = finishRoundCallback
        const adapter = new DemoAdapter(setTimeoutSpy, questions)
        const gameId = adapter.host()
        adapter.subscribe('gameFinished', (gId, ranking) => {
            expect(ranking.length).toBe(2)
            expect(ranking[0]).toEqual(jasmine.objectContaining({rank: 1, name:'bob', score: 100}))
            expect(ranking[1]).toEqual(jasmine.objectContaining({rank: 2, name:'alice', score: 0}))
            done()
        })
        adapter.join(gameId, 'alice')
        adapter.join(gameId, 'bob')
        adapter.start(gameId)
        adapter.guess(gameId, 'a', 'bob', 'x')
        adapter.guess(gameId, 'a', 'alice', 'y')
        finishRound()
    })

    it('gives players the same rank if they have the same score', (done) => {
        const questions = [{ text: 'a', answers: ['x', 'y'], rightAnswer: 'x' }]
        let finishRound
        const setTimeoutSpy = (finishRoundCallback) => finishRound = finishRoundCallback
        const adapter = new DemoAdapter(setTimeoutSpy, questions)
        const gameId = adapter.host()
        adapter.subscribe('gameFinished', (gId, ranking) => {
            expect(ranking.length).toBe(2)
            expect(ranking[0]).toEqual(jasmine.objectContaining({rank: 1, name:'alice', score: 100}))
            expect(ranking[1]).toEqual(jasmine.objectContaining({rank: 1, name:'bob', score: 100}))
            done()
        })
        adapter.join(gameId, 'alice')
        adapter.join(gameId, 'bob')
        adapter.start(gameId)
        adapter.guess(gameId, 'a', 'bob', 'x')
        adapter.guess(gameId, 'a', 'alice', 'x')
        finishRound()
    })
})

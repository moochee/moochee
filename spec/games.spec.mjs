'use strict'

import Games from '../games.js'

describe('Games', () => {
    let timer, quizRepo, eventEmitter, games

    beforeEach(() => {
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        quizRepo = { questions: [], getById: function () { return { questions: this.questions } } }
        eventEmitter = { publish: function (...args) { this.receivedArgs = args } }
        games = new Games(timer, quizRepo, eventEmitter)
    })

    it('returns a new gameId when hosting a game', () => {
        const gameId1 = games.host()
        const gameId2 = games.host()

        expect(gameId1).toBeDefined()
        expect(gameId1).not.toEqual(gameId2)
    })

    it('sets score and avatar when player joins a game', async () => {
        const gameId = await games.host()
        games.join(gameId, 'alice', null)
        const expectedPlayer = { name: 'alice', score: 0, avatar: jasmine.any(String), socketId: null }
        expect(eventEmitter.receivedArgs).toEqual(['playerJoined', gameId, expectedPlayer])
    })

    it('is not ok when joining with a player name that is already taken in this game', async () => {
        const gameId = await games.host()
        games.join(gameId, 'alice')
        // TODO 'bob' should be able to join if the name is only taken in another game
        try {
            games.join(gameId, 'alice')
            fail('expected error to be thrown')
        } catch (error) {
            expect(error.message).toMatch(/alice.*exists/u)
        }
    })

    it('presents the question and seconds to guess when a new round starts', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }]
        timer.secondsToGuess = 10
        const gameId = await games.host()
        games.nextRound(gameId)
        const expectedQuestion = { id: jasmine.any(Number), text: jasmine.any(String), answers: [] }
        expect(eventEmitter.receivedArgs).toEqual(['roundStarted', gameId, expectedQuestion, 10])
    })

    it('presents the ranking when the round is finished', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        timer.setTimeout = (callback) => callback() //instantly invoking the callback will make the round immediately finish
        const gameId = await games.host()
        games.nextRound(gameId)
        expect(eventEmitter.receivedArgs).toEqual(['roundFinished', gameId, []]) // no players, so the ranking is empty
    })
    /*

it('publishes an event when the next round is started', (done) => {
   const questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
   const immediatelyTriggeringSetTimeout = (finishRound) => finishRound()
   const games = new Games(immediatelyTriggeringSetTimeout, questions)
   const gameId = games.host()
   let callCount = 0
   games.subscribe('roundStarted', (gId, question, timeToGuess) => {
       callCount++
       if (callCount == 2) {
           expect(gId).toBe(gameId)
           expect(question).toEqual({ sequence: 2, text: 'question2', answers: [] })
           expect(timeToGuess).toBeInstanceOf(Number)
           done()
       }
   })
   games.start(gameId)
   games.nextRound(gameId)
})
 
it('publishes an event when no more questions / the game is finished', (done) => {
   const questions = [{ text: '', answers: [] }, { text: '', answers: [] }]
   const immediatelyTriggeringSetTimeout = (finishRound) => finishRound()
   const games = new Games(immediatelyTriggeringSetTimeout, questions)
   const gameId = games.host()
   games.subscribe('gameFinished', (gId, ranking) => {
       expect(gId).toBe(gameId)
       expect(ranking).toBeDefined()
       expect(ranking.length).toBe(0) // no players, so the ranking is empty
       done()
   })
   games.start(gameId)
   games.nextRound(gameId)
})
 
it('orders players according to their score in the ranking', (done) => {
   const questions = [{ text: 'a', answers: ['x', 'y'], rightAnswer: 'x' }]
   let finishRound
   const setTimeoutSpy = (finishRoundCallback) => finishRound = finishRoundCallback
   const games = new Games(setTimeoutSpy, questions)
   const gameId = games.host()
   games.subscribe('gameFinished', (gId, ranking) => {
       expect(ranking.length).toBe(2)
       expect(ranking[0]).toEqual(jasmine.objectContaining({ name: 'bob', score: 100 }))
       expect(ranking[1]).toEqual(jasmine.objectContaining({ name: 'alice', score: 0 }))
       done()
   })
   games.join(gameId, 'alice')
   games.join(gameId, 'bob')
   games.start(gameId)
   games.guess(gameId, 'a', 'bob', 'x')
   games.guess(gameId, 'a', 'alice', 'y')
   finishRound()
}) */

    // fit('has the PPO quiz when using the real quiz repo', async () => {
    //     const questions = [{ text: 'question1', answers: [] }]
    //     const dummyQuizRepo1 = { getById: async () => { return { questions } } }
    //     const dummyTimer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: 10 }
    //     const games = new Games(dummyTimer, dummyQuizRepo1, eventEmitter)
    //     const gameId = await games.host()
    //     games.nextRound(gameId)
    //     const expectedQuestion = { id: jasmine.any(Number), text: jasmine.any(String), answers: [] }
    //     expect(eventEmitter.receivedArgs).toEqual(['roundStarted', gameId, expectedQuestion, 10])
    // })
})

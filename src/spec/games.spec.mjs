'use strict'

import Games from '../games.js'

describe('Games', () => {
    let timer, quizRepo, eventEmitter, games

    beforeEach(() => {
        timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
        quizRepo = { questions: [], getById: function () { return { text: 'sample quiz', questions: this.questions } } }
        eventEmitter = { publish: function (...args) { this.receivedArgs = args } }
        games = new Games(timer, quizRepo, eventEmitter)
    })

    it('returns a new gameId when hosting a game', () => {
        const gameId1 = games.host()
        const gameId2 = games.host()

        expect(gameId1).toBeDefined()
        expect(gameId1).not.toEqual(gameId2)
    })

    it('sets score and avatar and presents quiz title when player joins a game', async () => {
        const gameId = await games.host()
        const joinResponse = games.join(gameId, 'alice', null)
        expect(eventEmitter.receivedArgs).toEqual(['playerJoined', gameId, jasmine.any(String)])
        expect(joinResponse).toEqual({ quizTitle: 'sample quiz', avatar: jasmine.any(String), score: 0, otherPlayers: [] })
    })

    it('is not possible to join with a player name that is already taken in this game', async () => {
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

    it('is an error if the game does not exist', async () => {
        expect(() => games.join(42, 'alice')).toThrowError(/not exist/)
    })

    it('presents the first question and seconds to guess when a new round starts', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }]
        timer.secondsToGuess = 10
        const gameId = await games.host()
        games.nextRound(gameId)
        const expectedQuestion = { id: 1, text: 'question1', answers: [] }
        expect(eventEmitter.receivedArgs).toEqual(['roundStarted', gameId, expectedQuestion, 10])
    })

    it('presents the ranking when a round is finished', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        timer.setTimeout = (callback) => callback() //instantly invoke callback -> finish round right after start
        const gameId = await games.host()
        games.nextRound(gameId)
        expect(eventEmitter.receivedArgs).toEqual(['roundFinished', gameId, []]) // no players, so the ranking is empty
    })

    it('presents the second question when the next round is started', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        timer.secondsToGuess = 10
        const gameId = await games.host()
        games.nextRound(gameId)
        games.nextRound(gameId)
        const expectedQuestion = { id: 2, text: 'question2', answers: [] }
        expect(eventEmitter.receivedArgs).toEqual(['roundStarted', gameId, expectedQuestion, 10])
    })

    it('finishes the game when there are no more questions', async () => {
        quizRepo.questions = [{ text: 'question1', answers: [] }]
        timer.setTimeout = (callback) => callback() //instantly invoke callback -> finish round right after start
        const gameId = await games.host()
        games.nextRound(gameId)
        expect(eventEmitter.receivedArgs).toEqual(['gameFinished', gameId, []]) // no players, so the ranking is empty
    })

    it('assigns some points to a player who guessed the right answer', async () => {
        quizRepo.questions = [{ text: 'question1', answers: ['x', 'y'], rightAnswerId: 0 }]
        let finishRound
        timer.setTimeout = (callback) => finishRound = callback
        const gameId = await games.host()
        games.join(gameId, 'alice')
        games.join(gameId, 'bob')
        games.nextRound(gameId)
        const questionId = 1
        games.guess(gameId, questionId, 'alice', 0)
        games.guess(gameId, questionId, 'bob', 1)
        finishRound()
        const expectedRanking = [
            // REVISE once we got the socketId out of the games, we don't need jasmine.objectContaining any longer
            jasmine.objectContaining({ name: 'alice', avatar: jasmine.any(String), score: jasmine.any(Number) }),
            jasmine.objectContaining({ name: 'bob', avatar: jasmine.any(String), score: 0 })
        ]
        expect(eventEmitter.receivedArgs).toEqual(['gameFinished', gameId, expectedRanking])
    })

    it('should fire finishRound only once if the last player answers after the timeout', async () => {
        let finishRound
        timer.setTimeout = (callback) => finishRound = callback
        quizRepo.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
        eventEmitter.finishRoundCalled = 0
        eventEmitter.publish = function (...args) { if (args[0] === 'roundFinished') this.finishRoundCalled += 1 }

        const gameId = await games.host()
        games.join(gameId, 'alice')
        games.join(gameId, 'bob')
        games.nextRound(gameId)
        games.guess(gameId, 1, 'alice', 0)
        finishRound()
        games.guess(gameId, 1, 'bob', 1)
        expect(eventEmitter.finishRoundCalled).toEqual(1)
    })

    // TODO shouldn't we have a test for increasing the score based on faster response time?

    // TODO add a test for the intermediate results - server should NOT present the player names
})

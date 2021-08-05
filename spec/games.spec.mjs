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

    it('assigns 100 points to a player who guessed the right answer', async () => {
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
            jasmine.objectContaining({ name: 'alice', avatar: jasmine.any(String), score: 100 }),
            jasmine.objectContaining({ name: 'bob', avatar: jasmine.any(String), score: 0 })
        ]
        expect(eventEmitter.receivedArgs).toEqual(['gameFinished', gameId, expectedRanking])
    })
})

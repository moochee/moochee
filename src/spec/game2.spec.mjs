// 'use strict'

// import Games from '../games.js'

// describe('Games', () => {
//     let timer, quizService, events, games

//     beforeEach(() => {
//         timer = { setTimeout: () => null, clearTimeout: () => null, secondsToGuess: null }
//         quizService = { questions: [], getById: function () { return { title: 'sample quiz', questions: this.questions } } }
//         events = { publish: function (...args) { this.receivedArgs = args } }
//         games = new Games(quizService)
//     })

//     it('cannot be joined if the game id does not exist', async () => {
//         expect(() => games.join(42, 'alice')).toThrowError(/not exist/)
//     })

//     it('presents the answer distribution when a round is finished', async () => {
//         const q1 = { text: 'q1', answers: [{ 'id': 'A', 'text': 'a' }, { 'id': 'B', 'text': 'b' }], rightAnswerId: 'A' }
//         const q2 = { text: 'q1', answers: [] }
//         quizService.questions = [q1, q2]
//         const gameId = await host()
//         games.join(gameId, 'alice')
//         games.join(gameId, 'bob')
//         games.nextRound(gameId)
//         const questionId = 1
//         games.guess(gameId, questionId, 'alice', 'A')
//         games.guess(gameId, questionId, 'bob', 'A')
//         expect(events.receivedArgs).toEqual(['roundFinished', gameId, jasmine.any(Object)])
//         const result = events.receivedArgs[2].result
//         expect(result.answers.find(a => a.id === 'A').count).toEqual(2)
//         expect(result.answers.find(a => a.id === 'B').count).toEqual(0)
//     })

//     it('presents the scoreboard when a round is finished', async () => {
//         quizService.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
//         timer.setTimeout = (finishRound) => finishRound() //instantly finish round right after start
//         const gameId = await host()
//         games.nextRound(gameId)
//         expect(events.receivedArgs).toEqual(['roundFinished', gameId, jasmine.objectContaining({ scoreboard: [] })]) // no players, so the scoreboard is empty
//     })

//     it('presents the second question when the next round is started', async () => {
//         quizService.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
//         timer.secondsToGuess = 10
//         const gameId = await host()
//         games.nextRound(gameId)
//         games.nextRound(gameId)
//         const expectedQuestion = { id: 2, text: 'question2', answers: [], totalQuestions: 2 }
//         expect(events.receivedArgs).toEqual(['roundStarted', gameId, expectedQuestion, 10])
//     })

//     it('is finished when there are no more questions', async () => {
//         quizService.questions = [{ text: 'question1', answers: [] }]
//         timer.setTimeout = (finishRound) => finishRound() //instantly finish round right after start
//         const gameId = await host()
//         games.nextRound(gameId)
//         expect(events.receivedArgs).toEqual(['gameFinished', gameId, jasmine.any(Object)])
//     })

//     it('assigns points if player guessed the right answer', async () => {
//         quizService.questions = [
//             { text: 'q1', answers: [{ 'id': 'A', 'text': 'a' }, { 'id': 'B', 'text': 'b' }], rightAnswerId: 'A' }
//         ]
//         let finishRound
//         timer.setTimeout = (callback) => finishRound = callback
//         const gameId = await host()
//         games.join(gameId, 'alice')
//         games.join(gameId, 'bob')
//         games.nextRound(gameId)
//         const questionId = 1
//         games.guess(gameId, questionId, 'alice', 'A')
//         games.guess(gameId, questionId, 'bob', 'B')
//         finishRound()

//         expect(events.receivedArgs[2].scoreboard[0].score).toBeGreaterThan(0)
//         expect(events.receivedArgs[2].scoreboard[1].score).toBe(0)
//     })

//     it('should fire finishRound only once if all players guessed before timeout', async () => {
//         let finishRound
//         timer.setTimeout = (callback) => finishRound = callback
//         timer.clearTimeout = () => finishRound = () => null
//         quizService.questions = [{ text: 'question1', answers: [] }, { text: 'question2', answers: [] }]
//         events.publish = function (...args) {
//             if (args[0] === 'roundFinished') this.finishRoundCalled = this.finishRoundCalled || 0 + 1
//         }

//         const gameId = await host()
//         games.join(gameId, 'alice')
//         games.join(gameId, 'bob')
//         games.nextRound(gameId)
//         games.guess(gameId, 1, 'alice', 0)
//         games.guess(gameId, 1, 'bob', 1)
//         finishRound()
//         expect(events.finishRoundCalled).toEqual(1)
//     })

//     it('should fire finishRound only once if the last player answered after timeout', async () => {
//         let finishRound, finishRoundCalled = 0
//         timer.setTimeout = (callback) => finishRound = callback
//         timer.clearTimeout = () => finishRound = () => null
//         quizService.questions = [{ text: 'question1', answers: ['x', 'y'], rightAnswerId: 0 }, { text: 'question2', answers: [] }]
//         events.publish = function (...args) {
//             if (args[0] === 'roundFinished') finishRoundCalled++
//         }

//         const gameId = await host()
//         games.join(gameId, 'alice')
//         games.join(gameId, 'bob')
//         games.nextRound(gameId)
//         games.guess(gameId, 1, 'alice', 0)
//         finishRound()
//         games.guess(gameId, 1, 'bob', 0)
//         expect(finishRoundCalled).toEqual(1)
//     })

//     it('should get zero score if the last player answered correctly after timeout', async () => {
//         let finishRound
//         timer.setTimeout = (callback) => finishRound = callback
//         timer.clearTimeout = () => finishRound = () => null
//         quizService.questions = [
//             { text: 'q1', answers: [{ 'id': 'A', 'text': 'a' }, { 'id': 'B', 'text': 'b' }], rightAnswerId: 'A' }
//         ]
//         events.publish = function (...args) { this.receivedArgs = args }

//         const gameId = await host()
//         games.join(gameId, 'alice')
//         games.join(gameId, 'bob')
//         games.nextRound(gameId)
//         games.guess(gameId, 1, 'alice', 'A')
//         finishRound()
//         games.guess(gameId, 1, 'bob', 'A')
//         expect(events.receivedArgs[2].scoreboard[0].score).toBeGreaterThan(0)
//         expect(events.receivedArgs[2].scoreboard[1].score).toBe(0)
//     })

//     const host = async () => {
//         return (await games.host()).gameId
//     }

//     // TODO shouldn't we have a test for increasing the score based on faster response time?

//     // TODO add a test for the intermediate results - server should NOT present the player names
// })

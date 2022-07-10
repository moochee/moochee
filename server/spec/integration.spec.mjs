'use strict'

import { createServer } from 'http'
import WebSocket from 'ws'
import quizSocketServer from '../quiz-socket-server.js'
import QuizSocketClient from '../../web/public/quiz-socket-client.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './quiz/dummy-quiz.js'

describe('Integration', () => {
    let server, port, hostClient, playerClient, games, quizService, quizId
    const ALICE = 'Alice', dummyAuthor = 'test@example.com'

    beforeEach(async () => {
        const httpServer = createServer()
        quizService = new QuizService('quizzes')
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
        const noExpiryTimer = { onTimeout: () => null }
        const dummyHistoryService = { create: () => null } 
        server = quizSocketServer(httpServer, quizService, noExpiryTimer, dummyHistoryService)
        games = server.games
        port = await new Promise((resolve) => {
            httpServer.listen(() => resolve(httpServer.address().port))
        })
        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))
        playerClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))
    })

    afterEach(async () => {
        await quizService.delete(quizId)
        server.close()
    })

    it('should be possible to join a public game', async () => {
        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('gameStarted', resolve)
        })
        await new Promise(resolve => {
            playerClient.join(gameId, ALICE)
            playerClient.subscribe('joiningOk', resolve)
        })
        await new Promise(resolve => {
            hostClient.nextRound(gameId)
            playerClient.subscribe('roundStarted', resolve)
        })
        await new Promise(resolve => {
            playerClient.guess(gameId, ALICE, 1)
            playerClient.subscribe('roundFinished', resolve)
        })
        await new Promise(resolve => {
            hostClient.nextRound(gameId)
            playerClient.guess(gameId, ALICE, 0)
            playerClient.subscribe('gameFinished', resolve)
        })
        await new Promise(resolve => {
            playerClient.disconnect()
            hostClient.subscribe('playerDisconnected', resolve)
        })
    })

    it('should be possible to join as host for a game that was already created', async () => {
        const game = await games.host(quizId)

        await new Promise((resolve) => {
            hostClient.joinAsHost(game.id)
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(game.id, ALICE)
            hostClient.subscribe('playerJoined', resolve)
        })
    })

    // REVISE add integration test that verifies properties contain values, and ideally even that the UI binds to it correctly
    //      Rationale: when I renamed the quiz.text to quiz.title, I noticed that there were a lot of places to be adjusted, all the way up to the UI, and none of these was caught by a test
})

'use strict'

import { createServer } from 'http'
import WebSocket from 'ws'
import quizSocketServer from '../quiz-socket-server.js'
import QuizSocketClient from '../../web/public/quiz-socket-client.js'
import QuizService from '../quiz-service.js'
import Games from '../games.js'

describe('Integration', () => {
    let server, port, hostClient, playerClient
    const ALICE = 'Alice'

    beforeEach(async () => {
        const httpServer = createServer()
        const quizService = new QuizService()
        const games = new Games(quizService, setTimeout)
        server = quizSocketServer(httpServer, games)
        port = await new Promise((resolve) => {
            httpServer.listen(() => resolve(httpServer.address().port))
        })
        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))
        playerClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))
    })

    afterEach(() => {
        server.close()
    })

    it('should be possible to join a public game', async () => {
        const gameId = await new Promise(resolve => {
            hostClient.host('cc-dist-logging.json')
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
            playerClient.guess(gameId, ALICE, 2)
            playerClient.subscribe('gameFinished', resolve)
        })
        await new Promise(resolve => {
            playerClient.disconnect()
            hostClient.subscribe('playerDisconnected', resolve)
        })
    })

    // TODO add integration test that verifies properties contain values, and ideally even that the UI binds to it correctly
    //      Rationale: when I renamed the quiz.text to quiz.title, I noticed that there were a lot of places to be adjusted, all the way up to the UI, and none of these was caught by a test
})

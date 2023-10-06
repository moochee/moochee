import httpServer from '../http-server.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'
import HistoryService from '../history-service.js'
import WebSocket from 'ws'
import HostClient from '../../web/host/host-client.js'
import PlayerClient from '../../web/play/player-client.js'
import fetch from 'node-fetch'

const noAuthMiddleware = (req, res, next) => next()
const noAuth = { setup: () => noAuthMiddleware }
const noExpiryTimer = { onTimeout: () => null }

describe('API integration', () => {
    let server, hostClient, playerClient, quizService, quizId, historyService
    const port = 3000, origin = `http://localhost:${port}`, dummyAuthor = 'test@example.com'

    beforeEach(async () => {
        quizService = new QuizService('quizzes')
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
        historyService = new HistoryService('history')
        globalThis.fetch = fetch
        globalThis.window = { location: { origin } }
        server = httpServer(noAuth, quizService, origin, noExpiryTimer, historyService).listen(port)
        hostClient = new HostClient(() => new WebSocket(`ws://localhost:${port}`), origin)
        playerClient = new PlayerClient(() => new WebSocket(`ws://localhost:${port}`))

    })

    afterEach(async () => {
        await quizService.delete(quizId)
        delete globalThis.fetch
        delete globalThis.window
        server.close()
    })

    it('should be possible to join a public game', async () => {
        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })
        await new Promise(resolve => {
            playerClient.join(gameId, 'Alice')
            playerClient.subscribe('joiningOk', resolve)
        })
        await new Promise(resolve => {
            hostClient.nextRound(gameId)
            playerClient.subscribe('roundStarted', resolve)
        })
        await new Promise(resolve => {
            playerClient.guess(gameId, 'Alice', 0)
            playerClient.subscribe('roundFinished', resolve)
        })
        await new Promise(resolve => {
            hostClient.nextRound(gameId)
            playerClient.guess(gameId, 'Alice', 1)
            playerClient.subscribe('gameFinished', resolve)
        })
    })

    it('should be possible to join as host for a game that was already created', async () => {
        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })
        await new Promise((resolve) => {
            playerClient.join(gameId, 'Alice')
            hostClient.subscribe('playerJoined', resolve)
        })
    })

    it('can re-connect the host and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        hostClient = new HostClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, origin, instantSetTimeout)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })

        currentWSClient.close()

        await new Promise(resolve => {
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, 'Alice')
            hostClient.subscribe('playerJoined', resolve)
        })
    })

    it('can re-connect the player and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        playerClient = new PlayerClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, instantSetTimeout)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, 'Alice')
            hostClient.subscribe('playerJoined', resolve)
        })

        currentWSClient.close()

        await new Promise(resolve => {
            playerClient.subscribe('reJoiningOk', resolve)
        })

        await new Promise((resolve) => {
            playerClient.subscribe('roundStarted', resolve)
            hostClient.nextRound(gameId)
        })
    })

    it('will fail if trying to re-connect with invalid information', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        playerClient = new PlayerClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, instantSetTimeout)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, 'Alice')
            hostClient.subscribe('playerJoined', resolve)
        })

        currentWSClient.send(JSON.stringify({ command: 'reJoin', args: [gameId, 'Alice', '🤡'] }))

        await new Promise(resolve => {
            playerClient.subscribe('reJoiningFailed', resolve)
        })
    })
})

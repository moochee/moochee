import WebSocket from 'ws'
import httpServer from '../http-server.js'
import QuizSocketClient from '../../web/public/quiz-socket-client.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'
import dummyAuth from './dummy/auth.js'
import fetch from 'node-fetch'

describe('Integration', () => {
    let server, port = 3010, hostClient, playerClient, quizService, quizId
    const ALICE = 'Alice', dummyAuthor = 'test@example.com'

    beforeEach(async () => {
        quizService = new QuizService('quizzes')
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
        const noExpiryTimer = { onTimeout: () => null }
        const dummyHistoryService = { create: () => null }
        const url = `http://localhost:${port}`
        server = httpServer(null, dummyAuth, quizService, url, noExpiryTimer, dummyHistoryService)
        await new Promise((resolve) => server.listen(port, () => resolve()))
        const createGame = async (quizId) => {
            const response = await fetch(`${url}/api/v1/games`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ quizId })
            })
            const targetUrl = new URL(response.headers.get('location'))
            const gameId = targetUrl.pathname.substring(1)
            return gameId
        }
        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`), createGame)
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
    })

    xit('can re-connect the host and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        hostClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, instantSetTimeout)

        const gameId = await new Promise(resolve => {
            hostClient.host('cc-dist-logging.json')
            hostClient.subscribe('gameCreated', resolve)
        })

        await new Promise(resolve => {
            hostClient.joinAsHost(gameId)
            hostClient.subscribe('hostJoined', resolve)
        })

        currentWSClient.close()

        await new Promise(resolve => {
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, ALICE)
            hostClient.subscribe('playerJoined', resolve)
        })
    })

    xit('can re-connect the player and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        playerClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, instantSetTimeout, true)

        const gameId = await new Promise(resolve => {
            hostClient.host('cc-dist-logging.json')
            hostClient.subscribe('gameCreated', resolve)
        })

        await new Promise(resolve => {
            hostClient.joinAsHost(gameId)
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, ALICE)
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

    xit('will fail if trying to re-connect with invalid information', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        playerClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, instantSetTimeout, true)

        const gameId = await new Promise(resolve => {
            hostClient.host('cc-dist-logging.json')
            hostClient.subscribe('gameCreated', resolve)
        })

        await new Promise(resolve => {
            hostClient.joinAsHost(gameId)
            hostClient.subscribe('hostJoined', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, ALICE)
            hostClient.subscribe('playerJoined', resolve)
        })

        currentWSClient.send(JSON.stringify({ command: 'reJoin', args: [gameId, ALICE, '🤡'] }))

        await new Promise(resolve => {
            playerClient.subscribe('reJoiningFailed', resolve)
        })

        // TODO write one more test for negative case
    })
})

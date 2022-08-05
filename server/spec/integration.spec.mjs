import WebSocket from 'ws'
import httpServer from '../http-server.js'
import QuizSocketClient from '../../web/public/quiz-socket-client.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'
import dummyAuth from './dummy/auth.js'
import fetch from 'node-fetch'

describe('Integration', () => {
    let server, port = 3010, hostClient, playerClient, quizService, quizId, createGame
    const ALICE = 'Alice', dummyAuthor = 'test@example.com'

    beforeEach(async () => {
        quizService = new QuizService('quizzes')
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
        const noExpiryTimer = { onTimeout: () => null }
        const dummyHistoryService = { create: () => null }
        const url = `http://localhost:${port}`
        server = httpServer(null, dummyAuth, quizService, url, noExpiryTimer, dummyHistoryService)
        await new Promise((resolve) => server.listen(port, () => resolve()))
        createGame = async (quizId) => {
            const response = await fetch(`${url}/api/v1/games`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ quizId })
            })
            const targetUrl = new URL(response.headers.get('location'))
            const gameId = targetUrl.pathname.substring(1)
            return gameId
        }
    })

    afterEach(async () => {
        await quizService.delete(quizId)
        server.close()
    })

    it('should be possible to join a public game', async () => {
        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`), createGame)
        playerClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('gameStarted', resolve)
        })
        await new Promise(resolve => {
            playerClient.join(gameId, ALICE)
            playerClient.subscribe('playerJoined', resolve)
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

    it('can re-connect the host and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        hostClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, createGame, instantSetTimeout)
        playerClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`), 
            () => null, instantSetTimeout, true)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('gameStarted', resolve)
        })

        currentWSClient.close()

        await new Promise((resolve) => {
            hostClient.subscribe('gameStarted', resolve)
        })

        await new Promise((resolve) => {
            playerClient.join(gameId, ALICE)
            hostClient.subscribe('playerJoined', resolve)
        })
    })

    it('can re-connect the player and will receive events after the reconnection', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`), createGame)
        playerClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, () => null, instantSetTimeout, true)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('gameStarted', resolve)
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

    it('will fail if trying to re-connect with invalid information', async () => {
        const instantSetTimeout = (cb) => cb()
        let currentWSClient

        hostClient = new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`), createGame)
        playerClient = new QuizSocketClient(() => {
            currentWSClient = new WebSocket(`ws://localhost:${port}`)
            return currentWSClient
        }, () => null, instantSetTimeout, true)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('gameStarted', resolve)
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

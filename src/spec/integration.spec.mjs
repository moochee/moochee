'use strict'

import { createServer } from 'http'
import WebSocket from 'ws'
import quizSocketServer from '../quiz-socket-server.js'
import QuizSocketClient from '../../public/quiz-socket-client.js'

fdescribe('Integration', () => {
    let server, port, hostClient, aliceClient, bobClient

    const createClient = () => new QuizSocketClient(() => new WebSocket(`ws://localhost:${port}`))

    const send = (client, event, ...args) => new Promise((resolve) => {
        client.emit(event, ...args, resolve)
    })

    beforeEach(async () => {
        const httpServer = createServer()
        server = quizSocketServer()
        server.attach(httpServer)
        port = await new Promise((resolve) => {
            httpServer.listen(() => resolve(httpServer.address().port))
        })
        hostClient = createClient()
        aliceClient = createClient()
        bobClient = createClient()
    })

    afterEach(() => {
        hostClient.close()
        aliceClient.close()
        bobClient.close()
        server.close()
    })

    it('displays quizzes with title and id', async () => {
        const quizClient = new QuizSocketClient(hostClient)
        const quizzes = await quizClient.getQuizzes()
        expect(quizzes.length).toBeGreaterThan(0)
        expect(quizzes[0].title).toEqual(jasmine.any(String))
        expect(quizzes[0].title).not.toEqual('')
    })

    it('should be possible to join a game', async () => {
        const quizzes = await send(hostClient, 'getQuizzes')
        expect(quizzes.length).toBeGreaterThan(0)

        const gameId = await send(hostClient, 'host', quizzes[0].id)
        expect(gameId).toEqual(jasmine.any(String))

        const alicePlayer = await send(aliceClient, 'join', gameId, 'alice')
        expect(alicePlayer.avatar).toEqual(jasmine.any(String))

        const bobPlayer = await send(bobClient, 'join', gameId, 'bob')
        expect(bobPlayer.avatar).toEqual(jasmine.any(String))
    })

    // TODO add integration test that verifies properties contain values, and ideally even that the UI binds to it correctly
    //      Rationale: when I renamed the quiz.text to quiz.title, I noticed that there were a lot of places to be adjusted, all the way up to the UI, and none of these was caught by a test
})

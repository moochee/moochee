'use strict'

import { createServer } from 'http'
import { io as Client } from 'socket.io-client'
import quizSocketServer from '../quiz-socket-server.js'

describe('Integration', () => {
    let server, port

    beforeEach(async () => {
        const httpServer = createServer()
        server = quizSocketServer()
        server.attach(httpServer)
        port = await new Promise((resolve) => {
            httpServer.listen(() => resolve(httpServer.address().port))
        })
    })

    afterEach(() => server.close())

    describe('with host client', () => {
        let hostClient

        const connect = () => new Promise((resolve) => {
            const client = new Client(`http://localhost:${port}`)
            client.on('connect', () => resolve(client))
        })
        const send = (client, event, ...args) => new Promise((resolve) => {
            client.emit(event, ...args, resolve)
        })

        beforeEach(async () => hostClient = await connect())

        afterEach(() => hostClient.close())

        it('should have some quizzes', async () => {
            const quizzes = await send(hostClient, 'getQuizzes')
            expect(quizzes.length).toBeGreaterThan(0)
        })

        it('should be possible to host a quiz', async () => {
            const quizzes = await send(hostClient, 'getQuizzes')
            const gameId = await send(hostClient, 'host', quizzes[0].id)
            expect(gameId).toEqual(jasmine.any(String))
        })

        describe('with 2 player clients', () => {
            let aliceClient, bobClient

            beforeEach(async () => [aliceClient, bobClient] = [await connect(), await connect()])

            afterEach(() => [aliceClient.close(), bobClient.close()])

            it('should be possible to join a quiz', async () => {
                const quizzes = await send(hostClient, 'getQuizzes')
                const gameId = await send(hostClient, 'host', quizzes[0].id)
                const alicePlayer = await send(aliceClient, 'join', gameId, 'alice')
                expect(alicePlayer.avatar).toEqual(jasmine.any(String))
                const bobPlayer = await send(bobClient, 'join', gameId, 'bob')
                expect(bobPlayer.avatar).toEqual(jasmine.any(String))
            })
        })
    })
})

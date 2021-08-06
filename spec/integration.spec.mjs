'use strict'

import { createServer } from 'http'
import { io as Client } from 'socket.io-client'
import quizSocketServer from '../quiz-socket-server.js'

describe('Integration', () => {
    let server, port, hostClient, aliceClient, bobClient

    const connect = () => new Promise((resolve) => {
        const client = new Client(`http://localhost:${port}`)
        client.on('connect', () => resolve(client))
    })

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
        hostClient = await connect()
        aliceClient = await connect()
        bobClient = await connect()
    })

    afterEach(() => {
        hostClient.close()
        aliceClient.close()
        bobClient.close()
        server.close()
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
})

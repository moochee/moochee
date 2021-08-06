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

        const getQuizzes = () => new Promise((resolve) => hostClient.emit('getQuizzes', resolve))
        const host = (quizId) => new Promise((resolve) => hostClient.emit('host', quizId, resolve))

        beforeEach((done) => {
            hostClient = new Client(`http://localhost:${port}`).on('connect', done)
        })

        afterEach(() => hostClient.close())

        it('should have some quizzes', async () => {
            const quizzes = await getQuizzes()
            expect(quizzes.length).toBeGreaterThan(0)
        })

        it('should be possible to host a quiz', async () => {
            const quizzes = await getQuizzes()
            const gameId = await host(quizzes[0].id)
            expect(gameId).toEqual(jasmine.any(String))
        })
    })
})

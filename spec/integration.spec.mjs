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

    describe('basic scenarios with one client', () => {
        let client

        beforeEach((done) => {
            client = new Client(`http://localhost:${port}`).on('connect', done)
        })

        afterEach(() => client.close())

        it('should return the quizzes', (done) => {
            client.emit('getQuizzes', (quizzes) => {
                expect(quizzes.length).toBeGreaterThan(0)
                done()
            })
        })
    })
})

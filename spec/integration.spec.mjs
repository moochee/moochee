'use strict'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as Client } from 'socket.io-client'
// import quizSocketServer from '../quiz-socket-server.js'

describe('Integration', () => {
    let io, serverSocket, clientSocket

    beforeEach((done) => {
        const httpServer = createServer()
        io = new Server(httpServer)
        httpServer.listen(() => {
            const port = httpServer.address().port
            clientSocket = new Client(`http://localhost:${port}`)
            io.on('connection', (socket) => serverSocket = socket)
            clientSocket.on('connect', done)
        })
    })

    afterEach(() => {
        io.close()
        clientSocket.close()
    })

    it('should work', (done) => {
        clientSocket.on('hello', (arg) => {
            expect(arg).toBe('world')
            done()
        })
        serverSocket.emit('hello', 'world')
    })
})

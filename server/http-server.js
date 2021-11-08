'use strict'

import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'

export default function create(auth, directory) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.send('ok')
    })

    app.post('/api/v1/stop', (req, res) => {
        // TODO shut down only when all games finished
        // TODO check if this doesn't cause trouble on CF, e.g. CF should not try to re-start on exit code 0
        console.log('received shutdown signal')
        res.status(202).end()
        httpServer.close()
    })

    const login = auth.setup(app)
    const httpServer = http.createServer(app)
    const socketServer = quizSocketServer(httpServer, directory)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))

    app.get('/api/v1/runningGames', (_, res) => {
        res.set('Content-Type', 'text/plain')
            .status(200)
            .send(String(socketServer.games.getRunningGames()))
    })

    app.use(express.json())
    app.use('/api/v1/quizzes', quizRouter(directory))

    app.use('/', login)
    // app.post('/api/v1/games', login, (req, res) => {
    // })
    app.use('/', express.static('web/host'))

    return httpServer
}

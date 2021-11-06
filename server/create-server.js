'use strict'

import http from 'http'
import express from 'express'
import auth from './auth.js'
import quizSocketServer from './quiz-socket-server.js'
import QuizRouter from './quiz-router.js'

export default function createServer(config, directory) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.send('ok')
    })

    app.post('/api/v1/stop', (req, res) => {
        // TODO shut down only when all games finished
        // TODO check if this doesn't cause trouble on CF, e.g. CF should not try to re-start on exit code 0
        console.log('received shutdown signal')
        res.status(202).end()
        httpServer.close((error) => {
            if (error) {
                console.error(error)
                process.exit(1)
            } else {
                console.log('bye')
                process.exit(0)
            }
        })
    })

    const login = auth(app, config)
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
    app.use('/api/v1/quizzes', new QuizRouter(directory))

    app.use('/', login)
    app.use('/', express.static('web/host'))

    return httpServer
}
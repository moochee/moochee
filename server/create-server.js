'use strict'

import http from 'http'
import express from 'express'
import auth from './auth.js'
import quizSocketServer from './quiz-socket-server.js'

export default function createServer(config) {
    const app = express()
    const login = auth(app, config)
    const httpServer = http.createServer(app)
    const socketServer = quizSocketServer(httpServer)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))

    app.use(express.json())
    app.get('/api/v1/runningGames', (_, res) => {
        res.status(200).send(socketServer.games.runningGames())
    })

    app.use('/', login)
    app.use('/', express.static('web/host'))

    return httpServer
}
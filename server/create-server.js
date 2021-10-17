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

    app.get('/api/v1/runningGames', (_, res) => {
        res.set('Content-Type', 'text/plain')
            .status(200)
            .send(String(socketServer.games.getRunningGames()))
    })
    app.get('/favicon.ico', (_, res) => res.status(204).end())

    app.use('/', login)
    app.use('/', express.static('web/host'))

    return httpServer
}
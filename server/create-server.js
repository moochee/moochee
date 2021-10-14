'use strict'

import http from 'http'
import express from 'express'
import auth from './auth.js'
import quizSocketServer from './quiz-socket-server.js'

export default function createServer(config) {
    const app = express()
    const login = auth(app, config)
    const httpServer = http.createServer(app)
    quizSocketServer(httpServer)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))

    app.use('/', login)
    app.use('/', express.static('web/host'))

    return httpServer
}
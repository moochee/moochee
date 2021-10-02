'use strict'

import http from 'http'
import express from 'express'
import auth from './auth.js'
import quizSocketServer from './quiz-socket-server.js'

const app = express()
auth(app)
app.use('/public', express.static('public'))
app.use('/play', express.static('web/play'))
app.use('/', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).end('Not authenticated!')
    }
    next()
})
app.use('/', express.static('web/host'))

const server = http.createServer(app)
quizSocketServer(server)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server started at ${port}`)
})
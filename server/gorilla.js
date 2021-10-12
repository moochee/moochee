'use strict'

import http from 'http'
import express from 'express'
import auth from './auth.js'
import quizSocketServer from './quiz-socket-server.js'

const app = express()
const login = auth(app)
app.use('/public', express.static('web/public'))
app.use('/play', express.static('web/play'))
app.use('/', login)
app.use('/', express.static('web/host'))

const server = http.createServer(app)
quizSocketServer(server)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server started at ${port}`)
})
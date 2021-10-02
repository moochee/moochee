'use strict'

import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'

const app = express()
app.use('/', express.static('public'))

const server = http.createServer(app)
quizSocketServer(server)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server started at ${port}`)
})
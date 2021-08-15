'use strict'

import express from 'express'
import http from 'http'
import quizSocketServer from './quiz-socket-server.js'
import jsx from './jsx.cjs'

const app = express()

app.use(jsx)

app.use(express.static('public'))

const server = http.createServer(app)

quizSocketServer().attach(server)

const listener = server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on *:${listener.address().port}`)
})

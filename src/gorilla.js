'use strict'

import { createServer } from 'http'
import serve from 'serve-handler'
import quizSocketServer from './quiz-socket-server.js'

const server = createServer((req, res) => serve(req, res, { public: 'public' }))
quizSocketServer(server)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server started at ${port}`)
})